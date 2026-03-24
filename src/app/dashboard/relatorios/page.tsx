import Link from "next/link";

import { requireCurrentUser } from "@/lib/auth";
import {
  buildMonthRange,
  buildRecentMonthOptions,
  currentMonthValue,
  formatCurrency,
  formatDate,
  formatMonthLabel,
} from "@/lib/format";
import { prisma } from "@/lib/prisma";

type PageProps = {
  searchParams?: Promise<{ month?: string }>;
};

type GroupItem = {
  label: string;
  total: number;
  count: number;
};

function groupByCategory<T extends { categoria: string | null; valor?: unknown; valorPrevisto?: unknown }>(items: T[]) {
  const grouped = new Map<string, GroupItem>();

  items.forEach((item) => {
    const label = item.categoria ?? "Sem categoria";
    const current = grouped.get(label) ?? { label, total: 0, count: 0 };
    const amount = "valor" in item && item.valor != null ? Number(item.valor) : Number(item.valorPrevisto ?? 0);

    current.total += amount;
    current.count += 1;
    grouped.set(label, current);
  });

  return [...grouped.values()].sort((a, b) => b.total - a.total);
}

export default async function RelatoriosPage({ searchParams }: PageProps) {
  const { userId } = await requireCurrentUser();
  const params = searchParams ? await searchParams : undefined;
  const selectedMonth = params?.month ?? currentMonthValue();
  const { start, end } = buildMonthRange(selectedMonth);
  const monthOptions = buildRecentMonthOptions(8);

  const [receitas, despesas, pix, recebiveis, compras, contasFixas, faturas] = await Promise.all([
    prisma.receita.findMany({ where: { usuarioId: userId, dataRecebimento: { gte: start, lte: end } }, orderBy: { dataRecebimento: "desc" } }),
    prisma.despesa.findMany({ where: { usuarioId: userId, dataVencimento: { gte: start, lte: end } }, orderBy: { dataVencimento: "asc" } }),
    prisma.pixTransacao.findMany({ where: { usuarioId: userId, dataPix: { gte: start, lte: end } }, orderBy: { dataPix: "desc" } }),
    prisma.recebivel.findMany({ where: { usuarioId: userId, dataEsperada: { gte: start, lte: end } }, orderBy: { dataEsperada: "asc" } }),
    prisma.compraCartao.findMany({ where: { usuarioId: userId, dataCompra: { gte: start, lte: end } }, orderBy: { dataCompra: "desc" }, include: { cartao: true } }),
    prisma.contaFixa.findMany({ where: { usuarioId: userId, ativa: true }, orderBy: { diaVencimento: "asc" } }),
    prisma.faturaCartao.findMany({ where: { usuarioId: userId, dataVencimento: { gte: start, lte: end } }, include: { cartao: true }, orderBy: { dataVencimento: "asc" } }),
  ]);

  const receitasPorCategoria = groupByCategory(receitas);
  const despesasPorCategoria = groupByCategory(despesas);
  const pixRecebidos = pix.filter((item) => item.tipo === "recebido");
  const pixEnviados = pix.filter((item) => item.tipo === "enviado");

  const totalReceitas = receitas.reduce((sum, item) => sum + Number(item.valor), 0);
  const totalDespesas = despesas.reduce((sum, item) => sum + Number(item.valor), 0);
  const totalPixRecebidos = pixRecebidos.reduce((sum, item) => sum + Number(item.valor), 0);
  const totalPixEnviados = pixEnviados.reduce((sum, item) => sum + Number(item.valor), 0);
  const totalRecebiveis = recebiveis.reduce((sum, item) => sum + Number(item.valorPrevisto), 0);
  const totalCompras = compras.reduce((sum, item) => sum + Number(item.valor), 0);
  const totalFaturas = faturas.reduce((sum, item) => sum + Number(item.valorTotal), 0);
  const saldo = totalReceitas + totalPixRecebidos + totalRecebiveis - totalDespesas - totalPixEnviados - totalCompras;

  return (
    <section className="grid gap-4">
      <article className="rounded-[1.75rem] border border-border bg-surface px-6 py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted">Relatorios</p>
            <h2 className="mt-2 text-2xl font-semibold">Analise mensal de {formatMonthLabel(selectedMonth)}</h2>
            <p className="mt-2 text-sm text-muted">Consolidado por categoria, vencimentos, faturas e movimentacoes do periodo.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {monthOptions.map((option) => (
              <Link
                key={option.value}
                href={`/dashboard/relatorios?month=${option.value}`}
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
          <p className="text-sm text-muted">Entradas do periodo</p>
          <strong className="mt-3 block text-3xl">{formatCurrency(totalReceitas + totalPixRecebidos + totalRecebiveis)}</strong>
        </article>
        <article className="rounded-[1.75rem] border border-border bg-surface px-5 py-5">
          <p className="text-sm text-muted">Saidas do periodo</p>
          <strong className="mt-3 block text-3xl">{formatCurrency(totalDespesas + totalPixEnviados + totalCompras)}</strong>
        </article>
        <article className="rounded-[1.75rem] border border-border bg-surface px-5 py-5">
          <p className="text-sm text-muted">Faturas no mes</p>
          <strong className="mt-3 block text-3xl">{formatCurrency(totalFaturas)}</strong>
        </article>
        <article className="rounded-[1.75rem] border border-border bg-[#1f2937] px-5 py-5 text-white">
          <p className="text-sm text-white/70">Saldo consolidado</p>
          <strong className="mt-3 block text-3xl">{formatCurrency(saldo)}</strong>
        </article>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-[1.75rem] border border-border bg-surface px-6 py-6">
          <p className="text-sm uppercase tracking-[0.2em] text-muted">Receitas por categoria</p>
          <div className="mt-5 space-y-3">
            {receitasPorCategoria.length === 0 ? <p className="text-sm text-muted">Sem receitas no periodo.</p> : receitasPorCategoria.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl border border-border px-4 py-3">
                <div>
                  <strong className="block text-sm">{item.label}</strong>
                  <span className="text-sm text-muted">{item.count} lancamentos</span>
                </div>
                <strong>{formatCurrency(item.total)}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[1.75rem] border border-border bg-surface px-6 py-6">
          <p className="text-sm uppercase tracking-[0.2em] text-muted">Despesas por categoria</p>
          <div className="mt-5 space-y-3">
            {despesasPorCategoria.length === 0 ? <p className="text-sm text-muted">Sem despesas no periodo.</p> : despesasPorCategoria.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl border border-border px-4 py-3">
                <div>
                  <strong className="block text-sm">{item.label}</strong>
                  <span className="text-sm text-muted">{item.count} lancamentos</span>
                </div>
                <strong>{formatCurrency(item.total)}</strong>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[1.75rem] border border-border bg-surface px-6 py-6">
          <p className="text-sm uppercase tracking-[0.2em] text-muted">Fluxos do periodo</p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-border px-4 py-4">
              <p className="text-sm text-muted">PIX recebidos</p>
              <strong className="mt-2 block text-2xl">{formatCurrency(totalPixRecebidos)}</strong>
              <span className="text-sm text-muted">{pixRecebidos.length} transacoes</span>
            </div>
            <div className="rounded-2xl border border-border px-4 py-4">
              <p className="text-sm text-muted">PIX enviados</p>
              <strong className="mt-2 block text-2xl">{formatCurrency(totalPixEnviados)}</strong>
              <span className="text-sm text-muted">{pixEnviados.length} transacoes</span>
            </div>
            <div className="rounded-2xl border border-border px-4 py-4">
              <p className="text-sm text-muted">Compras no cartao</p>
              <strong className="mt-2 block text-2xl">{formatCurrency(totalCompras)}</strong>
              <span className="text-sm text-muted">{compras.length} compras</span>
            </div>
            <div className="rounded-2xl border border-border px-4 py-4">
              <p className="text-sm text-muted">Recebiveis previstos</p>
              <strong className="mt-2 block text-2xl">{formatCurrency(totalRecebiveis)}</strong>
              <span className="text-sm text-muted">{recebiveis.length} registros</span>
            </div>
          </div>
        </article>

        <article className="rounded-[1.75rem] border border-border bg-surface px-6 py-6">
          <p className="text-sm uppercase tracking-[0.2em] text-muted">Proximos vencimentos</p>
          <div className="mt-5 space-y-3">
            {faturas.length === 0 && contasFixas.length === 0 ? (
              <p className="text-sm text-muted">Sem vencimentos relevantes neste momento.</p>
            ) : null}
            {faturas.slice(0, 4).map((fatura) => (
              <div key={`fatura-${fatura.id}`} className="rounded-2xl border border-border px-4 py-3">
                <strong className="block text-sm">Fatura {fatura.cartao.nome} · {fatura.competencia}</strong>
                <span className="text-sm text-muted">Vence em {formatDate(fatura.dataVencimento)} · {formatCurrency(Number(fatura.valorTotal))}</span>
              </div>
            ))}
            {contasFixas.slice(0, 4).map((conta) => (
              <div key={`conta-${conta.id}`} className="rounded-2xl border border-border px-4 py-3">
                <strong className="block text-sm">{conta.descricao}</strong>
                <span className="text-sm text-muted">Dia {conta.diaVencimento} · {formatCurrency(Number(conta.valorPrevisto))}</span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
