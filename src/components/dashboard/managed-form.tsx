"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

type ManagedFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  redirectTo?: string;
  className?: string;
  submitLabel: string;
  pendingLabel: string;
  children: ReactNode;
};

function FormPendingOverlay() {
  const { pending } = useFormStatus();

  if (!pending) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[1.75rem] bg-slate-950/18 backdrop-blur-[2px]">
      <div className="flex items-center gap-3 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-accent" />
        Salvando cadastro...
      </div>
    </div>
  );
}

function SubmitButton({ idleLabel, pendingLabel }: { idleLabel: string; pendingLabel: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-75"
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}

export function ManagedForm({ action, redirectTo, className, submitLabel, pendingLabel, children }: ManagedFormProps) {
  return (
    <form action={action} className={`relative ${className ?? ""}`.trim()}>
      {redirectTo ? <input type="hidden" name="redirectTo" value={redirectTo} /> : null}
      <FormPendingOverlay />
      {children}
      <SubmitButton idleLabel={submitLabel} pendingLabel={pendingLabel} />
    </form>
  );
}
