import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatRupiah } from "@/lib/format";
import { getSetting } from "@/lib/settings";
import { PrintButton } from "@/components/print-button";

const STATUS_LABEL: Record<string, string> = {
    PENDING: "Menunggu Pembayaran",
    PAID: "LUNAS",
    PROCESSING: "Diproses",
    SHIPPED: "Dikirim",
    COMPLETED: "Selesai",
    CANCELLED: "Dibatalkan",
};

export default async function CetakResiPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const [order, storeName, paperSize] = await Promise.all([
        prisma.order.findUnique({
            where: { id },
            include: {
                user: true,
                items: { include: { product: true } },
                payment: true,
                shippingMethod: true,
            },
        }),
        getSetting("store_name", "Toko Online"),
        getSetting("print_paper_size", "A4"),
    ]);

    if (!order) notFound();

    const paperStyles: Record<string, string> = {
        A4: "@page { margin: 1.5cm; size: A4; }",
        Letter: "@page { margin: 1.5cm; size: letter; }",
        Thermal80: "@page { margin: 5mm; size: 80mm 297mm; } body { font-size: 10px; } .header h1 { font-size: 14px; } table { font-size: 9px; } th, td { padding: 3px 4px; }",
        Thermal58: "@page { margin: 3mm; size: 58mm 297mm; } body { font-size: 9px; } .header h1 { font-size: 12px; } table { font-size: 8px; } th, td { padding: 2px 3px; }",
    };

    return (
        <>
            <style>{`
        ${paperStyles[paperSize] ?? paperStyles.A4}
        body { font-family: Arial, sans-serif; font-size: 12px; color: #1a1a1a; line-height: 1.5; margin: 0; padding: 0; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 16px; }
          .header h1 { font-size: 20px; margin: 0 0 4px; }
          .header p { margin: 0; color: #555; font-size: 11px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 12px; }
          .col { flex: 1; }
          .col h3 { font-size: 11px; text-transform: uppercase; color: #888; margin: 0 0 4px; }
          .col p { margin: 0; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          th, td { text-align: left; padding: 6px 8px; font-size: 12px; border-bottom: 1px solid #e5e5e5; }
          th { background: #f5f5f5; font-size: 10px; text-transform: uppercase; color: #666; }
          .text-right { text-align: right; }
          .total { font-size: 14px; font-weight: bold; border-top: 2px solid #000; }
          .footer { margin-top: 24px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #e5e5e5; padding-top: 12px; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; }
          .badge-paid { background: #d4edda; color: #155724; }
          .badge-pending { background: #fff3cd; color: #856404; }
          .badge-cancelled { background: #f8d7da; color: #721c24; }
          .badge-other { background: #cce5ff; color: #004085; }
          @media print {
            .no-print { display: none; }
            button { display: none; }
          }
        `}</style>
            <PrintButton />

            <div style={{ maxWidth: "700px", margin: "0 auto", padding: "12px" }}>
                {/* Header */}
                <div className="header">
                    <h1>{storeName}</h1>
                    <p>Resi Pesanan — #{order.id}</p>
                </div>

                {/* Info */}
                <div className="row">
                    <div className="col">
                        <h3>Pelanggan</h3>
                        <p><strong>{order.user.name ?? "-"}</strong></p>
                        <p>{order.user.email}</p>
                        {order.user.phone && <p>{order.user.phone}</p>}
                    </div>
                    <div className="col" style={{ textAlign: "right" }}>
                        <h3>Status</h3>
                        <span className={`badge ${order.status === "PAID" || order.status === "COMPLETED" ? "badge-paid" :
                                order.status === "PENDING" ? "badge-pending" :
                                    order.status === "CANCELLED" ? "badge-cancelled" : "badge-other"
                            }`}>
                            {STATUS_LABEL[order.status] ?? order.status}
                        </span>
                        <p style={{ marginTop: 4, fontSize: 11, color: "#888" }}>
                            {order.createdAt.toLocaleString("id-ID")}
                        </p>
                    </div>
                </div>

                {/* Alamat */}
                <div className="row">
                    <div className="col">
                        <h3>Alamat Pengiriman</h3>
                        <p style={{ whiteSpace: "pre-line" }}>{order.shippingAddress}</p>
                    </div>
                </div>

                {/* Items */}
                <table>
                    <thead>
                        <tr>
                            <th>Produk</th>
                            <th className="text-right">Qty</th>
                            <th className="text-right">Harga</th>
                            <th className="text-right">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items.map((item) => (
                            <tr key={item.id}>
                                <td>{item.product.name}</td>
                                <td className="text-right">{item.quantity}</td>
                                <td className="text-right">{formatRupiah(item.price)}</td>
                                <td className="text-right">{formatRupiah(item.price * item.quantity)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Total */}
                <table>
                    <tbody>
                        <tr>
                            <td colSpan={3} className="text-right" style={{ border: "none" }}>Subtotal</td>
                            <td className="text-right" style={{ border: "none" }}>
                                {formatRupiah(order.total - order.shippingCost)}
                            </td>
                        </tr>
                        {order.shippingMethod && (
                            <tr>
                                <td colSpan={3} className="text-right" style={{ border: "none", color: "#666" }}>
                                    Ongkir ({order.shippingMethod.name})
                                </td>
                                <td className="text-right" style={{ border: "none", color: "#666" }}>
                                    {formatRupiah(order.shippingCost)}
                                </td>
                            </tr>
                        )}
                        <tr>
                            <td colSpan={3} className="text-right total" style={{ border: "none" }}>
                                Total
                            </td>
                            <td className="text-right total" style={{ border: "none" }}>
                                {formatRupiah(order.total)}
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Payment Info */}
                {order.payment && (
                    <div style={{ marginTop: 16, padding: 12, background: "#f9f9f9", borderRadius: 8, fontSize: 11 }}>
                        <h3 style={{ margin: "0 0 8px" }}>Info Pembayaran</h3>
                        <p style={{ margin: "0 0 4px" }}>Metode: <strong>{order.payment.provider.toUpperCase()}</strong></p>
                        <p style={{ margin: "0 0 4px" }}>Status: <strong>{order.payment.status}</strong></p>
                        {order.payment.transactionId && <p style={{ margin: 0 }}>ID Transaksi: <strong>{order.payment.transactionId}</strong></p>}
                    </div>
                )}

                <div className="footer">
                    Terima kasih telah berbelanja di {storeName}.<br />
                    Dicetak pada {new Date().toLocaleString("id-ID")}
                </div>
            </div>
        </>
    );
}
