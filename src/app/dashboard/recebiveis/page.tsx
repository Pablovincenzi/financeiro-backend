import Link from "next/link";

import { deleteRecebivel, saveRecebivel } from "@/app/dashboard/finance-actions";
import { MoneyInput } from "@/components/dashboard/money-input";
import { requireCurrentUser } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";

type PageProps = {
  searchParams?: Promise<{ edit?: string }>;
};

export default async function RecebiveisPage({ searchParams }: PageProps) {
  const { userId } = await requireCurrentUser();
  const params = searchParams ? await searchParams : undefined;

  const recebiveis = await prisma.recebivel.findMany({
    where: { usuarioId: userId },
    orderBy: { dataEsperada: "asc" },
  });

  const recebivelEmEdicao = params?.edit ? recebiveis.find((item) => item.id === Number(params.edit)) : null;

  return (
    <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
      <article className="rounded-[1.75rem] border border-border bg-surface px-6 py-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted">Recebiveis</p>
            <h2 className="mt-2 text-2xl font-semibold">{recebivelEmEdicao ? "Editar recebivel" : "Novo recebivel"}</h2>
          </div>
          {recebivelEmEdicao ? <Link className="text-sm font-medium text-accent" href="/dashboard/recebiveis">Cancelar edicao</Link> : null}
        </div>

        <form action={saveRecebivel} className="mt-6 space-y-4">
          <input type="hidden" name="id" value={recebivelEmEdicao?.id ?? ""} />
          <div>
            <label className="mb-2 block text-sm font-medium">Descricao</label>
            <input name="descricao" defaultValue={recebivelEmEdicao?.descricao ?? ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" required />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Valor previsto</label>
              <MoneyInput name="valorPrevisto" defaultValue={recebivelEmEdicao ? Number(recebivelEmEdicao.valorPrevisto) : ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Origem</label>
              <input name="origem" defaultValue={recebivelEmEdicao?.origem ?? ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" placeholder="Cliente ou contrato" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium">Data esperada</label>
              <input type="date" name="dataEsperada" defaultValue={recebivelEmEdicao ? recebivelEmEdicao.dataEsperada.toISOString().slice(0, 10) : ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Data de recebimento</label>
              <input type="date" name="dataRecebimento" defaultValue={recebivelEmEdicao?.dataRecebimento ? recebivelEmEdicao.dataRecebimento.toISOString().slice(0, 10) : ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Status</label>
              <select name="status" defaultValue={recebivelEmEdicao?.status ?? "pendente"} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent">
                <option value="pendente">Pendente</option>
                <option value="recebido">Recebido</option>
                <option value="atrasado">Atrasado</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Categoria</label>
            <input name="categoria" defaultValue={recebivelEmEdicao?.categoria ?? ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" placeholder="Prestacao de servico" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Observacoes</label>
            <textarea name="observacoes" defaultValue={recebivelEmEdicao?.observacoes ?? ""} className="min-h-28 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" />
          </div>
          <button className="w-full rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong">{recebivelEmEdicao ? "Salvar alteracoes" : "Cadastrar recebivel"}</button>
        </form>
      </article>

      <article className="rounded-[1.75rem] border border-border bg-surface px-6 py-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted">Lista</p>
            <h2 className="mt-2 text-2xl font-semibold">Valores a receber</h2>
          </div>
          <span className="rounded-full bg-surface-strong px-3 py-1 text-sm text-muted">{recebiveis.length} itens</span>
        </div>
        <div className="mt-6 space-y-3">
          {recebiveis.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-muted">Nenhum recebivel cadastrado ainda.</p>
          ) : (
            recebiveis.map((recebivel) => (
              <div key={recebivel.id} className="rounded-2xl border border-border px-4 py-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{recebivel.descricao}</h3>
                    <p className="mt-1 text-sm text-muted">{recebivel.origem ?? "Sem origem"} Â· previsto para {formatDate(recebivel.dataEsperada)} Â· {recebivel.status}</p>
                    <p className="mt-1 text-sm text-muted">{recebivel.categoria ?? "Sem categoria"}{recebivel.dataRecebimento ? ` Â· recebido em ${formatDate(recebivel.dataRecebimento)}` : ""}</p>
                    {recebivel.observacoes ? <p className="mt-2 text-sm text-muted">{recebivel.observacoes}</p> : null}
                  </div>
                  <div className="flex flex-col items-start gap-3 lg:items-end">
                    <strong className="text-xl">{formatCurrency(Number(recebivel.valorPrevisto))}</strong>
                    <div className="flex gap-2">
                      <Link className="rounded-full border border-border px-3 py-2 text-sm font-medium transition hover:bg-surface-strong" href={`/dashboard/recebiveis?edit=${recebivel.id}`}>Editar</Link>
                      <form action={deleteRecebivel}>
                        <input type="hidden" name="id" value={recebivel.id} />
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
