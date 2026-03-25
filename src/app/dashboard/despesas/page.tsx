import Link from "next/link";

import { deleteDespesa, saveDespesa } from "@/app/dashboard/finance-actions";
import { DashboardListPanel } from "@/components/dashboard/dashboard-list-panel";
import { DashboardPeriodHeader } from "@/components/dashboard/dashboard-period-header";
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

type PageProps = {
  searchParams?: Promise<{
    edit?: string;
    months?: string;
  }>;
};

export default async function DespesasPage({ searchParams }: PageProps) {
  const { userId } = await requireCurrentUser();
  const params = searchParams ? await searchParams : undefined;
  const selectedMonths = parseSelectedMonths(params?.months);
  const monthOptions = buildRecentMonthOptions(6);
  const monthRanges = buildMonthRanges(selectedMonths);

  const [despesas, categorias] = await Promise.all([
    prisma.despesa.findMany({
      where: {
        usuarioId: userId,
        OR: monthRanges.map(({ start, end }) => ({
          dataVencimento: { gte: start, lte: end },
        })),
      },
      orderBy: { dataVencimento: "asc" },
      include: { categoriaDespesa: true },
    }),
    prisma.categoriaDespesa.findMany({
      where: {
        usuarios: {
          some: {
            usuarioId: userId,
          },
        },
      },
      orderBy: { nome: "asc" },
    }),
  ]);

  const despesaEmEdicao = params?.edit ? despesas.find((item) => item.id === Number(params.edit)) : null;
  const totalDespesas = despesas.reduce((sum, item) => sum + Number(item.valor), 0);
  const totalPagas = despesas.filter((item) => item.status === "paga").reduce((sum, item) => sum + Number(item.valor), 0);
  const totalPendentes = despesas.filter((item) => item.status === "pendente").reduce((sum, item) => sum + Number(item.valor), 0);
  const periodLabel = formatSelectedMonthsSummary(selectedMonths);

  return (
    <section className="grid gap-4">
      <DashboardPeriodHeader
        eyebrow="Despesas"
        title="Consolide gastos de varios meses em uma leitura unica do periodo."
        description={`Compare rapidamente o comportamento das despesas em ${periodLabel} e acompanhe o que esta pago ou pendente.`}
        pathname="/dashboard/despesas"
        selectedMonths={selectedMonths}
        monthOptions={monthOptions}
        extraParams={{ edit: params?.edit }}
        metrics={[
          { label: "Total do periodo", value: formatCurrency(totalDespesas), detail: "Soma das despesas listadas para os meses selecionados." },
          { label: "Pagas", value: formatCurrency(totalPagas), detail: "Lancamentos ja quitados dentro do recorte atual." },
          { label: "Pendentes", value: formatCurrency(totalPendentes), detail: "Valores ainda em aberto para os meses filtrados." },
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="rounded-[1.75rem] border border-border bg-surface px-6 py-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-muted">Despesas</p>
              <h2 className="mt-2 text-2xl font-semibold">{despesaEmEdicao ? "Editar despesa" : "Nova despesa"}</h2>
            </div>
            {despesaEmEdicao ? (
              <Link className="text-sm font-medium text-accent" href={`/dashboard/despesas?months=${selectedMonths.join(",")}`}>
                Cancelar edicao
              </Link>
            ) : null}
          </div>

          <form action={saveDespesa} className="mt-6 space-y-4">
            <input type="hidden" name="id" value={despesaEmEdicao?.id ?? ""} />
            <div>
              <label className="mb-2 block text-sm font-medium">Descricao</label>
              <input name="descricao" defaultValue={despesaEmEdicao?.descricao ?? ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" required />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Valor</label>
                <input name="valor" defaultValue={despesaEmEdicao ? Number(despesaEmEdicao.valor).toFixed(2) : ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" placeholder="299.90" required />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Data de vencimento</label>
                <input type="date" name="dataVencimento" defaultValue={despesaEmEdicao ? despesaEmEdicao.dataVencimento.toISOString().slice(0, 10) : ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" required />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Data de pagamento</label>
                <input type="date" name="dataPagamento" defaultValue={despesaEmEdicao?.dataPagamento ? despesaEmEdicao.dataPagamento.toISOString().slice(0, 10) : ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Status</label>
                <select name="status" defaultValue={despesaEmEdicao?.status ?? "pendente"} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent">
                  <option value="pendente">Pendente</option>
                  <option value="paga">Paga</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Categoria</label>
              <select name="categoriaId" defaultValue={despesaEmEdicao?.categoriaDespesaId ?? ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" required>
                <option value="" disabled>Selecione uma categoria</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>
                ))}
              </select>
              <p className="mt-2 text-xs text-muted">Cadastre novas categorias em <Link href="/dashboard/categorias" className="text-accent">Categorias</Link>.</p>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Observacoes</label>
              <textarea name="observacoes" defaultValue={despesaEmEdicao?.observacoes ?? ""} className="min-h-28 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" />
            </div>
            <button className="w-full rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong">
              {despesaEmEdicao ? "Salvar alteracoes" : "Cadastrar despesa"}
            </button>
          </form>
        </article>

        <DashboardListPanel title="Despesas cadastradas" totalLabel={formatCurrency(totalDespesas)}>
          {despesas.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-muted">Nenhuma despesa cadastrada para o periodo selecionado.</p>
          ) : (
            despesas.map((despesa) => (
              <div key={despesa.id} className="rounded-2xl border border-border px-4 py-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{despesa.descricao}</h3>
                    <p className="mt-1 text-sm text-muted">{despesa.categoriaDespesa.nome} · vence em {formatDate(despesa.dataVencimento)} · {despesa.status}</p>
                    {despesa.dataPagamento ? <p className="mt-1 text-sm text-muted">Pago em {formatDate(despesa.dataPagamento)}</p> : null}
                    {despesa.observacoes ? <p className="mt-2 text-sm text-muted">{despesa.observacoes}</p> : null}
                  </div>
                  <div className="flex flex-col items-start gap-3 lg:items-end">
                    <strong className="text-xl">{formatCurrency(Number(despesa.valor))}</strong>
                    <div className="flex gap-2">
                      <Link className="rounded-full border border-border px-3 py-2 text-sm font-medium transition hover:bg-surface-strong" href={`/dashboard/despesas?edit=${despesa.id}&months=${selectedMonths.join(",")}`}>
                        Editar
                      </Link>
                      <form action={deleteDespesa}>
                        <input type="hidden" name="id" value={despesa.id} />
                        <button className="rounded-full border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50">Excluir</button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </DashboardListPanel>
      </div>
    </section>
  );
}
