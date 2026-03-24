import Link from "next/link";

import { requireCurrentUser } from "@/lib/auth";
import { formatCurrency } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const { userId } = await requireCurrentUser();

  const [receitas, despesas, contasFixas, cartoes, compras, faturas, pixTransacoes, recebiveis] = await Promise.all([
    prisma.receita.findMany({ where: { usuarioId: userId } }),
    prisma.despesa.findMany({ where: { usuarioId: userId } }),
    prisma.contaFixa.findMany({ where: { usuarioId: userId, ativa: true } }),
    prisma.cartao.findMany({ where: { usuarioId: userId, ativo: true } }),
    prisma.compraCartao.findMany({ where: { usuarioId: userId } }),
    prisma.faturaCartao.findMany({ where: { usuarioId: userId } }),
    prisma.pixTransacao.findMany({ where: { usuarioId: userId } }),
    prisma.recebivel.findMany({ where: { usuarioId: userId } }),
  ]);

  const totalReceitas = receitas.reduce((sum, item) => sum + Number(item.valor), 0);
  const totalDespesas = despesas.reduce((sum, item) => sum + Number(item.valor), 0);
  const totalContasFixas = contasFixas.reduce((sum, item) => sum + Number(item.valorPrevisto), 0);
  const totalCompras = compras.reduce((sum, item) => sum + Number(item.valor), 0);
  const totalFaturas = faturas.reduce((sum, item) => sum + Number(item.valorTotal), 0);
  const totalPixRecebidos = pixTransacoes.filter((item) => item.tipo === "recebido").reduce((sum, item) => sum + Number(item.valor), 0);
  const totalPixEnviados = pixTransacoes.filter((item) => item.tipo === "enviado").reduce((sum, item) => sum + Number(item.valor), 0);
  const totalRecebiveis = recebiveis.filter((item) => item.status !== "recebido").reduce((sum, item) => sum + Number(item.valorPrevisto), 0);
  const saldoProjetado = totalReceitas + totalPixRecebidos + totalRecebiveis - totalDespesas - totalContasFixas - totalCompras - totalPixEnviados;

  return (
    <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-[1.75rem] border border-border bg-surface px-5 py-5">
          <p className="text-sm text-muted">Receitas</p>
          <h2 className="mt-3 text-3xl font-semibold">{formatCurrency(totalReceitas)}</h2>
          <p className="mt-2 text-sm text-muted">{receitas.length} itens cadastrados.</p>
        </article>
        <article className="rounded-[1.75rem] border border-border bg-surface px-5 py-5">
          <p className="text-sm text-muted">Despesas</p>
          <h2 className="mt-3 text-3xl font-semibold">{formatCurrency(totalDespesas)}</h2>
          <p className="mt-2 text-sm text-muted">{despesas.length} itens cadastrados.</p>
        </article>
        <article className="rounded-[1.75rem] border border-border bg-surface px-5 py-5">
          <p className="text-sm text-muted">Contas fixas</p>
          <h2 className="mt-3 text-3xl font-semibold">{formatCurrency(totalContasFixas)}</h2>
          <p className="mt-2 text-sm text-muted">{contasFixas.length} obrigacoes ativas.</p>
        </article>
        <article className="rounded-[1.75rem] border border-border bg-surface px-5 py-5">
          <p className="text-sm text-muted">Cartoes ativos</p>
          <h2 className="mt-3 text-3xl font-semibold">{cartoes.length}</h2>
          <p className="mt-2 text-sm text-muted">Cartoes prontos para compras e faturas.</p>
        </article>
        <article className="rounded-[1.75rem] border border-border bg-surface px-5 py-5">
          <p className="text-sm text-muted">Compras no cartao</p>
          <h2 className="mt-3 text-3xl font-semibold">{formatCurrency(totalCompras)}</h2>
          <p className="mt-2 text-sm text-muted">{compras.length} compras lancadas.</p>
        </article>
        <article className="rounded-[1.75rem] border border-border bg-surface px-5 py-5">
          <p className="text-sm text-muted">Faturas</p>
          <h2 className="mt-3 text-3xl font-semibold">{formatCurrency(totalFaturas)}</h2>
          <p className="mt-2 text-sm text-muted">{faturas.length} faturas cadastradas.</p>
        </article>
        <article className="rounded-[1.75rem] border border-border bg-surface px-5 py-5">
          <p className="text-sm text-muted">PIX recebidos</p>
          <h2 className="mt-3 text-3xl font-semibold">{formatCurrency(totalPixRecebidos)}</h2>
          <p className="mt-2 text-sm text-muted">Entradas via PIX registradas.</p>
        </article>
        <article className="rounded-[1.75rem] border border-border bg-surface px-5 py-5">
          <p className="text-sm text-muted">PIX enviados</p>
          <h2 className="mt-3 text-3xl font-semibold">{formatCurrency(totalPixEnviados)}</h2>
          <p className="mt-2 text-sm text-muted">Saidas via PIX registradas.</p>
        </article>
        <article className="rounded-[1.75rem] border border-border bg-surface px-5 py-5">
          <p className="text-sm text-muted">Valores a receber</p>
          <h2 className="mt-3 text-3xl font-semibold">{formatCurrency(totalRecebiveis)}</h2>
          <p className="mt-2 text-sm text-muted">{recebiveis.filter((item) => item.status !== "recebido").length} recebiveis em aberto.</p>
        </article>
      </div>

      <aside className="rounded-[1.75rem] border border-border bg-[#1f2937] px-6 py-6 text-white">
        <p className="text-sm uppercase tracking-[0.2em] text-white/70">Etapa 7</p>
        <h2 className="mt-3 text-2xl font-semibold">PIX e recebiveis integrados ao controle financeiro.</h2>
        <p className="mt-3 text-sm leading-7 text-white/75">
          Agora o projeto acompanha entradas e saidas via PIX, alem de valores previstos a receber com status e data esperada.
        </p>
        <div className="mt-6 grid gap-3">
          <div className="rounded-2xl bg-white/8 px-4 py-4">
            <p className="text-sm text-white/65">Saldo projetado</p>
            <strong className="mt-2 block text-3xl">{formatCurrency(saldoProjetado)}</strong>
          </div>
          <Link className="rounded-2xl bg-accent px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-accent-strong" href="/dashboard/pix">
            Abrir PIX
          </Link>
          <Link className="rounded-2xl border border-white/15 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/8" href="/dashboard/recebiveis">
            Abrir recebiveis
          </Link>
        </div>
      </aside>
    </section>
  );
}
