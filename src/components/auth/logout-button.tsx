"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="w-full rounded-[1.15rem] border border-white/12 bg-white/6 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
    >
      Encerrar sessao
    </button>
  );
}
