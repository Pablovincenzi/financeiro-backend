import Link from "next/link";

import { DashboardPeriodHeader } from "@/components/dashboard/dashboard-period-header";
import { requireCurrentUser } from "@/lib/auth";
import {
  buildMonthRanges,
  buildRecentMonthOptions,
  formatCurrency,
  formatSelectedMonthsSummary,
  parseSelectedMonths,
} from "@/lib/format";
import { prisma } from "@/lib/prisma";

type PageProps = {
  searchParams?: Promise<{ months?: string }>;
};

function groupExpensesByUser(
  despesas: Array<{
    valor: unknown;
    usuario: { pessoa: { nomeCompleto: string } };
  }>,
) {
  const grouped = new Map<string, { userName: string; total: number; count: number }>();

  despesas.forEach((despesa) => {
    const userName = despesa.usuario.pessoa.nomeCompleto;
    const current = grouped.get(userName) ?? { userName, total: 0, count: 0 };

    current.total += Number(despesa.valor);
    current.count += 1;
    grouped.set(userName, current);
  });

  return [...grouped.values()].sort((left, right) => right.total - left.total);
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const { userId } = await requireCurrentUser();
  const params = searchParams ? await searchParams : undefined;
  const selectedMonths = parseSelectedMonths(params?.months);
  const monthOptions = buildRecentMonthOptions(6, 8);
  const monthRanges = buildMonthRanges(selectedMonths);
  const periodLabel = formatSelectedMonthsSummary(selectedMonths);
  const accessibleCategoryWhere = {
    usuarios: {
      some: {
        usuarioId: userId,
      },
    },
  };

  const [receitas, despesas, despesasCompartilhadas, contasFixas, cartoes, compras, faturas, pixTransacoes, recebiveis] = await Promise.all([
    prisma.receita.findMany({ where: { usuarioId: userId, OR: monthRanges.map(({ start, end }) => ({ dataRecebimento: { gte: start, lte: end } })) } }),
    prisma.despesa.findMany({ where: { usuarioId: userId, OR: monthRanges.map(({ start, end }) => ({ dataVencimento: { gte: start, lte: end } })) } }),
    prisma.despesa.findMany({
      where: {
        OR: monthRanges.map(({ start, end }) => ({ dataVencimento: { gte: start, lte: end } })),
        categoriaDespesa: accessibleCategoryWhere,
      },
      include: {
        usuario: {
          include: {
            pessoa: true,
          },
        },
      },
      orderBy: [{ valor: "desc" }, { dataVencimento: "asc" }],
    }),
    prisma.contaFixa.findMany({ where: { usuarioId: userId, ativa: true } }),
    prisma.cartao.findMany({ where: { usuarioId: userId, ativo: true } }),
    prisma.compraCartao.findMany({ where: { usuarioId: userId, OR: monthRanges.map(({ start, end }) => ({ dataCompra: { gte: start, lte: end } })) } }),
    prisma.faturaCartao.findMany({ where: { usuarioId: userId, OR: monthRanges.map(({ start, end }) => ({ dataVencimento: { gte: start, lte: end } })) } }),
    prisma.pixTransacao.findMany({ where: { usuarioId: userId, OR: monthRanges.map(({ start, end }) => ({ dataPix: { gte: start, lte: end } })) } }),
    prisma.recebivel.findMany({ where: { usuarioId: userId, OR: monthRanges.map(({ start, end }) => ({ dataEsperada: { gte: start, lte: end } })) } }),
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
  const despesasPorUsuario = groupExpensesByUser(despesasCompartilhadas);

  return (
    <section className="grid gap-4">
      <DashboardPeriodHeader
        eyebrow="Resumo mensal"
        title="Leitura do caixa com foco no que entra, no que sai e no que exige atencao."
        description={`Consulte rapidamente o periodo de ${periodLabel} e navegue por varios meses sem trocar de contexto.`}
        pathname="/dashboard"
        selectedMonths={selectedMonths}
        monthOptions={monthOptions}
        metrics={[
          { label: "Entradas previstas", value: formatCurrency(entradas), detail: "Receitas, PIX recebidos e recebiveis em aberto." },
          { label: "Saidas projetadas", value: formatCurrency(saidas), detail: "Despesas, compras, PIX enviados e contas recorrentes." },
          { label: "Saldo do periodo", value: formatCurrency(saldoProjetado), detail: "Visao consolidada dos meses selecionados.", valueClassName: saldoProjetado >= 0 ? "text-blue-200" : "text-orange-300" },
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[2rem] border border-white/70 bg-white/85 px-6 py-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-muted">Indicadores</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Panorama operacional</h3>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">{selectedMonths.length} meses</span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="border-b border-slate-200/80 pb-5 md:border-b-0 md:border-r md:pb-0 md:pr-5">
              <p className="text-sm text-muted">Receitas</p>
              <h4 className="mt-2 text-3xl font-semibold text-slate-900">{formatCurrency(totalReceitas)}</h4>
              <p className="mt-2 text-sm text-muted">{receitas.length} lancamentos no recorte.</p>
            </div>
            <div className="pb-5 md:pl-5 md:pb-0">
              <p className="text-sm text-muted">Despesas</p>
              <h4 className="mt-2 text-3xl font-semibold text-slate-900">{formatCurrency(totalDespesas)}</h4>
              <p className="mt-2 text-sm text-muted">{despesas.length} lancamentos no recorte.</p>
            </div>
            <div className="border-t border-slate-200/80 pt-5 md:border-r md:pr-5">
              <p className="text-sm text-muted">PIX recebidos</p>
              <h4 className="mt-2 text-3xl font-semibold text-slate-900">{formatCurrency(totalPixRecebidos)}</h4>
              <p className="mt-2 text-sm text-muted">{pixTransacoes.filter((item) => item.tipo === "recebido").length} transferencias.</p>
            </div>
            <div className="border-t border-slate-200/80 pt-5 md:pl-5">
              <p className="text-sm text-muted">Recebiveis em aberto</p>
              <h4 className="mt-2 text-3xl font-semibold text-slate-900">{formatCurrency(totalRecebiveis)}</h4>
              <p className="mt-2 text-sm text-muted">{recebiveis.filter((item) => item.status !== "recebido").length} previsoes em aberto.</p>
            </div>
          </div>
        </section>

        <aside className="rounded-[2rem] border border-blue-100 bg-[linear-gradient(180deg,_rgba(255,255,255,0.92),_rgba(232,240,251,0.95))] px-6 py-6 shadow-[0_18px_60px_rgba(47,111,191,0.12)]">
          <p className="text-xs uppercase tracking-[0.28em] text-blue-700">Acoes rapidas</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Movimente o sistema sem trocar de trilha.</h3>
          <p className="mt-3 text-sm leading-7 text-muted">Atalhos para as areas mais consultadas do periodo atual, com foco em classificacao e conferencia mensal.</p>

          <div className="mt-6 grid gap-3">
            <Link className="rounded-[1.2rem] bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800" href={`/dashboard/relatorios?months=${selectedMonths.join(",")}`}>
              Abrir relatorios detalhados
            </Link>
            <Link className="rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-900 transition hover:border-blue-200 hover:bg-blue-50" href="/dashboard/categorias">
              Revisar categorias e tags
            </Link>
            <Link className="rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-900 transition hover:border-orange-200 hover:bg-orange-50" href={`/dashboard/pix?months=${selectedMonths.join(",")}`}>
              Gerenciar PIX do periodo
            </Link>
          </div>

          <div className="mt-6 space-y-3 border-t border-slate-200 pt-5 text-sm text-muted">
            <div className="flex items-center justify-between"><span>Cartoes ativos</span><strong className="text-slate-900">{cartoes.length}</strong></div>
            <div className="flex items-center justify-between"><span>Compras no recorte</span><strong className="text-slate-900">{compras.length}</strong></div>
            <div className="flex items-center justify-between"><span>Faturas no periodo</span><strong className="text-slate-900">{formatCurrency(totalFaturas)}</strong></div>
            <div className="flex items-center justify-between"><span>Contas fixas ativas</span><strong className="text-slate-900">{formatCurrency(totalContasFixas)}</strong></div>
          </div>
        </aside>
      </div>

      <article className="rounded-[1.75rem] border border-border bg-surface px-6 py-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted">Despesas por usuario</p>
            <h2 className="mt-2 text-2xl font-semibold">Totais cadastrados no periodo</h2>
          </div>
          <span className="rounded-full bg-surface-strong px-3 py-1 text-sm text-muted">{despesasPorUsuario.length} usuarios</span>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {despesasPorUsuario.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-muted">Nenhuma despesa compartilhada encontrada para os meses selecionados.</p>
          ) : (
            despesasPorUsuario.map((item) => (
              <div key={item.userName} className="rounded-2xl border border-border px-4 py-4">
                <strong className="block text-base text-slate-900">{item.userName}</strong>
                <span className="mt-1 block text-sm text-muted">{item.count} despesas cadastradas</span>
                <strong className="mt-3 block text-2xl text-slate-900">{formatCurrency(item.total)}</strong>
              </div>
            ))
          )}
        </div>
      </article>
    </section>
  );
}
