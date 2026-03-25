type DashboardListPanelProps = {
  title: string;
  totalLabel: string;
  children: React.ReactNode;
};

export function DashboardListPanel({ title, totalLabel, children }: DashboardListPanelProps) {
  return (
    <article className="rounded-[1.75rem] border border-border bg-surface px-6 py-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted">Lista</p>
          <h2 className="mt-2 text-2xl font-semibold">{title}</h2>
        </div>
        <span className="rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent">{totalLabel}</span>
      </div>
      <div className="mt-6 space-y-3">{children}</div>
    </article>
  );
}
