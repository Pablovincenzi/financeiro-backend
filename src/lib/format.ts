export function parseCurrencyToNumber(value: string) {
  return Number.parseFloat(value.replace(/\./g, "").replace(",", "."));
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

