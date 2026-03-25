import { requireCurrentUser } from "@/lib/auth";
import {
  buildMonthRanges,
  buildRecentMonthOptions,
  formatCurrency,
  formatDate,
  formatSelectedMonthsSummary,
  parseSelectedMonths,
} from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { DashboardPeriodHeader } from "@/components/dashboard/dashboard-period-header";

function groupByCategory<T extends { categoriaLabel: string; valor?: unknown; valorPrevisto?: unknown }>(items: T[]) {
  const grouped = new Map<string, { label: string; total: number; count: number }>();

  items.forEach((item) => {
    const label = item.categoriaLabel;
    const current = grouped.get(label) ?? { label, total: 0, count: 0 };
    const amount = "valor" in item && item.valor != null ? Number(item.valor) : Number(item.valorPrevisto ?? 0);

    current.total += amount;
    current.count += 1;
    grouped.set(label, current);
  });

  return [...grouped.values()].sort((a, b) => b.total - a.total);
}

type PageProps = {
  searchParams?: Promise<{ months?: string }>;
};

export default async function RelatoriosPage({ searchParams }: PageProps) {
  const { userId } = await requireCurrentUser();
  const params = searchParams ? await searchParams : undefined;
  const selectedMonths = parseSelectedMonths(params?.months);
  const monthOptions = buildRecentMonthOptions(8);
  const monthRanges = buildMonthRanges(selectedMonths);
  const periodLabel = formatSelectedMonthsSummary(selectedMonths);

  const [receitas, despesas, pix, recebiveis, compras, contasFixas, faturas] = await Promise.all([
    prisma.receita.findMany({ where: { usuarioId: userId, OR: monthRanges.map(({ start, end }) => ({ dataRecebimento: { gte: start, lte: end } })) }, orderBy: { dataRecebimento: "desc" } }),
    prisma.despesa.findMany({ where: { usuarioId: userId, OR: monthRanges.map(({ start, end }) => ({ dataVencimento: { gte: start, lte: end } })) }, orderBy: { dataVencimento: "asc" }, include: { categoriaDespesa: true } }),
    prisma.pixTransacao.findMany({ where: { usuarioId: userId, OR: monthRanges.map(({ start, end }) => ({ dataPix: { gte: start, lte: end } })) }, orderBy: { dataPix: "desc" } }),
    prisma.recebivel.findMany({ where: { usuarioId: userId, OR: monthRanges.map(({ start, end }) => ({ dataEsperada: { gte: start, lte: end } })) }, orderBy: { dataEsperada: "asc" } }),
    prisma.compraCartao.findMany({ where: { usuarioId: userId, OR: monthRanges.map(({ start, end }) => ({ dataCompra: { gte: start, lte: end } })) }, orderBy: { dataCompra: "desc" }, include: { cartao: true } }),
    prisma.contaFixa.findMany({ where: { usuarioId: userId, ativa: true }, orderBy: { diaVencimento: "asc" } }),
    prisma.faturaCartao.findMany({ where: { usuarioId: userId, OR: monthRanges.map(({ start, end }) => ({ dataVencimento: { gte: start, lte: end } })) }, include: { cartao: true }, orderBy: { dataVencimento: "asc" } }),
  ]);

  const receitasPorCategoria = groupByCategory(receitas.map((item) => ({ ...item, categoriaLabel: item.categoria ?? "Sem categoria" })));
  const despesasPorCategoria = groupByCategory(despesas.map((item) => ({ ...item, categoriaLabel: item.categoriaDespesa.nome })));
  const pixRecebidos = pix.filter((item) => item.tipo === "recebido");
  const pixEnviados = pix.filter((item) => item.tipo === "enviado");

  const totalReceitas = receitas.reduce((sum, item) => sum + Number(item.valor), 0);
  const totalDespesas = despesas.reduce((sum, item) => sum + Number(item.valor), 0);
  const totalPixRecebidos = pixRecebidos.reduce((sum, item) => sum + Number(item.valor), 0);
  const totalPixEnviados = pixEnviados.reduce((sum, item) => sum + Number(item.valor), 0);
  const totalRecebiveis = recebiveis.reduce((sum, item) => sum + Number(item.valorPrevisto), 0);
  const totalCompras = compras.reduce((sum, item) => sum + Number(item.valor), 0);
  const saldo = totalReceitas + totalPixRecebidos + totalRecebiveis - totalDespesas - totalPixEnviados - totalCompras;

  return (
    <section className="grid gap-4">
      <DashboardPeriodHeader
        eyebrow="Relatorios"
        title="Cruze varios meses e leia o consolidado por categoria, fluxo e vencimentos."
        description={`O recorte atual considera ${periodLabel}, somando receitas, despesas, PIX, compras e previsoes em um unico relatorio.`}
        pathname="/dashboard/relatorios"
        selectedMonths={selectedMonths}
        monthOptions={monthOptions}
        metrics={[
          { label: "Entradas do periodo", value: formatCurrency(totalReceitas + totalPixRecebidos + totalRecebiveis), detail: "Receitas, PIX recebidos e recebiveis previstos." },
          { label: "Saidas do periodo", value: formatCurrency(totalDespesas + totalPixEnviados + totalCompras), detail: "Despesas, compras no cartao e PIX enviados." },
          { label: "Saldo consolidado", value: formatCurrency(saldo), detail: "Resultado somado do conjunto de meses selecionado.", valueClassName: saldo >= 0 ? "text-blue-200" : "text-orange-300" },
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-[1.75rem] border border-border bg-surface px-6 py-6">
          <p className="text-sm uppercase tracking-[0.2em] text-muted">Receitas por categoria</p>
          <div className="mt-5 space-y-3">
            {receitasPorCategoria.length === 0 ? <p className="text-sm text-muted">Sem receitas no periodo selecionado.</p> : receitasPorCategoria.map((item) => (
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
            {despesasPorCategoria.length === 0 ? <p className="text-sm text-muted">Sem despesas no periodo selecionado.</p> : despesasPorCategoria.map((item) => (
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
            {faturas.length === 0 && contasFixas.length === 0 ? <p className="text-sm text-muted">Sem vencimentos relevantes neste momento.</p> : null}
            {faturas.slice(0, 4).map((fatura) => (
              <div key={`fatura-${fatura.id}`} className="rounded-2xl border border-border px-4 py-3">
                <strong className="block text-sm">Fatura {fatura.cartao.nome} Â· {fatura.competencia}</strong>
                <span className="text-sm text-muted">Vence em {formatDate(fatura.dataVencimento)} Â· {formatCurrency(Number(fatura.valorTotal))}</span>
              </div>
            ))}
            {contasFixas.slice(0, 4).map((conta) => (
              <div key={`conta-${conta.id}`} className="rounded-2xl border border-border px-4 py-3">
                <strong className="block text-sm">{conta.descricao}</strong>
                <span className="text-sm text-muted">Dia {conta.diaVencimento} Â· {formatCurrency(Number(conta.valorPrevisto))}</span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
