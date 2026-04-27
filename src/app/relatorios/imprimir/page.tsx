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

function groupByUser(
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
  const grouped = new Map<
    string,
    {
      userName: string;
      items: typeof despesas;
      subtotal: number;
    }
  >();

  despesas.forEach((despesa) => {
    const userName = despesa.usuario.pessoa.nomeCompleto;
    const current = grouped.get(userName) ?? { userName, items: [], subtotal: 0 };

    current.items.push(despesa);
    current.subtotal += Number(despesa.valor);
    grouped.set(userName, current);
  });

  return [...grouped.values()].sort((left, right) => left.userName.localeCompare(right.userName));
}

export default async function RelatorioImpressaoPage({ searchParams }: PageProps) {
  const { userId } = await requireCurrentUser();
  const params = searchParams ? await searchParams : undefined;
  const selectedMonths = parseSelectedMonths(params?.months);
  const monthRanges = buildMonthRanges(selectedMonths);
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

  const despesas = await prisma.despesa.findMany({
    where: {
      OR: monthRanges.map(({ start, end }) => ({ dataVencimento: { gte: start, lte: end } })),
      categoriaDespesa: accessibleCategoryWhere,
      ...(selectedTagId ? { tagId: selectedTagId } : {}),
      ...(selectedCategoriaIds.length > 0 ? { categoriaDespesaId: { in: selectedCategoriaIds } } : {}),
      ...(selectedUsuarioId ? { usuarioId: selectedUsuarioId } : {}),
      ...(selectedFormaPagamento ? { formaPagamento: selectedFormaPagamento } : {}),
    },
    orderBy: [{ usuario: { pessoa: { nomeCompleto: "asc" } } }, { dataVencimento: "asc" }, { createdAt: "asc" }],
    include: {
      categoriaDespesa: true,
      tag: true,
      usuario: {
        include: {
          pessoa: true,
        },
      },
    },
  });

  const grouped = groupByUser(despesas);
  const totalGeral = despesas.reduce((sum, item) => sum + Number(item.valor), 0);
  const initialDate = monthRanges[monthRanges.length - 1]?.start ?? monthRanges[0].start;
  const finalDate = monthRanges[0]?.end ?? monthRanges[monthRanges.length - 1].end;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900 print:bg-white print:px-0 print:py-0">
      <div className="mx-auto max-w-6xl rounded-3xl bg-white p-6 shadow-sm print:max-w-none print:rounded-none print:p-8 print:shadow-none">
        <ReportPrintActions />

        <header className="border-b border-slate-300 pb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Relatorio</p>
          <h1 className="mt-2 text-3xl font-bold">Despesas</h1>
          <p className="mt-2 text-sm font-medium">
            Periodo de {formatDate(initialDate)} a {formatDate(finalDate)}
          </p>
        </header>

        <section className="mt-6 space-y-6">
          {grouped.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-sm text-slate-500">
              Nenhuma despesa encontrada para os filtros selecionados.
            </p>
          ) : (
            grouped.map((group) => (
              <article key={group.userName} className="space-y-3">
                <div>
                  <h2 className="text-lg font-bold">Usuario: {group.userName}</h2>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-300">
                  <table className="w-full border-collapse text-sm">
                    <thead className="bg-slate-100 text-left">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Vencimento</th>
                        <th className="px-3 py-2 font-semibold">Descricao</th>
                        <th className="px-3 py-2 font-semibold">Categoria</th>
                        <th className="px-3 py-2 font-semibold">Tag</th>
                        <th className="px-3 py-2 font-semibold">Forma de pagamento</th>
                        <th className="px-3 py-2 text-right font-semibold">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.items.map((despesa) => (
                        <tr key={despesa.id} className="border-t border-slate-200">
                          <td className="px-3 py-2">{formatDate(despesa.dataVencimento)}</td>
                          <td className="px-3 py-2">{despesa.descricao}</td>
                          <td className="px-3 py-2">{despesa.categoriaDespesa.nome}</td>
                          <td className="px-3 py-2">{despesa.tag?.nome ?? "Sem tag"}</td>
                          <td className="px-3 py-2">{formatPaymentMethodLabel(despesa.formaPagamento)}</td>
                          <td className="px-3 py-2 text-right">{formatCurrency(Number(despesa.valor))}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50">
                      <tr>
                        <td colSpan={5} className="px-3 py-2 text-right font-semibold">
                          Subtotal
                        </td>
                        <td className="px-3 py-2 text-right font-semibold">{formatCurrency(group.subtotal)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </article>
            ))
          )}
        </section>

        <footer className="mt-8 border-t border-slate-300 pt-4">
          <div className="flex justify-end gap-3 text-lg font-bold">
            <span>Total geral</span>
            <span>{formatCurrency(totalGeral)}</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
