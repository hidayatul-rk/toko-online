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
  transaction_id?: string;
}

async function getServerKey(): Promise<string> {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: "midtrans_server_key" } });
    if (setting?.value) return setting.value;
  } catch { /* fallback */ }
  return process.env.MIDTRANS_SERVER_KEY ?? "";
}

async function isValidSignature(notification: MidtransNotification) {
  const serverKey = await getServerKey();
  const raw = notification.order_id + notification.status_code + notification.gross_amount + serverKey;
  const expected = crypto.createHash("sha512").update(raw).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(notification.signature_key));
}

function mapOrderStatus(transactionStatus: string, fraudStatus?: string) {
  if (transactionStatus === "capture") return fraudStatus === "accept" ? "PAID" : "PENDING";
  if (transactionStatus === "settlement") return "PAID";
  if (["cancel", "deny", "expire"].includes(transactionStatus)) return "CANCELLED";
  return "PENDING";
}

const rank: Record<string, number> = {
  PENDING: 0,
  PAID: 1,
  PROCESSING: 2,
  SHIPPED: 3,
  COMPLETED: 4,
  CANCELLED: -1,
};

export async function POST(request: NextRequest) {
  try {
    const notification = (await request.json()) as MidtransNotification;
    if (!notification.order_id || !notification.signature_key || !notification.gross_amount) {
      return NextResponse.json({ message: "Invalid notification" }, { status: 400 });
    }

    if (!(await isValidSignature(notification))) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 403 });
    }

    const order = await prisma.order.findUnique({
      where: { id: notification.order_id },
      include: { payment: true },
    });
    if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });

    const grossAmount = Number(notification.gross_amount);
    if (!Number.isSafeInteger(grossAmount) || grossAmount !== order.total) {
      return NextResponse.json({ message: "Amount mismatch" }, { status: 400 });
    }

    const incomingStatus = mapOrderStatus(notification.transaction_status, notification.fraud_status);
    const currentRank = rank[order.status] ?? 0;
    const incomingRank = rank[incomingStatus] ?? 0;

    // Ignore stale notifications; never move a completed/paid order backward to pending.
    if (order.status !== incomingStatus && incomingRank < currentRank && incomingStatus !== "CANCELLED") {
      return NextResponse.json({ message: "Stale notification ignored" });
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { status: incomingStatus },
      });
      await tx.payment.update({
        where: { orderId: order.id },
        data: {
          status: notification.transaction_status,
          transactionId: notification.transaction_id ?? order.payment?.transactionId,
          rawResponse: notification as unknown as object,
        },
      });
    });

    return NextResponse.json({ message: "OK" });
  } catch {
    return NextResponse.json({ message: "Webhook processing failed" }, { status: 500 });
  }
}
