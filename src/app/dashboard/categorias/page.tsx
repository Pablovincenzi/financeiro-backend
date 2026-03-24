import Link from "next/link";

import { deleteCategoriaDespesa, saveCategoriaDespesa } from "@/app/dashboard/finance-actions";
import { requireCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";

type PageProps = {
  searchParams?: Promise<{
    edit?: string;
  }>;
};

export default async function CategoriasPage({ searchParams }: PageProps) {
  await requireCurrentUser();
  const params = searchParams ? await searchParams : undefined;

  const [usuarios, categorias] = await Promise.all([
    prisma.usuario.findMany({
      where: {
        ativo: true,
        pessoa: { ativo: true },
      },
      orderBy: { pessoa: { nomeCompleto: "asc" } },
      include: { pessoa: true },
    }),
    prisma.categoriaDespesa.findMany({
      orderBy: { nome: "asc" },
      include: {
        usuarios: {
          include: {
            usuario: {
              include: {
                pessoa: true,
              },
            },
          },
        },
        _count: {
          select: {
            despesas: true,
          },
        },
      },
    }),
  ]);

  const categoriaEmEdicao = params?.edit
    ? categorias.find((item) => item.id === Number(params.edit))
    : null;

  const usuariosSelecionados = categoriaEmEdicao?.usuarios.map((item) => String(item.usuarioId)) ?? [];

  return (
    <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
      <article className="rounded-[1.75rem] border border-border bg-surface px-6 py-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted">Categorias</p>
            <h2 className="mt-2 text-2xl font-semibold">
              {categoriaEmEdicao ? "Editar categoria" : "Nova categoria de despesa"}
            </h2>
          </div>
          {categoriaEmEdicao ? (
            <Link className="text-sm font-medium text-accent" href="/dashboard/categorias">
              Cancelar edicao
            </Link>
          ) : null}
        </div>

        <form action={saveCategoriaDespesa} className="mt-6 space-y-4">
          <input type="hidden" name="id" value={categoriaEmEdicao?.id ?? ""} />

          <div>
            <label className="mb-2 block text-sm font-medium">Nome</label>
            <input
              name="nome"
              defaultValue={categoriaEmEdicao?.nome ?? ""}
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent"
              placeholder="Apartamento"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Data inicio</label>
              <input
                type="date"
                name="dataInicio"
                defaultValue={categoriaEmEdicao ? categoriaEmEdicao.dataInicio.toISOString().slice(0, 10) : ""}
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Data fim</label>
              <input
                type="date"
                name="dataFim"
                defaultValue={categoriaEmEdicao?.dataFim ? categoriaEmEdicao.dataFim.toISOString().slice(0, 10) : ""}
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Usuarios vinculados</label>
            <select
              name="usuariosIds"
              multiple
              defaultValue={usuariosSelecionados}
              className="min-h-56 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent"
              required
            >
              {usuarios.map((usuario) => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.pessoa.nomeCompleto} - {usuario.login}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-muted">Use Ctrl ou Cmd para selecionar mais de um usuario.</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Observacoes</label>
            <textarea
              name="observacoes"
              defaultValue={categoriaEmEdicao?.observacoes ?? ""}
              className="min-h-28 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent"
            />
          </div>

          <button className="w-full rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong">
            {categoriaEmEdicao ? "Salvar alteracoes" : "Cadastrar categoria"}
          </button>
        </form>
      </article>

      <article className="rounded-[1.75rem] border border-border bg-surface px-6 py-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted">Lista</p>
            <h2 className="mt-2 text-2xl font-semibold">Categorias cadastradas</h2>
          </div>
          <span className="rounded-full bg-surface-strong px-3 py-1 text-sm text-muted">{categorias.length} itens</span>
        </div>

        <div className="mt-6 space-y-3">
          {categorias.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-muted">
              Nenhuma categoria cadastrada ainda.
            </p>
          ) : (
            categorias.map((categoria) => (
              <div key={categoria.id} className="rounded-2xl border border-border px-4 py-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{categoria.nome}</h3>
                    <p className="mt-1 text-sm text-muted">
                      Inicio em {formatDate(categoria.dataInicio)}
                      {categoria.dataFim ? ` · fim em ${formatDate(categoria.dataFim)}` : " · sem data fim"}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      Usuarios: {categoria.usuarios.map((item) => item.usuario.pessoa.nomeCompleto).join(", ")}
                    </p>
                    <p className="mt-1 text-sm text-muted">Despesas vinculadas: {categoria._count.despesas}</p>
                    {categoria.observacoes ? <p className="mt-2 text-sm text-muted">{categoria.observacoes}</p> : null}
                  </div>
                  <div className="flex gap-2">
                    <Link
                      className="rounded-full border border-border px-3 py-2 text-sm font-medium transition hover:bg-surface-strong"
                      href={`/dashboard/categorias?edit=${categoria.id}`}
                    >
                      Editar
                    </Link>
                    {categoria._count.despesas === 0 ? (
                      <form action={deleteCategoriaDespesa}>
                        <input type="hidden" name="id" value={categoria.id} />
                        <button className="rounded-full border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50">
                          Excluir
                        </button>
                      </form>
                    ) : (
                      <span className="rounded-full border border-amber-200 px-3 py-2 text-sm font-medium text-amber-700">
                        Em uso
                      </span>
                    )}
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