import { formatCurrency } from "@/lib/format";

type ExpenseTagSlice = {
  label: string;
  total: number;
  count: number;
};

type ExpenseTagPieChartProps = {
  data: ExpenseTagSlice[];
  total: number;
};

const SLICE_COLORS = [
  "#2f6fbf",
  "#f27d24",
  "#4f86c6",
  "#f59e0b",
  "#1d4f91",
  "#d45f08",
  "#8bb4e8",
  "#f6b26b",
];

export function ExpenseTagPieChart({ data, total }: ExpenseTagPieChartProps) {
  const normalizedData = data.filter((item) => item.total > 0);

  if (normalizedData.length === 0 || total <= 0) {
    return (
      <div className="rounded-[1.75rem] border border-border bg-surface px-6 py-6">
        <p className="text-sm uppercase tracking-[0.2em] text-muted">Despesas por tag</p>
        <p className="mt-4 rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-muted">
          Ainda nao existem despesas suficientes no periodo para montar o grafico.
        </p>
      </div>
    );
  }

  const slices = normalizedData.reduce<Array<ExpenseTagSlice & { color: string; percentage: number; dash: number; offset: number }>>((accumulator, item, index) => {
    const accumulated = accumulator.reduce((sum, current) => sum + current.dash, 0);
    const fraction = item.total / total;
    const dash = fraction * 100;

    accumulator.push({
      ...item,
      color: SLICE_COLORS[index % SLICE_COLORS.length],
      percentage: fraction * 100,
      dash,
      offset: 100 - accumulated,
    });

    return accumulator;
  }, []);

  return (
    <article className="rounded-[1.75rem] border border-border bg-surface px-6 py-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.2em] text-muted">Despesas por tag</p>
        <h2 className="text-2xl font-semibold">Distribuicao visual dos gastos</h2>
        <p className="text-sm text-muted">Veja rapidamente quais tags concentram mais despesas no recorte atual.</p>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[320px_1fr] xl:items-center">
        <div className="flex items-center justify-center">
          <div className="relative h-64 w-64">
            <svg viewBox="0 0 42 42" className="h-full w-full -rotate-90 drop-shadow-[0_14px_32px_rgba(47,111,191,0.14)]">
              <circle cx="21" cy="21" r="15.9155" fill="transparent" stroke="#e2e8f0" strokeWidth="5" />
              {slices.map((slice) => (
                <circle
                  key={slice.label}
                  cx="21"
                  cy="21"
                  r="15.9155"
                  fill="transparent"
                  stroke={slice.color}
                  strokeWidth="5"
                  strokeDasharray={`${slice.dash} ${100 - slice.dash}`}
                  strokeDashoffset={slice.offset}
                  strokeLinecap="butt"
                />
              ))}
            </svg>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xs uppercase tracking-[0.24em] text-muted">Total</span>
              <strong className="mt-2 text-2xl text-slate-900">{formatCurrency(total)}</strong>
              <span className="mt-1 text-sm text-muted">{normalizedData.length} tags no grafico</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {slices.map((slice) => (
            <div key={slice.label} className="flex items-center justify-between gap-4 rounded-2xl border border-border px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: slice.color }} />
                <div>
                  <strong className="block text-sm text-slate-900">{slice.label}</strong>
                  <span className="text-sm text-muted">{slice.count} lancamentos</span>
                </div>
              </div>
              <div className="text-right">
                <strong className="block text-sm text-slate-900">{formatCurrency(slice.total)}</strong>
                <span className="text-sm text-muted">{slice.percentage.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
