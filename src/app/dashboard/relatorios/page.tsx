import Link from "next/link";

import { DashboardListPanel } from "@/components/dashboard/dashboard-list-panel";
import { DashboardPeriodHeader } from "@/components/dashboard/dashboard-period-header";
import { ExpenseTagPieChart } from "@/components/dashboard/expense-tag-pie-chart";
import { FilterMultiSelect } from "@/components/dashboard/filter-multi-select";
import { requireCurrentUser } from "@/lib/auth";
import {
  buildMonthRanges,
  buildRecentMonthOptions,
  formatCurrency,
  formatDate,
  formatPaymentMethodLabel,
  formatSelectedMonthsSummary,
  parseSelectedMonths,
} from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { getUniqueTags } from "@/lib/tags";

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

function groupByUser(
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

function parseSelectedNumericIds(value?: string) {
  if (!value) {
    return [] as number[];
  }

  return value
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isInteger(item) && item > 0);
}

type PageProps = {
  searchParams?: Promise<{ months?: string; tagId?: string; categoriaIds?: string; usuarioId?: string; formaPagamento?: string }>;
};

export default async function RelatoriosPage({ searchParams }: PageProps) {
  const { userId } = await requireCurrentUser();
  const params = searchParams ? await searchParams : undefined;
  const selectedMonths = parseSelectedMonths(params?.months);
  const monthOptions = buildRecentMonthOptions(8, 8);
  const monthRanges = buildMonthRanges(selectedMonths);
  const periodLabel = formatSelectedMonthsSummary(selectedMonths);
  const selectedTagId = params?.tagId ? Number(params.tagId) : null;
  const selectedCategoriaIds = parseSelectedNumericIds(params?.categoriaIds);
  const selectedUsuarioId = params?.usuarioId ? Number(params.usuarioId) : null;
  const selectedFormaPagamento =
    params?.formaPagamento === "a_vista" || params?.formaPagamento === "a_prazo" ? params.formaPagamento : null;

  const accessibleCategoryWhere = {
    usuarios: {
      some: {
        usuarioId: userId,
      },
    },
  };

  const despesaFilter = {
    OR: monthRanges.map(({ start, end }) => ({ dataVencimento: { gte: start, lte: end } })),
    categoriaDespesa: accessibleCategoryWhere,
    ...(selectedTagId ? { tagId: selectedTagId } : {}),
    ...(selectedCategoriaIds.length > 0 ? { categoriaDespesaId: { in: selectedCategoriaIds } } : {}),
    ...(selectedUsuarioId ? { usuarioId: selectedUsuarioId } : {}),
    ...(selectedFormaPagamento ? { formaPagamento: selectedFormaPagamento } : {}),
  };

  const [receitas, despesas, pix, recebiveis, compras, contasFixas, faturas, categorias, rawTags, usuarios] = await Promise.all([
    prisma.receita.findMany({
      where: { usuarioId: userId, OR: monthRanges.map(({ start, end }) => ({ dataRecebimento: { gte: start, lte: end } })) },
      orderBy: { dataRecebimento: "desc" },
      include: { tag: true },
    }),
    prisma.despesa.findMany({
      where: despesaFilter,
      orderBy: [{ dataVencimento: "asc" }, { createdAt: "desc" }],
      include: {
        categoriaDespesa: true,
        tag: true,
        usuario: {
          include: {
            pessoa: true,
          },
        },
      },
    }),
    prisma.pixTransacao.findMany({ where: { usuarioId: userId, OR: monthRanges.map(({ start, end }) => ({ dataPix: { gte: start, lte: end } })) }, orderBy: { dataPix: "desc" } }),
    prisma.recebivel.findMany({ where: { usuarioId: userId, OR: monthRanges.map(({ start, end }) => ({ dataEsperada: { gte: start, lte: end } })) }, orderBy: { dataEsperada: "asc" } }),
    prisma.compraCartao.findMany({ where: { usuarioId: userId, OR: monthRanges.map(({ start, end }) => ({ dataCompra: { gte: start, lte: end } })) }, orderBy: { dataCompra: "desc" }, include: { cartao: true } }),
    prisma.contaFixa.findMany({ where: { usuarioId: userId, ativa: true }, orderBy: { diaVencimento: "asc" } }),
    prisma.faturaCartao.findMany({ where: { usuarioId: userId, OR: monthRanges.map(({ start, end }) => ({ dataVencimento: { gte: start, lte: end } })) }, include: { cartao: true }, orderBy: { dataVencimento: "asc" } }),
    prisma.categoriaDespesa.findMany({ where: accessibleCategoryWhere, orderBy: { nome: "asc" } }),
    prisma.tag.findMany({ orderBy: { nome: "asc" } }),
    prisma.usuario.findMany({
      where: {
        ativo: true,
        categoriasDespesa: {
          some: {
            categoria: accessibleCategoryWhere,
          },
        },
      },
      include: { pessoa: true },
      orderBy: { pessoa: { nomeCompleto: "asc" } },
    }),
  ]);

  const tags = getUniqueTags(rawTags);
  const receitasPorTag = groupByCategory(receitas.map((item) => ({ ...item, categoriaLabel: item.tag?.nome ?? "Sem tag" })));
  const despesasPorCategoria = groupByCategory(despesas.map((item) => ({ ...item, categoriaLabel: item.categoriaDespesa.nome })));
  const despesasPorTag = groupByCategory(despesas.map((item) => ({ ...item, categoriaLabel: item.tag?.nome ?? "Sem tag" })));
  const despesasPorUsuario = groupByUser(despesas);
  const pixRecebidos = pix.filter((item) => item.tipo === "recebido");
  const pixEnviados = pix.filter((item) => item.tipo === "enviado");

  const totalReceitas = receitas.reduce((sum, item) => sum + Number(item.valor), 0);
  const totalDespesas = despesas.reduce((sum, item) => sum + Number(item.valor), 0);
  const totalPixRecebidos = pixRecebidos.reduce((sum, item) => sum + Number(item.valor), 0);
  const totalPixEnviados = pixEnviados.reduce((sum, item) => sum + Number(item.valor), 0);
  const totalRecebiveis = recebiveis.reduce((sum, item) => sum + Number(item.valorPrevisto), 0);
  const totalCompras = compras.reduce((sum, item) => sum + Number(item.valor), 0);
  const saldo = totalReceitas + totalPixRecebidos + totalRecebiveis - totalDespesas - totalPixEnviados - totalCompras;
  const selectedTagName = selectedTagId ? tags.find((item) => item.id === selectedTagId)?.nome ?? null : null;
  const selectedCategoryNames = categorias
    .filter((item) => selectedCategoriaIds.includes(item.id))
    .map((item) => item.nome);
  const selectedCategorySummary =
    selectedCategoryNames.length === 0
      ? "Todas"
      : selectedCategoryNames.length <= 2
        ? selectedCategoryNames.join(", ")
        : `${selectedCategoryNames.length} categorias`;
  const selectedUsuarioName = selectedUsuarioId ? usuarios.find((item) => item.id === selectedUsuarioId)?.pessoa.nomeCompleto ?? null : null;
  const uniqueUsers = [...new Set(despesas.map((despesa) => despesa.usuario.pessoa.nomeCompleto))];
  const printParams = new URLSearchParams();
  printParams.set("months", selectedMonths.join(","));
  if (params?.tagId) printParams.set("tagId", params.tagId);
  if (params?.categoriaIds) printParams.set("categoriaIds", params.categoriaIds);
  if (params?.usuarioId) printParams.set("usuarioId", params.usuarioId);
  if (params?.formaPagamento) printParams.set("formaPagamento", params.formaPagamento);
  const printHref = `/relatorios/imprimir?${printParams.toString()}`;

  return (
    <section className="grid gap-4">
      <DashboardPeriodHeader
        eyebrow="Relatorios"
        title="Cruze varios meses e leia o consolidado por categoria, fluxo e vencimentos."
        description={`O recorte atual considera ${periodLabel}, somando receitas, despesas compartilhadas por categoria, PIX, compras e previsoes em um unico relatorio.`}
        pathname="/dashboard/relatorios"
        selectedMonths={selectedMonths}
        monthOptions={monthOptions}
        extraParams={{ tagId: params?.tagId, categoriaIds: params?.categoriaIds, usuarioId: params?.usuarioId, formaPagamento: params?.formaPagamento }}
        metrics={[
          { label: "Entradas do periodo", value: formatCurrency(totalReceitas + totalPixRecebidos + totalRecebiveis), detail: "Receitas, PIX recebidos e recebiveis previstos." },
          { label: "Saidas do periodo", value: formatCurrency(totalDespesas + totalPixEnviados + totalCompras), detail: "Despesas compartilhadas por categoria, compras no cartao e PIX enviados." },
          { label: "Saldo consolidado", value: formatCurrency(saldo), detail: "Resultado somado do conjunto de meses selecionado.", valueClassName: saldo >= 0 ? "text-blue-200" : "text-orange-300" },
        ]}
      />

      <article className="rounded-[1.75rem] border border-border bg-surface px-6 py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted">Filtros</p>
            <h2 className="mt-2 text-2xl font-semibold">Refine as despesas compartilhadas</h2>
            <p className="mt-2 text-sm text-muted">As despesas listadas aqui respeitam as categorias vinculadas ao seu usuario e podem trazer lancamentos feitos por outros usuarios da mesma categoria.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              className="rounded-full border border-border px-4 py-2 text-sm font-medium transition hover:bg-surface-strong"
              href={`/dashboard/relatorios?months=${selectedMonths.join(",")}`}
            >
              Limpar filtros
            </Link>
          </div>
        </div>

        <form className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1.25fr_1fr_1fr_auto]" method="get">
          <input type="hidden" name="months" value={selectedMonths.join(",")} />
          <div>
            <label className="mb-2 block text-sm font-medium">Tag</label>
            <select name="tagId" defaultValue={params?.tagId ?? ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent">
              <option value="">Todas as tags</option>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>{tag.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Categorias</label>
            <FilterMultiSelect
              name="categoriaIds"
              options={categorias.map((categoria) => ({ id: categoria.id, label: categoria.nome }))}
              defaultSelectedIds={selectedCategoriaIds.map(String)}
              placeholder="Todas as categorias"
              helperText="Selecione uma ou mais categorias para combinar no mesmo relatorio."
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Usuario</label>
            <select name="usuarioId" defaultValue={params?.usuarioId ?? ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent">
              <option value="">Todos os usuarios</option>
              {usuarios.map((usuario) => (
                <option key={usuario.id} value={usuario.id}>{usuario.pessoa.nomeCompleto}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Forma de pagamento</label>
            <select name="formaPagamento" defaultValue={params?.formaPagamento ?? ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent">
              <option value="">Todas</option>
              <option value="a_vista">A vista</option>
              <option value="a_prazo">A prazo</option>
            </select>
          </div>
          <button className="rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong md:self-end">
            Aplicar filtros
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2 text-sm text-muted">
          <span className="rounded-full bg-surface-strong px-3 py-1">Tag: {selectedTagName ?? "Todas"}</span>
          <span className="rounded-full bg-surface-strong px-3 py-1">Categorias: {selectedCategorySummary}</span>
          <span className="rounded-full bg-surface-strong px-3 py-1">Usuario: {selectedUsuarioName ?? "Todos"}</span>
          <span className="rounded-full bg-surface-strong px-3 py-1">Forma de pagamento: {formatPaymentMethodLabel(selectedFormaPagamento)}</span>
          <span className="rounded-full bg-surface-strong px-3 py-1">Despesas encontradas: {despesas.length}</span>
          <span className="rounded-full bg-surface-strong px-3 py-1">Usuarios no recorte: {uniqueUsers.length}</span>
        </div>
      </article>

      <div className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-[1.75rem] border border-border bg-surface px-6 py-6">
          <p className="text-sm uppercase tracking-[0.2em] text-muted">Receitas por tag</p>
          <div className="mt-5 space-y-3">
            {receitasPorTag.length === 0 ? <p className="text-sm text-muted">Sem receitas no periodo selecionado.</p> : receitasPorTag.map((item) => (
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

      <ExpenseTagPieChart data={despesasPorTag} total={totalDespesas} />

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
                <strong className="block text-sm">Fatura {fatura.cartao.nome} | {fatura.competencia}</strong>
                <span className="text-sm text-muted">Vence em {formatDate(fatura.dataVencimento)} | {formatCurrency(Number(fatura.valorTotal))}</span>
              </div>
            ))}
            {contasFixas.slice(0, 4).map((conta) => (
              <div key={`conta-${conta.id}`} className="rounded-2xl border border-border px-4 py-3">
                <strong className="block text-sm">{conta.descricao}</strong>
                <span className="text-sm text-muted">Dia {conta.diaVencimento} | {formatCurrency(Number(conta.valorPrevisto))}</span>
              </div>
            ))}
          </div>
        </article>
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
            <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-muted">Nenhuma despesa encontrada para os filtros atuais.</p>
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

      <div className="flex justify-end">
        <Link
          className="rounded-full border border-slate-900 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-900 hover:text-white"
          href={printHref}
          target="_blank"
          rel="noreferrer"
        >
          Imprimir
        </Link>
      </div>

      <DashboardListPanel title="Despesas detalhadas por categoria" totalLabel={formatCurrency(totalDespesas)}>
        {despesas.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-muted">Nenhuma despesa encontrada com os filtros atuais.</p>
        ) : (
          despesas.map((despesa) => (
            <div key={despesa.id} className="rounded-2xl border border-border px-4 py-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{despesa.descricao}</h3>
                  <p className="mt-1 text-sm text-muted">
                    Usuario: {despesa.usuario.pessoa.nomeCompleto} | Categoria: {despesa.categoriaDespesa.nome} | Tag: {despesa.tag?.nome ?? "Sem tag"}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    Vencimento em {formatDate(despesa.dataVencimento)} | Forma de pagamento: {formatPaymentMethodLabel(despesa.formaPagamento)}
                  </p>
                  {despesa.observacoes ? <p className="mt-2 text-sm text-muted">{despesa.observacoes}</p> : null}
                </div>
                <strong className="text-xl">{formatCurrency(Number(despesa.valor))}</strong>
              </div>
            </div>
          ))
        )}
      </DashboardListPanel>
    </section>
  );
}
