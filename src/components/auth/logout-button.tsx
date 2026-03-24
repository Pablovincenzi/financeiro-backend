"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-surface-strong"
    >
      Sair
    </button>
  );
}

