import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

interface MidtransNotification {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
  transaction_status: string;
  fraud_status?: string;
}

async function getServerKey(): Promise<string> {
  // Cek DB dulu, fallback ke .env
  try {
    const setting = await prisma.setting.findUnique({ where: { key: "midtrans_server_key" } });
    if (setting?.value) return setting.value;
  } catch { /* fallback */ }
  return process.env.MIDTRANS_SERVER_KEY ?? "";
}

async function isValidSignature(notification: MidtransNotification) {
  const serverKey = await getServerKey();
  const raw =
    notification.order_id +
    notification.status_code +
    notification.gross_amount +
    serverKey;
  const expected = crypto.createHash("sha512").update(raw).digest("hex");
  return expected === notification.signature_key;
}

function mapOrderStatus(transactionStatus: string, fraudStatus?: string) {
  if (transactionStatus === "capture") {
    return fraudStatus === "accept" ? "PAID" : "PENDING";
  }
  if (transactionStatus === "settlement") return "PAID";
  if (["cancel", "deny", "expire"].includes(transactionStatus)) return "CANCELLED";
  return "PENDING";
}

export async function POST(request: NextRequest) {
  const notification = (await request.json()) as MidtransNotification;

  if (!(await isValidSignature(notification))) {
    return NextResponse.json({ message: "Invalid signature" }, { status: 403 });
  }

  const orderStatus = mapOrderStatus(
    notification.transaction_status,
    notification.fraud_status
  );

  await prisma.order.update({
    where: { id: notification.order_id },
    data: {
      status: orderStatus,
      payment: {
        update: {
          status: notification.transaction_status,
          rawResponse: notification as unknown as object,
        },
      },
    },
  });

  return NextResponse.json({ message: "OK" });
}
