export type MonthOption = {
  value: string;
  label: string;
};

export function parseCurrencyToNumber(value: string) {
  const normalized = value.trim();

  if (normalized.includes(",")) {
    return Number.parseFloat(normalized.replace(/\./g, "").replace(",", "."));
  }

  return Number.parseFloat(normalized);
}

export function formatCurrency(value: number | string) {
  const numericValue = typeof value === "string" ? Number(value) : value;

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numericValue);
}

export function formatDate(value: Date | string | null | undefined) {
  if (!value) {
    return "-";
  }

  const date = value instanceof Date ? value : new Date(value);

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  }).format(date);
}

export function formatMonthLabel(value: string) {
  const [year, month] = value.split("-").map(Number);
  const date = new Date(year, (month || 1) - 1, 1);

  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function buildMonthRange(value: string) {
  const [year, month] = value.split("-").map(Number);
  const start = new Date(year, (month || 1) - 1, 1);
  const end = new Date(year, month || 1, 0);

  return { start, end };
}

export function buildMonthRanges(values: string[]) {
  return values.map((value) => buildMonthRange(value));
}

export function currentMonthValue() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${month}`;
}

export function buildRecentMonthOptions(total = 6): MonthOption[] {
  const now = new Date();

  return Array.from({ length: total }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const value = `${date.getFullYear()}-${month}`;

    return {
      value,
      label: formatMonthLabel(value),
    };
  });
}

export function parseSelectedMonths(raw?: string | null, fallbackValue = currentMonthValue()) {
  const months = (raw ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter((value) => /^\d{4}-\d{2}$/.test(value));

  const uniqueMonths = [...new Set(months)].sort((left, right) => right.localeCompare(left));

  if (uniqueMonths.length > 0) {
    return uniqueMonths;
  }

  return [fallbackValue];
}

export function formatSelectedMonthsSummary(values: string[]) {
  if (values.length === 1) {
    return formatMonthLabel(values[0]);
  }

  return `${formatMonthLabel(values[0])} + ${values.length - 1} meses`;
}

export function buildMonthSelectionHref(
  pathname: string,
  selectedMonths: string[],
  toggledMonth: string,
  extraParams?: Record<string, string | undefined>,
) {
  const nextMonths = selectedMonths.includes(toggledMonth)
    ? selectedMonths.filter((month) => month !== toggledMonth)
    : [...selectedMonths, toggledMonth];

  const normalizedMonths = (nextMonths.length > 0 ? nextMonths : [toggledMonth]).sort((left, right) => right.localeCompare(left));
  const params = new URLSearchParams();

  params.set("months", normalizedMonths.join(","));

  Object.entries(extraParams ?? {}).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  return `${pathname}?${params.toString()}`;
}
