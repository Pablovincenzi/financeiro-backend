import Link from "next/link";

import { deleteContaFixa, saveContaFixa } from "@/app/dashboard/finance-actions";
import { MoneyInput } from "@/components/dashboard/money-input";
import { requireCurrentUser } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";

type PageProps = {
  searchParams?: Promise<{
    edit?: string;
  }>;
};

export default async function ContasFixasPage({ searchParams }: PageProps) {
  const { userId } = await requireCurrentUser();
  const params = searchParams ? await searchParams : undefined;

  const contasFixas = await prisma.contaFixa.findMany({
    where: { usuarioId: userId },
    orderBy: [{ ativa: "desc" }, { diaVencimento: "asc" }],
  });

  const contaEmEdicao = params?.edit
    ? contasFixas.find((item) => item.id === Number(params.edit))
    : null;

  return (
    <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
      <article className="rounded-[1.75rem] border border-border bg-surface px-6 py-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted">Contas fixas</p>
            <h2 className="mt-2 text-2xl font-semibold">
              {contaEmEdicao ? "Editar conta fixa" : "Nova conta fixa"}
            </h2>
          </div>
          {contaEmEdicao ? (
            <Link className="text-sm font-medium text-accent" href="/dashboard/contas-fixas">
              Cancelar edicao
            </Link>
          ) : null}
        </div>

        <form action={saveContaFixa} className="mt-6 space-y-4">
          <input type="hidden" name="id" value={contaEmEdicao?.id ?? ""} />

          <div>
            <label className="mb-2 block text-sm font-medium">Descricao</label>
            <input name="descricao" defaultValue={contaEmEdicao?.descricao ?? ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" required />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Valor previsto</label>
              <MoneyInput name="valorPrevisto" defaultValue={contaEmEdicao ? Number(contaEmEdicao.valorPrevisto) : ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" placeholder="120,00" required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Dia de vencimento</label>
              <input type="number" min="1" max="31" name="diaVencimento" defaultValue={contaEmEdicao?.diaVencimento ?? ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" required />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Categoria</label>
              <input name="categoria" defaultValue={contaEmEdicao?.categoria ?? ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" placeholder="Utilidades" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Periodicidade</label>
              <select name="periodicidade" defaultValue={contaEmEdicao?.periodicidade ?? "mensal"} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent">
                <option value="mensal">Mensal</option>
                <option value="bimestral">Bimestral</option>
                <option value="trimestral">Trimestral</option>
                <option value="anual">Anual</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Proximo vencimento</label>
              <input type="date" name="proximoVencimento" defaultValue={contaEmEdicao?.proximoVencimento ? contaEmEdicao.proximoVencimento.toISOString().slice(0, 10) : ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Ativa</label>
              <select name="ativa" defaultValue={String(contaEmEdicao?.ativa ?? true)} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent">
                <option value="true">Sim</option>
                <option value="false">Nao</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Observacoes</label>
            <textarea name="observacoes" defaultValue={contaEmEdicao?.observacoes ?? ""} className="min-h-28 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" />
          </div>

          <button className="w-full rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong">
            {contaEmEdicao ? "Salvar alteracoes" : "Cadastrar conta fixa"}
          </button>
        </form>
      </article>

      <article className="rounded-[1.75rem] border border-border bg-surface px-6 py-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted">Lista</p>
            <h2 className="mt-2 text-2xl font-semibold">Contas fixas cadastradas</h2>
          </div>
          <span className="rounded-full bg-surface-strong px-3 py-1 text-sm text-muted">{contasFixas.length} itens</span>
        </div>

        <div className="mt-6 space-y-3">
          {contasFixas.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-muted">
              Nenhuma conta fixa cadastrada ainda.
            </p>
          ) : (
            contasFixas.map((conta) => (
              <div key={conta.id} className="rounded-2xl border border-border px-4 py-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{conta.descricao}</h3>
                    <p className="mt-1 text-sm text-muted">
                      {conta.categoria ?? "Sem categoria"} Â· dia {conta.diaVencimento} Â· {conta.periodicidade}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      Status: {conta.ativa ? "Ativa" : "Inativa"}
                      {conta.proximoVencimento ? ` Â· proximo vencimento ${formatDate(conta.proximoVencimento)}` : ""}
                    </p>
                    {conta.observacoes ? (
                      <p className="mt-2 text-sm text-muted">{conta.observacoes}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-col items-start gap-3 lg:items-end">
                    <strong className="text-xl">{formatCurrency(Number(conta.valorPrevisto))}</strong>
                    <div className="flex gap-2">
                      <Link className="rounded-full border border-border px-3 py-2 text-sm font-medium transition hover:bg-surface-strong" href={`/dashboard/contas-fixas?edit=${conta.id}`}>
                        Editar
                      </Link>
                      <form action={deleteContaFixa}>
                        <input type="hidden" name="id" value={conta.id} />
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

