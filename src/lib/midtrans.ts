import midtransClient from "midtrans-client";
import { getSetting } from "@/lib/settings";

export async function createSnap() {
  const [serverKey, clientKey, isProduction] = await Promise.all([
    getSetting("midtrans_server_key", process.env.MIDTRANS_SERVER_KEY ?? ""),
    getSetting("midtrans_client_key", process.env.MIDTRANS_CLIENT_KEY ?? ""),
    getSetting("midtrans_is_production", process.env.MIDTRANS_IS_PRODUCTION ?? "false"),
  ]);

  return new midtransClient.Snap({
    isProduction: isProduction === "true",
    serverKey,
    clientKey,
  });
}
