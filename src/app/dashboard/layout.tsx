import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { LogoutButton } from "@/components/auth/logout-button";
import { getCurrentSession } from "@/lib/auth";

const roleLabel: Record<string, string> = {
  usuario: "Usuario",
  gerente: "Gerente",
  administrador: "Administrador",
};

const links = [
  { href: "/dashboard", label: "Resumo" },
  { href: "/dashboard/receitas", label: "Receitas" },
  { href: "/dashboard/despesas", label: "Despesas" },
  { href: "/dashboard/contas-fixas", label: "Contas fixas" },
  { href: "/dashboard/cartoes", label: "Cartoes" },
  { href: "/dashboard/compras-cartao", label: "Compras" },
  { href: "/dashboard/faturas", label: "Faturas" },
  { href: "/dashboard/pix", label: "PIX" },
  { href: "/dashboard/recebiveis", label: "Recebiveis" },
];

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getCurrentSession();

  if (!session?.user) {
    redirect("/login");
  }

  const nivelAcesso = session.user.nivelAcesso ?? "usuario";

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-5 rounded-[2rem] border border-border bg-surface px-6 py-6 shadow-[0_18px_60px_rgba(80,64,40,0.1)] lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted">Financeiro</p>
            <h1 className="mt-2 text-3xl font-semibold">Ola, {session.user.name}</h1>
            <p className="mt-2 text-sm text-muted">
              Perfil atual: <strong className="text-foreground">{roleLabel[nivelAcesso] ?? nivelAcesso}</strong>
            </p>
          </div>

          <div className="flex flex-col gap-4 lg:items-end">
            <nav className="flex flex-wrap gap-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-surface-strong"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <LogoutButton />
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}
