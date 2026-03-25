import Link from "next/link";

import { buildMonthSelectionHref, type MonthOption } from "@/lib/format";

type Metric = {
  label: string;
  value: string;
  detail: string;
  valueClassName?: string;
};

type DashboardPeriodHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  pathname: string;
  selectedMonths: string[];
  monthOptions: MonthOption[];
  metrics: Metric[];
  extraParams?: Record<string, string | undefined>;
};

export function DashboardPeriodHeader({
  eyebrow,
  title,
  description,
  pathname,
  selectedMonths,
  monthOptions,
  metrics,
  extraParams,
}: DashboardPeriodHeaderProps) {
  return (
    <article className="overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(140deg,_rgba(15,23,42,0.96),_rgba(30,41,59,0.92)_48%,_rgba(47,111,191,0.92)_100%)] px-6 py-6 text-white shadow-[0_30px_90px_rgba(15,23,42,0.2)]">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-300">{eyebrow}</p>
          <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight">{title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200/80">{description}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {monthOptions.map((option) => {
              const isActive = selectedMonths.includes(option.value);

              return (
                <Link
                  key={option.value}
                  href={buildMonthSelectionHref(pathname, selectedMonths, option.value, extraParams)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-orange-400 text-slate-950"
                      : "border border-white/14 bg-white/6 text-slate-100 hover:bg-white/10"
                  }`}
                >
                  {option.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="grid gap-3 self-start">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-[1.45rem] border border-white/10 bg-white/8 px-4 py-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-300">{metric.label}</p>
              <h3 className={`mt-2 text-3xl font-semibold ${metric.valueClassName ?? "text-slate-50"}`}>{metric.value}</h3>
              <p className="mt-2 text-sm text-slate-200/75">{metric.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
