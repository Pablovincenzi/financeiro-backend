import Link from "next/link";

import { saveReceita, deleteReceita } from "@/app/dashboard/finance-actions";
import { requireCurrentUser } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";

type PageProps = {
  searchParams?: Promise<{
    edit?: string;
  }>;
};

export default async function ReceitasPage({ searchParams }: PageProps) {
  const { userId } = await requireCurrentUser();
  const params = searchParams ? await searchParams : undefined;

  const receitas = await prisma.receita.findMany({
    where: { usuarioId: userId },
    orderBy: { dataRecebimento: "desc" },
  });

  const receitaEmEdicao = params?.edit
    ? receitas.find((item) => item.id === Number(params.edit))
    : null;

  return (
    <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
      <article className="rounded-[1.75rem] border border-border bg-surface px-6 py-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted">Receitas</p>
            <h2 className="mt-2 text-2xl font-semibold">
              {receitaEmEdicao ? "Editar receita" : "Nova receita"}
            </h2>
          </div>
          {receitaEmEdicao ? (
            <Link className="text-sm font-medium text-accent" href="/dashboard/receitas">
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
              <input name="valor" defaultValue={receitaEmEdicao ? Number(receitaEmEdicao.valor).toFixed(2) : ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" placeholder="1500.00" required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Data de recebimento</label>
              <input type="date" name="dataRecebimento" defaultValue={receitaEmEdicao ? receitaEmEdicao.dataRecebimento.toISOString().slice(0, 10) : ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" required />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Categoria</label>
              <input name="categoria" defaultValue={receitaEmEdicao?.categoria ?? ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" placeholder="Salario" />
            </div>
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

      <article className="rounded-[1.75rem] border border-border bg-surface px-6 py-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted">Lista</p>
            <h2 className="mt-2 text-2xl font-semibold">Receitas cadastradas</h2>
          </div>
          <span className="rounded-full bg-surface-strong px-3 py-1 text-sm text-muted">{receitas.length} itens</span>
        </div>

        <div className="mt-6 space-y-3">
          {receitas.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-muted">
              Nenhuma receita cadastrada ainda.
            </p>
          ) : (
            receitas.map((receita) => (
              <div key={receita.id} className="rounded-2xl border border-border px-4 py-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{receita.descricao}</h3>
                    <p className="mt-1 text-sm text-muted">
                      {receita.categoria ?? "Sem categoria"} · {formatDate(receita.dataRecebimento)} · {receita.status}
                    </p>
                    {receita.observacoes ? (
                      <p className="mt-2 text-sm text-muted">{receita.observacoes}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-col items-start gap-3 lg:items-end">
                    <strong className="text-xl">{formatCurrency(Number(receita.valor))}</strong>
                    <div className="flex gap-2">
                      <Link className="rounded-full border border-border px-3 py-2 text-sm font-medium transition hover:bg-surface-strong" href={`/dashboard/receitas?edit=${receita.id}`}>
                        Editar
                      </Link>
                      <form action={deleteReceita}>
                        <input type="hidden" name="id" value={receita.id} />
                        <button className="rounded-full border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50">
                          Excluir
                        </button>
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

