import Link from "next/link";

import { deletePix, savePix } from "@/app/dashboard/finance-actions";
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

type PageProps = {
  searchParams?: Promise<{ edit?: string; months?: string }>;
};

export default async function PixPage({ searchParams }: PageProps) {
  const { userId } = await requireCurrentUser();
  const params = searchParams ? await searchParams : undefined;
  const selectedMonths = parseSelectedMonths(params?.months);
  const monthOptions = buildRecentMonthOptions(6);
  const monthRanges = buildMonthRanges(selectedMonths);

  const transacoes = await prisma.pixTransacao.findMany({
    where: {
      usuarioId: userId,
      OR: monthRanges.map(({ start, end }) => ({
        dataPix: { gte: start, lte: end },
      })),
    },
    orderBy: { dataPix: "desc" },
  });

  const pixEmEdicao = params?.edit ? transacoes.find((item) => item.id === Number(params.edit)) : null;
  const totalRecebido = transacoes.filter((item) => item.tipo === "recebido").reduce((sum, item) => sum + Number(item.valor), 0);
  const totalEnviado = transacoes.filter((item) => item.tipo === "enviado").reduce((sum, item) => sum + Number(item.valor), 0);
  const saldoPix = totalRecebido - totalEnviado;
  const totalMovimentado = transacoes.reduce((sum, item) => sum + Number(item.valor), 0);
  const periodLabel = formatSelectedMonthsSummary(selectedMonths);

  return (
    <section className="grid gap-4">
      <DashboardPeriodHeader
        eyebrow="PIX"
        title="Analise o fluxo de PIX em varios meses com leitura consolidada do periodo."
        description={`Combine ${periodLabel} para visualizar entradas, saidas e saldo do conjunto selecionado.`}
        pathname="/dashboard/pix"
        selectedMonths={selectedMonths}
        monthOptions={monthOptions}
        extraParams={{ edit: params?.edit }}
        metrics={[
          { label: "Total movimentado", value: formatCurrency(totalMovimentado), detail: "Soma de todas as transacoes listadas para o periodo." },
          { label: "PIX recebidos", value: formatCurrency(totalRecebido), detail: "Entradas via PIX dentro do recorte atual." },
          { label: "Saldo do periodo", value: formatCurrency(saldoPix), detail: "Diferenca entre recebimentos e envios no conjunto filtrado.", valueClassName: saldoPix >= 0 ? "text-blue-200" : "text-orange-300" },
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="rounded-[1.75rem] border border-border bg-surface px-6 py-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-muted">PIX</p>
              <h2 className="mt-2 text-2xl font-semibold">{pixEmEdicao ? "Editar transacao PIX" : "Nova transacao PIX"}</h2>
            </div>
            {pixEmEdicao ? <Link className="text-sm font-medium text-accent" href={`/dashboard/pix?months=${selectedMonths.join(",")}`}>Cancelar edicao</Link> : null}
          </div>

          <form action={savePix} className="mt-6 space-y-4">
            <input type="hidden" name="id" value={pixEmEdicao?.id ?? ""} />
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Tipo</label>
                <select name="tipo" defaultValue={pixEmEdicao?.tipo ?? "recebido"} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent">
                  <option value="recebido">Recebido</option>
                  <option value="enviado">Enviado</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Valor</label>
                <MoneyInput name="valor" defaultValue={pixEmEdicao ? Number(pixEmEdicao.valor) : ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" required />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Descricao</label>
              <input name="descricao" defaultValue={pixEmEdicao?.descricao ?? ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" required />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Data do PIX</label>
                <input type="date" name="dataPix" defaultValue={pixEmEdicao ? pixEmEdicao.dataPix.toISOString().slice(0, 10) : ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" required />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Conta de origem/destino</label>
                <input name="conta" defaultValue={pixEmEdicao?.conta ?? ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" placeholder="Banco principal" />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Categoria</label>
              <input name="categoria" defaultValue={pixEmEdicao?.categoria ?? ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" placeholder="Transferencia" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Observacoes</label>
              <textarea name="observacoes" defaultValue={pixEmEdicao?.observacoes ?? ""} className="min-h-28 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" />
            </div>
            <button className="w-full rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong">{pixEmEdicao ? "Salvar alteracoes" : "Cadastrar PIX"}</button>
          </form>
        </article>

        <DashboardListPanel title="Transacoes PIX" totalLabel={formatCurrency(totalMovimentado)}>
          {transacoes.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-muted">Nenhuma transacao PIX cadastrada para o periodo selecionado.</p>
          ) : (
            transacoes.map((pix) => (
              <div key={pix.id} className="rounded-2xl border border-border px-4 py-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{pix.descricao}</h3>
                    <p className="mt-1 text-sm text-muted">{pix.tipo} Ã‚Â· {formatDate(pix.dataPix)} Ã‚Â· {pix.categoria ?? "Sem categoria"}</p>
                    <p className="mt-1 text-sm text-muted">{pix.conta ?? "Sem conta informada"}</p>
                    {pix.observacoes ? <p className="mt-2 text-sm text-muted">{pix.observacoes}</p> : null}
                  </div>
                  <div className="flex flex-col items-start gap-3 lg:items-end">
                    <strong className="text-xl">{formatCurrency(Number(pix.valor))}</strong>
                    <div className="flex gap-2">
                      <Link className="rounded-full border border-border px-3 py-2 text-sm font-medium transition hover:bg-surface-strong" href={`/dashboard/pix?edit=${pix.id}&months=${selectedMonths.join(",")}`}>Editar</Link>
                      <form action={deletePix}>
                        <input type="hidden" name="id" value={pix.id} />
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
