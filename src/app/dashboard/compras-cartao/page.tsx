import Link from "next/link";

import { deleteCompraCartao, saveCompraCartao } from "@/app/dashboard/finance-actions";
import { requireCurrentUser } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";

type PageProps = {
  searchParams?: Promise<{ edit?: string }>;
};

export default async function ComprasCartaoPage({ searchParams }: PageProps) {
  const { userId } = await requireCurrentUser();
  const params = searchParams ? await searchParams : undefined;

  const [compras, cartoes, faturas] = await Promise.all([
    prisma.compraCartao.findMany({
      where: { usuarioId: userId },
      include: { cartao: true, fatura: true },
      orderBy: { dataCompra: "desc" },
    }),
    prisma.cartao.findMany({ where: { usuarioId: userId, ativo: true }, orderBy: { nome: "asc" } }),
    prisma.faturaCartao.findMany({ where: { usuarioId: userId }, orderBy: [{ competencia: "desc" }, { id: "desc" }] }),
  ]);

  const compraEmEdicao = params?.edit ? compras.find((item) => item.id === Number(params.edit)) : null;

  return (
    <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
      <article className="rounded-[1.75rem] border border-border bg-surface px-6 py-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted">Compras no cartao</p>
            <h2 className="mt-2 text-2xl font-semibold">{compraEmEdicao ? "Editar compra" : "Nova compra"}</h2>
          </div>
          {compraEmEdicao ? <Link className="text-sm font-medium text-accent" href="/dashboard/compras-cartao">Cancelar edicao</Link> : null}
        </div>

        <form action={saveCompraCartao} className="mt-6 space-y-4">
          <input type="hidden" name="id" value={compraEmEdicao?.id ?? ""} />
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Cartao</label>
              <select name="cartaoId" defaultValue={compraEmEdicao?.cartaoId ?? ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" required>
                <option value="">Selecione</option>
                {cartoes.map((cartao) => <option key={cartao.id} value={cartao.id}>{cartao.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Fatura</label>
              <select name="faturaId" defaultValue={compraEmEdicao?.faturaId ?? ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent">
                <option value="">Sem vinculo</option>
                {faturas.map((fatura) => <option key={fatura.id} value={fatura.id}>{fatura.competencia} · {fatura.status}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Descricao</label>
            <input name="descricao" defaultValue={compraEmEdicao?.descricao ?? ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" required />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium">Valor</label>
              <input name="valor" defaultValue={compraEmEdicao ? Number(compraEmEdicao.valor).toFixed(2) : ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Data da compra</label>
              <input type="date" name="dataCompra" defaultValue={compraEmEdicao ? compraEmEdicao.dataCompra.toISOString().slice(0, 10) : ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Status</label>
              <select name="status" defaultValue={compraEmEdicao?.status ?? "lancada"} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent">
                <option value="lancada">Lancada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Categoria</label>
            <input name="categoria" defaultValue={compraEmEdicao?.categoria ?? ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" placeholder="Mercado" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Observacoes</label>
            <textarea name="observacoes" defaultValue={compraEmEdicao?.observacoes ?? ""} className="min-h-28 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" />
          </div>
          <button className="w-full rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong">{compraEmEdicao ? "Salvar alteracoes" : "Cadastrar compra"}</button>
        </form>
      </article>

      <article className="rounded-[1.75rem] border border-border bg-surface px-6 py-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted">Lista</p>
            <h2 className="mt-2 text-2xl font-semibold">Compras cadastradas</h2>
          </div>
          <span className="rounded-full bg-surface-strong px-3 py-1 text-sm text-muted">{compras.length} itens</span>
        </div>
        <div className="mt-6 space-y-3">
          {compras.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-muted">Nenhuma compra cadastrada ainda.</p>
          ) : (
            compras.map((compra) => (
              <div key={compra.id} className="rounded-2xl border border-border px-4 py-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{compra.descricao}</h3>
                    <p className="mt-1 text-sm text-muted">{compra.cartao.nome} · {formatDate(compra.dataCompra)} · {compra.status}</p>
                    <p className="mt-1 text-sm text-muted">{compra.categoria ?? "Sem categoria"}{compra.fatura ? ` · fatura ${compra.fatura.competencia}` : ""}</p>
                    {compra.observacoes ? <p className="mt-2 text-sm text-muted">{compra.observacoes}</p> : null}
                  </div>
                  <div className="flex flex-col items-start gap-3 lg:items-end">
                    <strong className="text-xl">{formatCurrency(Number(compra.valor))}</strong>
                    <div className="flex gap-2">
                      <Link className="rounded-full border border-border px-3 py-2 text-sm font-medium transition hover:bg-surface-strong" href={`/dashboard/compras-cartao?edit=${compra.id}`}>Editar</Link>
                      <form action={deleteCompraCartao}>
                        <input type="hidden" name="id" value={compra.id} />
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
