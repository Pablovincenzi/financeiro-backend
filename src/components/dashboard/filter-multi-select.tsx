"use client";

import { useMemo, useState } from "react";

type Option = {
  id: number;
  label: string;
};

type FilterMultiSelectProps = {
  name: string;
  options: Option[];
  defaultSelectedIds: string[];
  placeholder: string;
  helperText?: string;
};

export function FilterMultiSelect({
  name,
  options,
  defaultSelectedIds,
  placeholder,
  helperText,
}: FilterMultiSelectProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(defaultSelectedIds);

  const selectedLabel = useMemo(() => {
    const selectedOptions = options.filter((option) => selectedIds.includes(String(option.id)));

    if (selectedOptions.length === 0) {
      return placeholder;
    }

    if (selectedOptions.length <= 2) {
      return selectedOptions.map((option) => option.label).join(", ");
    }

    return `${selectedOptions.length} selecionadas`;
  }, [options, placeholder, selectedIds]);

  function toggleOption(id: string, checked: boolean) {
    setSelectedIds((current) => {
      if (checked) {
        return current.includes(id) ? current : [...current, id];
      }

      return current.filter((item) => item !== id);
    });
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={selectedIds.join(",")} />
      <details className="rounded-2xl border border-border bg-white">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm text-foreground">
          <span className="truncate">{selectedLabel}</span>
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
                    checked={checked}
                    onChange={(event) => toggleOption(value, event.target.checked)}
                    className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                  />
                  <span>{option.label}</span>
                </label>
              );
            })}
          </div>
          {helperText ? <p className="mt-3 text-xs text-muted">{helperText}</p> : null}
        </div>
      </details>
    </div>
  );
}

