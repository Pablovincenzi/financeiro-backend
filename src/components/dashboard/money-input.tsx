"use client";

import { useMemo, useState } from "react";

type MoneyInputProps = {
  name: string;
  defaultValue?: string | number | null;
  placeholder?: string;
  required?: boolean;
  className?: string;
};

function normalizeToDigits(value: string) {
  return value.replace(/\D/g, "");
}

function formatDigitsToMoney(digits: string) {
  const normalized = digits.replace(/^0+/, "") || "0";
  const padded = normalized.padStart(3, "0");
  const cents = padded.slice(-2);
  const integer = padded.slice(0, -2);
  const integerFormatted = Number(integer).toLocaleString("pt-BR");

  return `${integerFormatted},${cents}`;
}

function toInitialDisplay(value?: string | number | null) {
  if (value == null || value === "") {
    return "";
  }

  const numeric = typeof value === "number" ? value : Number(String(value).replace(/\./g, "").replace(",", "."));

  if (!Number.isFinite(numeric)) {
    return String(value);
  }

  return numeric.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function MoneyInput({ name, defaultValue, placeholder, required, className }: MoneyInputProps) {
  const initialDisplay = useMemo(() => toInitialDisplay(defaultValue), [defaultValue]);
  const [displayValue, setDisplayValue] = useState(initialDisplay);

  return (
    <input
      type="text"
      inputMode="numeric"
      name={name}
      value={displayValue}
      onChange={(event) => {
        const digits = normalizeToDigits(event.target.value);
        setDisplayValue(digits ? formatDigitsToMoney(digits) : "");
      }}
      placeholder={placeholder}
      required={required}
      className={className}
    />
  );
}
