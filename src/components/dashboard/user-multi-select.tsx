"use client";

import { useMemo, useState } from "react";

type Option = {
  id: number;
  label: string;
};

type UserMultiSelectProps = {
  name: string;
  options: Option[];
  defaultSelectedIds: string[];
};

export function UserMultiSelect({ name, options, defaultSelectedIds }: UserMultiSelectProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(defaultSelectedIds);

  const selectedLabels = useMemo(() => {
    const selected = options.filter((option) => selectedIds.includes(String(option.id)));

    if (selected.length === 0) {
      return "Selecionar usuarios";
    }

    if (selected.length <= 2) {
      return selected.map((option) => option.label).join(", ");
    }

    return `${selected.length} usuarios selecionados`;
  }, [options, selectedIds]);

  function toggleUser(id: string, checked: boolean) {
    setSelectedIds((current) => {
      if (checked) {
        return current.includes(id) ? current : [...current, id];
      }

      return current.filter((item) => item !== id);
    });
  }

  return (
    <details className="rounded-2xl border border-border bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm text-foreground">
        <span className="truncate">{selectedLabels}</span>
        <span className="text-xs uppercase tracking-[0.2em] text-muted">Abrir</span>
      </summary>

      <div className="border-t border-border px-4 py-3">
        <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
          {options.map((option) => {
            const value = String(option.id);
            const checked = selectedIds.includes(value);

            return (
              <label
                key={option.id}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition hover:bg-surface-strong"
              >
                <input
                  type="checkbox"
                  name={name}
                  value={value}
                  checked={checked}
                  onChange={(event) => toggleUser(value, event.target.checked)}
                  className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                />
                <span>{option.label}</span>
              </label>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-muted">Selecione um ou mais usuarios que terao acesso a esta categoria.</p>
      </div>
    </details>
  );
}
