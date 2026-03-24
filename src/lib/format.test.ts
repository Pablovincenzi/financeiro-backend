import { describe, expect, it } from "vitest";

import {
  buildMonthRange,
  currentMonthValue,
  formatCurrency,
  formatMonthLabel,
  parseCurrencyToNumber,
} from "@/lib/format";

describe("format helpers", () => {
  it("converte moeda brasileira para numero", () => {
    expect(parseCurrencyToNumber("1234,56")).toBe(1234.56);
    expect(parseCurrencyToNumber("99.90")).toBe(99.9);
  });

  it("formata moeda em BRL", () => {
    expect(formatCurrency(1500)).toContain("1.500");
  });

  it("gera range correto para mes", () => {
    const { start, end } = buildMonthRange("2026-03");
    expect(start.getFullYear()).toBe(2026);
    expect(start.getMonth()).toBe(2);
    expect(start.getDate()).toBe(1);
    expect(end.getDate()).toBe(31);
  });

  it("gera valor mensal atual no formato AAAA-MM", () => {
    expect(currentMonthValue()).toMatch(/^\d{4}-\d{2}$/);
  });

  it("formata rotulo mensal", () => {
    expect(formatMonthLabel("2026-03").toLowerCase()).toContain("2026");
  });
});
