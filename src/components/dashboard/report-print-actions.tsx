"use client";

import { useEffect } from "react";

export function ReportPrintActions() {
  useEffect(() => {
    window.print();
  }, []);

  return (
    <div className="mb-6 flex items-center justify-end gap-3 print:hidden">
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        Imprimir / Salvar PDF
      </button>
      <button
        type="button"
        onClick={() => window.close()}
        className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
      >
        Fechar
      </button>
    </div>
  );
}
