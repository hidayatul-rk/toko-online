"use client";

import { useState } from "react";
import { exportOrdersCsv } from "@/lib/export-actions";

export function ExportCsvButton() {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const csv = await exportOrdersCsv();
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pesanan-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Gagal mengekspor data.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={loading}
      className="rounded-md border border-black/10 px-3 py-1.5 text-xs transition hover:bg-black/5 disabled:opacity-50 dark:border-white/10 dark:hover:bg-white/10"
    >
      {loading ? "..." : "📥 Export CSV"}
    </button>
  );
}
