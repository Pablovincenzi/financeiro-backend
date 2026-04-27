import { ReportPrintActions } from "@/components/dashboard/report-print-actions";
import { requireCurrentUser } from "@/lib/auth";
import {
  buildMonthRanges,
  formatCurrency,
  formatDate,
  formatPaymentMethodLabel,
  parseSelectedMonths,
} from "@/lib/format";
import { prisma } from "@/lib/prisma";

type PageProps = {
  searchParams?: Promise<{
    months?: string;
    tagId?: string;
    categoriaIds?: string;
    usuarioId?: string;
    formaPagamento?: string;
  }>;
};

function parseSelectedNumericIds(value?: string) {
  if (!value) {
    return [] as number[];
  }

  return value
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isInteger(item) && item > 0);
}

function buildPeriodRange(monthRanges: Array<{ start: Date; end: Date }>) {
  const sorted = [...monthRanges].sort((left, right) => left.start.getTime() - right.start.getTime());
  return {
    start: sorted[0]?.start ?? new Date(),
    end: sorted.at(-1)?.end ?? new Date(),
  };
}

function groupExpensesByUser(
  despesas: Array<{
    id: number;
    descricao: string;
    valor: unknown;
    dataVencimento: Date;
    formaPagamento: string;
    categoriaDespesa: { nome: string };
    tag: { nome: string } | null;
    usuario: { pessoa: { nomeCompleto: string } };
  }>,
) {
  const grouped = new Map<string, typeof despesas>();

  despesas.forEach((despesa) => {
    const userName = despesa.usuario.pessoa.nomeCompleto;
    const current = grouped.get(userName) ?? [];
    current.push(despesa);
    grouped.set(userName, current);
  });

  return [...grouped.entries()]
    .map(([userName, items]) => ({
      userName,
      items: items.sort((left, right) => left.dataVencimento.getTime() - right.dataVencimento.getTime()),
      subtotal: items.reduce((sum, item) => sum + Number(item.valor), 0),
    }))
    .sort((left, right) => left.userName.localeCompare(right.userName, "pt-BR"));
}

export default async function ImprimirRelatorioPage({ searchParams }: PageProps) {
  const { userId } = await requireCurrentUser();
  const params = searchParams ? await searchParams : undefined;
  const selectedMonths = parseSelectedMonths(params?.months);
  const monthRanges = buildMonthRanges(selectedMonths);
  const selectedTagId = params?.tagId ? Number(params.tagId) : null;
  const selectedCategoriaIds = parseSelectedNumericIds(params?.categoriaIds);
  const selectedUsuarioId = params?.usuarioId ? Number(params.usuarioId) : null;
  const selectedFormaPagamento =
    params?.formaPagamento === "a_vista" || params?.formaPagamento === "a_prazo" ? params.formaPagamento : null;
  const { start, end } = buildPeriodRange(monthRanges);

  const accessibleCategoryWhere = {
    usuarios: {
      some: {
        usuarioId: userId,
      },
    },
  };

  const despesas = await prisma.despesa.findMany({
    where: {
      OR: monthRanges.map(({ start: monthStart, end: monthEnd }) => ({ dataVencimento: { gte: monthStart, lte: monthEnd } })),
      categoriaDespesa: accessibleCategoryWhere,
      ...(selectedTagId ? { tagId: selectedTagId } : {}),
      ...(selectedCategoriaIds.length > 0 ? { categoriaDespesaId: { in: selectedCategoriaIds } } : {}),
      ...(selectedUsuarioId ? { usuarioId: selectedUsuarioId } : {}),
      ...(selectedFormaPagamento ? { formaPagamento: selectedFormaPagamento } : {}),
    },
    include: {
      categoriaDespesa: true,
      tag: true,
      usuario: {
        include: {
          pessoa: true,
        },
      },
    },
    orderBy: [{ usuario: { pessoa: { nomeCompleto: "asc" } } }, { dataVencimento: "asc" }, { descricao: "asc" }],
  });

  const groupedByUser = groupExpensesByUser(despesas);
  const totalGeral = despesas.reduce((sum, despesa) => sum + Number(despesa.valor), 0);

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-950 print:bg-white print:px-0 print:py-0">
      <div className="mx-auto max-w-5xl rounded-[1.5rem] bg-white p-6 shadow-sm print:max-w-none print:rounded-none print:shadow-none">
        <ReportPrintActions />

        <header className="border-b border-slate-300 pb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Relatorio</p>
          <h1 className="mt-2 text-3xl font-bold">Despesas</h1>
          <p className="mt-3 text-sm font-medium text-slate-700">
            Periodo de {formatDate(start)} a {formatDate(end)}
          </p>
        </header>

        <section className="mt-6 space-y-6">
          {groupedByUser.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-sm text-slate-600">
              Nenhuma despesa encontrada para os filtros selecionados.
            </div>
          ) : (
            groupedByUser.map((group) => (
              <article key={group.userName} className="break-inside-avoid border-b border-slate-200 pb-5 last:border-b-0">
                <div className="mb-3">
                  <h2 className="text-lg font-bold">Usuario: {group.userName}</h2>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <table className="min-w-full border-collapse text-sm">
                    <thead className="bg-slate-100 text-left text-[11px] uppercase tracking-[0.18em] text-slate-600">
                      <tr>
                        <th className="px-3 py-2">Vencimento</th>
                        <th className="px-3 py-2">Descricao</th>
                        <th className="px-3 py-2">Categoria</th>
                        <th className="px-3 py-2">Tag</th>
                        <th className="px-3 py-2">Forma de pagamento</th>
                        <th className="px-3 py-2 text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.items.map((despesa, index) => (
                        <tr key={despesa.id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50/70"}>
                          <td className="px-3 py-2">{formatDate(despesa.dataVencimento)}</td>
                          <td className="px-3 py-2 font-medium">{despesa.descricao}</td>
                          <td className="px-3 py-2">{despesa.categoriaDespesa.nome}</td>
                          <td className="px-3 py-2">{despesa.tag?.nome ?? "Sem tag"}</td>
                          <td className="px-3 py-2">{formatPaymentMethodLabel(despesa.formaPagamento)}</td>
                          <td className="px-3 py-2 text-right font-medium">{formatCurrency(Number(despesa.valor))}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-slate-300 bg-slate-100 font-semibold">
                        <td colSpan={5} className="px-3 py-2 text-right">Subtotal</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(group.subtotal)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </article>
            ))
          )}
        </section>

        <footer className="mt-6 border-t border-slate-300 pt-4">
          <div className="flex justify-end text-base font-bold">
            <span>Total geral: {formatCurrency(totalGeral)}</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
