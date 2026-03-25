import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { LogoutButton } from "@/components/auth/logout-button";
import { DashboardSidebarNav } from "@/components/dashboard/dashboard-sidebar-nav";
import { getCurrentSession } from "@/lib/auth";

const roleLabel: Record<string, string> = {
  usuario: "Usuario",
  gerente: "Gerente",
  administrador: "Administrador",
};

const links = [
  { href: "/dashboard", label: "Resumo", shortLabel: "RS" },
  { href: "/dashboard/relatorios", label: "Relatorios", shortLabel: "RL" },
  { href: "/dashboard/receitas", label: "Receitas", shortLabel: "RC" },
  { href: "/dashboard/despesas", label: "Despesas", shortLabel: "DP" },
  { href: "/dashboard/categorias", label: "Categorias", shortLabel: "CT" },
  { href: "/dashboard/contas-fixas", label: "Contas fixas", shortLabel: "CF" },
  { href: "/dashboard/cartoes", label: "Cartoes", shortLabel: "CR" },
  { href: "/dashboard/compras-cartao", label: "Compras", shortLabel: "CP" },
  { href: "/dashboard/faturas", label: "Faturas", shortLabel: "FT" },
  { href: "/dashboard/pix", label: "PIX", shortLabel: "PX" },
];

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getCurrentSession();

  if (!session?.user) {
    redirect("/login");
  }

  const nivelAcesso = session.user.nivelAcesso ?? "usuario";

  return (
    <div className="min-h-screen px-3 py-3 lg:px-4 lg:py-4">
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] w-full max-w-[1600px] gap-4 lg:grid-cols-[290px_minmax(0,1fr)]">
        <aside className="overflow-hidden rounded-[2rem] bg-[linear-gradient(180deg,_#0f172a,_#152238_42%,_#17283f_100%)] px-5 py-5 text-white shadow-[0_30px_90px_rgba(15,23,42,0.34)]">
          <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <span className="inline-flex rounded-full border border-white/14 bg-white/6 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-slate-300">
                Financeiro
              </span>
              <h1 className="mt-4 text-2xl font-semibold tracking-tight">Painel de operacao</h1>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Navegue pelos modulos financeiros com foco em leitura rapida e acoes diretas.
              </p>
            </div>
            <div className="hidden h-12 w-12 rounded-2xl bg-[linear-gradient(145deg,_rgba(47,111,191,0.9),_rgba(242,125,36,0.9))] lg:block" />
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/6 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.26em] text-slate-400">Sessao ativa</p>
            <h2 className="mt-3 text-lg font-semibold text-white">{session.user.name}</h2>
            <p className="mt-1 text-sm text-slate-400">
              Perfil <span className="text-slate-200">{roleLabel[nivelAcesso] ?? nivelAcesso}</span>
            </p>
          </div>

          <div className="mt-6">
            <p className="mb-3 text-xs uppercase tracking-[0.28em] text-slate-500">Menu</p>
            <DashboardSidebarNav links={links} />
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-orange-400/20 bg-[linear-gradient(180deg,_rgba(242,125,36,0.18),_rgba(15,23,42,0.05))] px-4 py-4">
            <p className="text-xs uppercase tracking-[0.26em] text-orange-100/70">Atalho</p>
            <p className="mt-3 text-sm leading-6 text-slate-100">
              Use categorias para organizar despesas e liberar o acesso por usuario com mais controle.
            </p>
          </div>

          <div className="mt-6">
            <LogoutButton />
          </div>
        </aside>

        <div className="flex min-h-0 flex-col gap-4">
          <header className="rounded-[2rem] border border-white/70 bg-white/82 px-5 py-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-muted">Workspace</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Controle financeiro pessoal</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                  Uma superficie mais limpa para acompanhar fluxo de caixa, organizar categorias e navegar entre os modulos sem excesso de ruido visual.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[340px]">
                <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Acesso</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{roleLabel[nivelAcesso] ?? nivelAcesso}</p>
                </div>
                <div className="rounded-[1.4rem] border border-orange-200 bg-orange-50 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-orange-600">Ambiente</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">Operacao diaria</p>
                </div>
              </div>
            </div>
          </header>

          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
