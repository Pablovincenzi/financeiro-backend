import Link from "next/link";

import { deleteReceita, saveReceita } from "@/app/dashboard/finance-actions";
import { DashboardListPanel } from "@/components/dashboard/dashboard-list-panel";
import { DashboardPeriodHeader } from "@/components/dashboard/dashboard-period-header";
import { MoneyInput } from "@/components/dashboard/money-input";
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
import { getUniqueTags } from "@/lib/tags";

type PageProps = {
  searchParams?: Promise<{
    edit?: string;
    months?: string;
  }>;
};

export default async function ReceitasPage({ searchParams }: PageProps) {
  const { userId } = await requireCurrentUser();
  const params = searchParams ? await searchParams : undefined;
  const selectedMonths = parseSelectedMonths(params?.months);
  const monthOptions = buildRecentMonthOptions(6, 8);
  const monthRanges = buildMonthRanges(selectedMonths);

  const [receitas, rawTags] = await Promise.all([
    prisma.receita.findMany({
      where: {
        usuarioId: userId,
        OR: monthRanges.map(({ start, end }) => ({
          dataRecebimento: { gte: start, lte: end },
        })),
      },
      orderBy: { dataRecebimento: "desc" },
      include: { tag: true },
    }),
    prisma.tag.findMany({ orderBy: { nome: "asc" } }),
  ]);

  const tags = getUniqueTags(rawTags);
  const receitaEmEdicao = params?.edit ? receitas.find((item) => item.id === Number(params.edit)) : null;
  const totalReceitas = receitas.reduce((sum, item) => sum + Number(item.valor), 0);
  const totalRecebidas = receitas.filter((item) => item.status === "recebida").reduce((sum, item) => sum + Number(item.valor), 0);
  const totalPrevistas = receitas.filter((item) => item.status === "prevista").reduce((sum, item) => sum + Number(item.valor), 0);
  const periodLabel = formatSelectedMonthsSummary(selectedMonths);

  return (
    <section className="grid gap-4">
      <DashboardPeriodHeader
        eyebrow="Receitas"
        title="Acompanhe entradas por varios meses sem perder a leitura do periodo."
        description={`Consulte rapidamente o periodo de ${periodLabel} e combine meses passados e futuros para consolidar receitas previstas e recebidas.`}
        pathname="/dashboard/receitas"
        selectedMonths={selectedMonths}
        monthOptions={monthOptions}
        extraParams={{ edit: params?.edit }}
        metrics={[
          { label: "Total do periodo", value: formatCurrency(totalReceitas), detail: "Soma das receitas listadas para os meses selecionados." },
          { label: "Recebidas", value: formatCurrency(totalRecebidas), detail: "Valores ja confirmados como recebidos." },
          { label: "Previstas", value: formatCurrency(totalPrevistas), detail: "Receitas ainda previstas dentro do recorte atual." },
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="rounded-[1.75rem] border border-border bg-surface px-6 py-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-muted">Receitas</p>
              <h2 className="mt-2 text-2xl font-semibold">{receitaEmEdicao ? "Editar receita" : "Nova receita"}</h2>
            </div>
            {receitaEmEdicao ? (
              <Link className="text-sm font-medium text-accent" href={`/dashboard/receitas?months=${selectedMonths.join(",")}`}>
                Cancelar edicao
              </Link>
            ) : null}
          </div>

          <form action={saveReceita} className="mt-6 space-y-4">
            <input type="hidden" name="id" value={receitaEmEdicao?.id ?? ""} />

            <div>
              <label className="mb-2 block text-sm font-medium">Descricao</label>
              <input name="descricao" defaultValue={receitaEmEdicao?.descricao ?? ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" required />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Valor</label>
                <MoneyInput name="valor" defaultValue={receitaEmEdicao ? Number(receitaEmEdicao.valor) : ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" placeholder="1.500,00" required />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Data de recebimento</label>
                <input type="date" name="dataRecebimento" defaultValue={receitaEmEdicao ? receitaEmEdicao.dataRecebimento.toISOString().slice(0, 10) : ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" required />
              </div>
            </div>

            {!receitaEmEdicao ? (
              <div>
                <label className="mb-2 block text-sm font-medium">Quantidade de parcelas</label>
                <input type="number" name="quantidadeParcelas" min="1" max="120" defaultValue="1" className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" required />
                <p className="mt-2 text-xs text-muted">Se informar mais de 1, o sistema criara receitas mensais futuras com a mesma configuracao.</p>
              </div>
            ) : null}

            <div>
              <label className="mb-2 block text-sm font-medium">Tag</label>
              <select name="tagId" defaultValue={receitaEmEdicao?.tagId ?? ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" required>
                <option value="" disabled>Selecione uma tag</option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>{tag.nome}</option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Status</label>
                <select name="status" defaultValue={receitaEmEdicao?.status ?? "prevista"} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent">
                  <option value="prevista">Prevista</option>
                  <option value="recebida">Recebida</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Observacoes</label>
              <textarea name="observacoes" defaultValue={receitaEmEdicao?.observacoes ?? ""} className="min-h-28 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" />
            </div>

            <button className="w-full rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong">
              {receitaEmEdicao ? "Salvar alteracoes" : "Cadastrar receita"}
            </button>
          </form>
        </article>

        <DashboardListPanel title="Receitas cadastradas" totalLabel={formatCurrency(totalReceitas)}>
          {receitas.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-muted">Nenhuma receita cadastrada para o periodo selecionado.</p>
          ) : (
            receitas.map((receita) => (
              <div key={receita.id} className="rounded-2xl border border-border px-4 py-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{receita.descricao}</h3>
                    <p className="mt-1 text-sm text-muted">
                      {receita.tag?.nome ?? "Sem tag"} | {formatDate(receita.dataRecebimento)} | {receita.status}
                    </p>
                    {receita.observacoes ? <p className="mt-2 text-sm text-muted">{receita.observacoes}</p> : null}
                  </div>
                  <div className="flex flex-col items-start gap-3 lg:items-end">
                    <strong className="text-xl">{formatCurrency(Number(receita.valor))}</strong>
                    <div className="flex gap-2">
                      <Link className="rounded-full border border-border px-3 py-2 text-sm font-medium transition hover:bg-surface-strong" href={`/dashboard/receitas?edit=${receita.id}&months=${selectedMonths.join(",")}`}>
                        Editar
                      </Link>
                      <form action={deleteReceita}>
                        <input type="hidden" name="id" value={receita.id} />
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
