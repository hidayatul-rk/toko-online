"use client";

export function PrintButton() {
    return (
        <div className="no-print" style={{ textAlign: "right", padding: "12px", background: "#f0f0f0" }}>
            <button
                onClick={() => window.print()}
                style={{
                    padding: "8px 20px",
                    cursor: "pointer",
                    fontSize: "14px",
                    background: "#000",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                }}
            >
                🖨️ Cetak Resi
            </button>
        </div>
    );
}
