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

type MappedOrderStatus = "PENDING" | "PAID" | "CANCELLED";

async function getServerKey(): Promise<string> {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: "midtrans_server_key" } });
    if (setting?.value) return setting.value;
  } catch {
    // Fall back to the environment variable when the database setting is unavailable.
  }
  return process.env.MIDTRANS_SERVER_KEY ?? "";
}

async function isValidSignature(notification: MidtransNotification) {
  const serverKey = await getServerKey();
  if (!serverKey) return false;
  const raw = notification.order_id + notification.status_code + notification.gross_amount + serverKey;
  const expected = crypto.createHash("sha512").update(raw).digest("hex");
  const provided = Buffer.from(notification.signature_key);
  const expectedBuffer = Buffer.from(expected);
  return provided.length === expectedBuffer.length && crypto.timingSafeEqual(expectedBuffer, provided);
}

function mapOrderStatus(transactionStatus: string, fraudStatus?: string): MappedOrderStatus | null {
  if (transactionStatus === "capture") return fraudStatus === "accept" ? "PAID" : "PENDING";
  if (transactionStatus === "settlement") return "PAID";
  if (["cancel", "deny", "expire"].includes(transactionStatus)) return "CANCELLED";
  return null;
}

function shouldApplyNotification(current: string, incoming: MappedOrderStatus) {
  if (current === incoming) return true;
  if (current === "CANCELLED") return false;
  if (incoming === "CANCELLED") return current === "PENDING";

  const rank: Record<string, number> = {
    PENDING: 0,
    PAID: 1,
    PROCESSING: 2,
    SHIPPED: 3,
    COMPLETED: 4,
  };
  return (rank[incoming] ?? -1) >= (rank[current] ?? -1);
}

export async function POST(request: NextRequest) {
  try {
    const notification = (await request.json()) as MidtransNotification;
    if (
      !notification.order_id ||
      !notification.status_code ||
      !notification.signature_key ||
      !notification.gross_amount ||
      !notification.transaction_status
    ) {
      return NextResponse.json({ message: "Invalid notification" }, { status: 400 });
    }

    if (!(await isValidSignature(notification))) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 403 });
    }

    const incomingStatus = mapOrderStatus(notification.transaction_status, notification.fraud_status);
    if (!incomingStatus) {
      return NextResponse.json({ message: "Unsupported transaction status" }, { status: 400 });
    }

    const grossAmount = Number(notification.gross_amount);
    if (!Number.isSafeInteger(grossAmount) || grossAmount < 0) {
      return NextResponse.json({ message: "Invalid amount" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: notification.order_id },
      include: { payment: true },
    });
    if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });
    if (grossAmount !== order.total) return NextResponse.json({ message: "Amount mismatch" }, { status: 400 });

    await prisma.$transaction(async (tx) => {
      const current = await tx.order.findUnique({ where: { id: order.id }, select: { status: true } });
      if (!current || !shouldApplyNotification(current.status, incomingStatus)) return;

      const updated = await tx.order.updateMany({
        where: { id: order.id, status: current.status },
        data: { status: incomingStatus },
      });
      if (updated.count !== 1) return;

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
