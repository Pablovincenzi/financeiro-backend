import Link from "next/link";

import { deleteFatura, saveFatura } from "@/app/dashboard/finance-actions";
import { requireCurrentUser } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";

type PageProps = {
  searchParams?: Promise<{ edit?: string }>;
};

export default async function FaturasPage({ searchParams }: PageProps) {
  const { userId } = await requireCurrentUser();
  const params = searchParams ? await searchParams : undefined;

  const [faturas, cartoes] = await Promise.all([
    prisma.faturaCartao.findMany({
      where: { usuarioId: userId },
      include: { cartao: true, compras: true },
      orderBy: [{ competencia: "desc" }, { dataVencimento: "asc" }],
    }),
    prisma.cartao.findMany({ where: { usuarioId: userId, ativo: true }, orderBy: { nome: "asc" } }),
  ]);

  const faturaEmEdicao = params?.edit ? faturas.find((item) => item.id === Number(params.edit)) : null;

  return (
    <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
      <article className="rounded-[1.75rem] border border-border bg-surface px-6 py-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted">Faturas</p>
            <h2 className="mt-2 text-2xl font-semibold">{faturaEmEdicao ? "Editar fatura" : "Nova fatura"}</h2>
          </div>
          {faturaEmEdicao ? <Link className="text-sm font-medium text-accent" href="/dashboard/faturas">Cancelar edicao</Link> : null}
        </div>

        <form action={saveFatura} className="mt-6 space-y-4">
          <input type="hidden" name="id" value={faturaEmEdicao?.id ?? ""} />
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Cartao</label>
              <select name="cartaoId" defaultValue={faturaEmEdicao?.cartaoId ?? ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" required>
                <option value="">Selecione</option>
                {cartoes.map((cartao) => <option key={cartao.id} value={cartao.id}>{cartao.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Competencia</label>
              <input name="competencia" placeholder="2026-03" defaultValue={faturaEmEdicao?.competencia ?? ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" required />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Data de fechamento</label>
              <input type="date" name="dataFechamento" defaultValue={faturaEmEdicao ? faturaEmEdicao.dataFechamento.toISOString().slice(0, 10) : ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Data de vencimento</label>
              <input type="date" name="dataVencimento" defaultValue={faturaEmEdicao ? faturaEmEdicao.dataVencimento.toISOString().slice(0, 10) : ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" required />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium">Valor total</label>
              <input name="valorTotal" defaultValue={faturaEmEdicao ? Number(faturaEmEdicao.valorTotal).toFixed(2) : ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Valor pago</label>
              <input name="valorPago" defaultValue={faturaEmEdicao ? Number(faturaEmEdicao.valorPago).toFixed(2) : ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Status</label>
              <select name="status" defaultValue={faturaEmEdicao?.status ?? "aberta"} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent">
                <option value="aberta">Aberta</option>
                <option value="fechada">Fechada</option>
                <option value="paga">Paga</option>
              </select>
            </div>
          </div>
          <button className="w-full rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong">{faturaEmEdicao ? "Salvar alteracoes" : "Cadastrar fatura"}</button>
        </form>
      </article>

      <article className="rounded-[1.75rem] border border-border bg-surface px-6 py-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted">Lista</p>
            <h2 className="mt-2 text-2xl font-semibold">Faturas cadastradas</h2>
          </div>
          <span className="rounded-full bg-surface-strong px-3 py-1 text-sm text-muted">{faturas.length} itens</span>
        </div>
        <div className="mt-6 space-y-3">
          {faturas.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-muted">Nenhuma fatura cadastrada ainda.</p>
          ) : (
            faturas.map((fatura) => (
              <div key={fatura.id} className="rounded-2xl border border-border px-4 py-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{fatura.cartao.nome} · {fatura.competencia}</h3>
                    <p className="mt-1 text-sm text-muted">Fecha em {formatDate(fatura.dataFechamento)} · vence em {formatDate(fatura.dataVencimento)} · {fatura.status}</p>
                    <p className="mt-1 text-sm text-muted">{fatura.compras.length} compras vinculadas</p>
                  </div>
                  <div className="flex flex-col items-start gap-3 lg:items-end">
                    <strong className="text-xl">{formatCurrency(Number(fatura.valorTotal))}</strong>
                    <span className="text-sm text-muted">Pago: {formatCurrency(Number(fatura.valorPago))}</span>
                    <div className="flex gap-2">
                      <Link className="rounded-full border border-border px-3 py-2 text-sm font-medium transition hover:bg-surface-strong" href={`/dashboard/faturas?edit=${fatura.id}`}>Editar</Link>
                      <form action={deleteFatura}>
                        <input type="hidden" name="id" value={fatura.id} />
                        <button className="rounded-full border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50">Excluir</button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </article>
    </section>
  );
}
