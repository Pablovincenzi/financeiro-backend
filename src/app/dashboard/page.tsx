import Link from "next/link";

import { requireCurrentUser } from "@/lib/auth";
import {
  buildMonthRange,
  buildRecentMonthOptions,
  currentMonthValue,
  formatCurrency,
  formatMonthLabel,
} from "@/lib/format";
import { prisma } from "@/lib/prisma";

type PageProps = {
  searchParams?: Promise<{ month?: string }>;
};

export default async function DashboardPage({ searchParams }: PageProps) {
  const { userId } = await requireCurrentUser();
  const params = searchParams ? await searchParams : undefined;
  const selectedMonth = params?.month ?? currentMonthValue();
  const { start, end } = buildMonthRange(selectedMonth);
  const monthOptions = buildRecentMonthOptions(6);

  const [receitas, despesas, contasFixas, cartoes, compras, faturas, pixTransacoes, recebiveis] = await Promise.all([
    prisma.receita.findMany({ where: { usuarioId: userId, dataRecebimento: { gte: start, lte: end } } }),
    prisma.despesa.findMany({ where: { usuarioId: userId, dataVencimento: { gte: start, lte: end } } }),
    prisma.contaFixa.findMany({ where: { usuarioId: userId, ativa: true } }),
    prisma.cartao.findMany({ where: { usuarioId: userId, ativo: true } }),
    prisma.compraCartao.findMany({ where: { usuarioId: userId, dataCompra: { gte: start, lte: end } } }),
    prisma.faturaCartao.findMany({ where: { usuarioId: userId, dataVencimento: { gte: start, lte: end } } }),
    prisma.pixTransacao.findMany({ where: { usuarioId: userId, dataPix: { gte: start, lte: end } } }),
    prisma.recebivel.findMany({ where: { usuarioId: userId, dataEsperada: { gte: start, lte: end } } }),
  ]);

  const totalReceitas = receitas.reduce((sum, item) => sum + Number(item.valor), 0);
  const totalDespesas = despesas.reduce((sum, item) => sum + Number(item.valor), 0);
  const totalContasFixas = contasFixas.reduce((sum, item) => sum + Number(item.valorPrevisto), 0);
  const totalCompras = compras.reduce((sum, item) => sum + Number(item.valor), 0);
  const totalFaturas = faturas.reduce((sum, item) => sum + Number(item.valorTotal), 0);
  const totalPixRecebidos = pixTransacoes.filter((item) => item.tipo === "recebido").reduce((sum, item) => sum + Number(item.valor), 0);
  const totalPixEnviados = pixTransacoes.filter((item) => item.tipo === "enviado").reduce((sum, item) => sum + Number(item.valor), 0);
  const totalRecebiveis = recebiveis.filter((item) => item.status !== "recebido").reduce((sum, item) => sum + Number(item.valorPrevisto), 0);
  const entradas = totalReceitas + totalPixRecebidos + totalRecebiveis;
  const saidas = totalDespesas + totalCompras + totalPixEnviados + totalContasFixas;
  const saldoProjetado = entradas - saidas;

  return (
    <section className="grid gap-4">
      <article className="rounded-[1.75rem] border border-border bg-surface px-6 py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted">Dashboard mensal</p>
            <h2 className="mt-2 text-2xl font-semibold">Resumo financeiro de {formatMonthLabel(selectedMonth)}</h2>
            <p className="mt-2 text-sm text-muted">Consolide o mes atual e navegue rapidamente entre os ultimos periodos.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {monthOptions.map((option) => (
              <Link
                key={option.value}
                href={`/dashboard?month=${option.value}`}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${option.value === selectedMonth ? "bg-accent text-white" : "border border-border text-foreground hover:bg-surface-strong"}`}
              >
                {option.label}
              </Link>
            ))}
          </div>
        </div>
      </article>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[1.75rem] border border-border bg-surface px-5 py-5">
          <p className="text-sm text-muted">Entradas</p>
          <h2 className="mt-3 text-3xl font-semibold">{formatCurrency(entradas)}</h2>
          <p className="mt-2 text-sm text-muted">Receitas, PIX recebidos e recebiveis.</p>
        </article>
        <article className="rounded-[1.75rem] border border-border bg-surface px-5 py-5">
          <p className="text-sm text-muted">Saidas</p>
          <h2 className="mt-3 text-3xl font-semibold">{formatCurrency(saidas)}</h2>
          <p className="mt-2 text-sm text-muted">Despesas, compras, PIX enviados e contas fixas.</p>
        </article>
        <article className="rounded-[1.75rem] border border-border bg-surface px-5 py-5">
          <p className="text-sm text-muted">Faturas no mes</p>
          <h2 className="mt-3 text-3xl font-semibold">{formatCurrency(totalFaturas)}</h2>
          <p className="mt-2 text-sm text-muted">{faturas.length} faturas com vencimento no periodo.</p>
        </article>
        <article className="rounded-[1.75rem] border border-border bg-[#1f2937] px-5 py-5 text-white">
          <p className="text-sm text-white/70">Saldo projetado</p>
          <h2 className="mt-3 text-3xl font-semibold">{formatCurrency(saldoProjetado)}</h2>
          <p className="mt-2 text-sm text-white/70">Visao consolidada do mes selecionado.</p>
        </article>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="grid gap-4 md:grid-cols-2">
          <article className="rounded-[1.75rem] border border-border bg-surface px-5 py-5">
            <p className="text-sm text-muted">Receitas</p>
            <h3 className="mt-3 text-3xl font-semibold">{formatCurrency(totalReceitas)}</h3>
            <p className="mt-2 text-sm text-muted">{receitas.length} itens no mes.</p>
          </article>
          <article className="rounded-[1.75rem] border border-border bg-surface px-5 py-5">
            <p className="text-sm text-muted">Despesas</p>
            <h3 className="mt-3 text-3xl font-semibold">{formatCurrency(totalDespesas)}</h3>
            <p className="mt-2 text-sm text-muted">{despesas.length} itens no mes.</p>
          </article>
          <article className="rounded-[1.75rem] border border-border bg-surface px-5 py-5">
            <p className="text-sm text-muted">PIX recebidos</p>
            <h3 className="mt-3 text-3xl font-semibold">{formatCurrency(totalPixRecebidos)}</h3>
            <p className="mt-2 text-sm text-muted">{pixTransacoes.filter((item) => item.tipo === "recebido").length} transferencias.</p>
          </article>
          <article className="rounded-[1.75rem] border border-border bg-surface px-5 py-5">
            <p className="text-sm text-muted">Recebiveis em aberto</p>
            <h3 className="mt-3 text-3xl font-semibold">{formatCurrency(totalRecebiveis)}</h3>
            <p className="mt-2 text-sm text-muted">{recebiveis.filter((item) => item.status !== "recebido").length} previsoes em aberto.</p>
          </article>
        </div>

        <aside className="rounded-[1.75rem] border border-border bg-surface px-6 py-6">
          <p className="text-sm uppercase tracking-[0.2em] text-muted">Etapa 8</p>
          <h2 className="mt-3 text-2xl font-semibold">Dashboard e relatorios mensais.</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            O painel agora trabalha por mes, facilitando leitura de saldo, entradas, saidas e analise consolidada do periodo.
          </p>
          <div className="mt-6 grid gap-3">
            <Link className="rounded-2xl bg-accent px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-accent-strong" href={`/dashboard/relatorios?month=${selectedMonth}`}>
              Abrir relatorios detalhados
            </Link>
            <Link className="rounded-2xl border border-border px-4 py-3 text-center text-sm font-semibold text-foreground transition hover:bg-surface-strong" href="/dashboard/pix">
              Gerenciar PIX
            </Link>
            <Link className="rounded-2xl border border-border px-4 py-3 text-center text-sm font-semibold text-foreground transition hover:bg-surface-strong" href="/dashboard/recebiveis">
              Gerenciar recebiveis
            </Link>
            <div className="rounded-2xl bg-surface-strong px-4 py-4 text-sm text-muted">
              Cartoes ativos: <strong className="text-foreground">{cartoes.length}</strong>
              <br />
              Compras no mes: <strong className="text-foreground">{compras.length}</strong>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
