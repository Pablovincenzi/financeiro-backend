import Link from "next/link";

import { deleteCartao, saveCartao } from "@/app/dashboard/finance-actions";
import { requireCurrentUser } from "@/lib/auth";
import { formatCurrency } from "@/lib/format";
import { prisma } from "@/lib/prisma";

type PageProps = {
  searchParams?: Promise<{ edit?: string }>;
};

export default async function CartoesPage({ searchParams }: PageProps) {
  const { userId } = await requireCurrentUser();
  const params = searchParams ? await searchParams : undefined;

  const cartoes = await prisma.cartao.findMany({
    where: { usuarioId: userId },
    orderBy: [{ ativo: "desc" }, { nome: "asc" }],
  });

  const cartaoEmEdicao = params?.edit ? cartoes.find((item) => item.id === Number(params.edit)) : null;

  return (
    <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
      <article className="rounded-[1.75rem] border border-border bg-surface px-6 py-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted">Cartoes</p>
            <h2 className="mt-2 text-2xl font-semibold">{cartaoEmEdicao ? "Editar cartao" : "Novo cartao"}</h2>
          </div>
          {cartaoEmEdicao ? <Link className="text-sm font-medium text-accent" href="/dashboard/cartoes">Cancelar edicao</Link> : null}
        </div>

        <form action={saveCartao} className="mt-6 space-y-4">
          <input type="hidden" name="id" value={cartaoEmEdicao?.id ?? ""} />
          <div>
            <label className="mb-2 block text-sm font-medium">Nome do cartao</label>
            <input name="nome" defaultValue={cartaoEmEdicao?.nome ?? ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" required />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Bandeira</label>
              <input name="bandeira" defaultValue={cartaoEmEdicao?.bandeira ?? ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" placeholder="Visa" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Apelido</label>
              <input name="apelido" defaultValue={cartaoEmEdicao?.apelido ?? ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" placeholder="Cartao principal" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium">Ultimos 4 digitos</label>
              <input name="ultimosDigitos" maxLength={4} defaultValue={cartaoEmEdicao?.ultimosDigitos ?? ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Limite</label>
              <input name="limite" defaultValue={cartaoEmEdicao?.limite ? Number(cartaoEmEdicao.limite).toFixed(2) : ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" placeholder="5000.00" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Ativo</label>
              <select name="ativo" defaultValue={String(cartaoEmEdicao?.ativo ?? true)} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent">
                <option value="true">Sim</option>
                <option value="false">Nao</option>
              </select>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Dia de fechamento</label>
              <input type="number" min="1" max="31" name="diaFechamento" defaultValue={cartaoEmEdicao?.diaFechamento ?? ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Dia de vencimento</label>
              <input type="number" min="1" max="31" name="diaVencimento" defaultValue={cartaoEmEdicao?.diaVencimento ?? ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" required />
            </div>
          </div>
          <button className="w-full rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong">
            {cartaoEmEdicao ? "Salvar alteracoes" : "Cadastrar cartao"}
          </button>
        </form>
      </article>

      <article className="rounded-[1.75rem] border border-border bg-surface px-6 py-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted">Lista</p>
            <h2 className="mt-2 text-2xl font-semibold">Cartoes cadastrados</h2>
          </div>
          <span className="rounded-full bg-surface-strong px-3 py-1 text-sm text-muted">{cartoes.length} itens</span>
        </div>
        <div className="mt-6 space-y-3">
          {cartoes.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-muted">Nenhum cartao cadastrado ainda.</p>
          ) : (
            cartoes.map((cartao) => (
              <div key={cartao.id} className="rounded-2xl border border-border px-4 py-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{cartao.nome}</h3>
                    <p className="mt-1 text-sm text-muted">
                      {cartao.bandeira ?? "Sem bandeira"} · final {cartao.ultimosDigitos} · fecha dia {cartao.diaFechamento} · vence dia {cartao.diaVencimento}
                    </p>
                    <p className="mt-1 text-sm text-muted">{cartao.apelido ?? "Sem apelido"} · {cartao.ativo ? "Ativo" : "Inativo"}</p>
                  </div>
                  <div className="flex flex-col items-start gap-3 lg:items-end">
                    <strong className="text-xl">{cartao.limite ? formatCurrency(Number(cartao.limite)) : "Sem limite informado"}</strong>
                    <div className="flex gap-2">
                      <Link className="rounded-full border border-border px-3 py-2 text-sm font-medium transition hover:bg-surface-strong" href={`/dashboard/cartoes?edit=${cartao.id}`}>Editar</Link>
                      <form action={deleteCartao}>
                        <input type="hidden" name="id" value={cartao.id} />
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
