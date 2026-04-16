import { ManagedForm } from "@/components/dashboard/managed-form";
import { requireAdminUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { adminDeactivateUser, adminUpdateUserPassword } from "@/app/dashboard/user-actions";

type PageProps = {
  searchParams?: Promise<{ edit?: string; senha?: string; excluido?: string }>;
};

const roleLabel: Record<string, string> = {
  usuario: "Usuario",
  gerente: "Gerente",
  administrador: "Administrador",
};

export default async function GerenciarUsuariosPage({ searchParams }: PageProps) {
  const { userId: adminUserId } = await requireAdminUser();
  const params = searchParams ? await searchParams : undefined;

  const usuarios = await prisma.usuario.findMany({
    where: {
      pessoa: {
        ativo: true,
      },
    },
    include: { pessoa: true },
    orderBy: [{ ativo: "desc" }, { pessoa: { nomeCompleto: "asc" } }],
  });

  const usuarioEmEdicao = params?.edit ? usuarios.find((item) => item.id === Number(params.edit)) : null;

  return (
    <section className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
      <article className="rounded-[1.75rem] border border-border bg-surface px-6 py-6">
        <p className="text-sm uppercase tracking-[0.2em] text-muted">Administracao</p>
        <h1 className="mt-2 text-2xl font-semibold">Gerenciar usuarios</h1>
        <p className="mt-2 text-sm text-muted">Desative acessos e redefina senhas sem sair do painel.</p>

        {params?.senha === "ok" ? (
          <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Senha redefinida com sucesso.
          </p>
        ) : null}
        {params?.excluido === "1" ? (
          <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Usuario desativado com sucesso.
          </p>
        ) : null}

        <div className="mt-6 space-y-3">
          {usuarios.map((usuario) => (
            <div key={usuario.id} className="rounded-2xl border border-border px-4 py-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{usuario.pessoa.nomeCompleto}</h2>
                  <p className="mt-1 text-sm text-muted">
                    {usuario.emailLogin} | {usuario.login} | {roleLabel[usuario.nivelAcesso] ?? usuario.nivelAcesso}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    Status: {usuario.ativo ? "Ativo" : "Inativo"}
                    {usuario.ultimoLoginEm ? ` | Ultimo login ${formatDate(usuario.ultimoLoginEm)}` : " | Sem login registrado"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 lg:min-w-[220px] lg:justify-end">
                  <a className="rounded-full border border-border px-3 py-2 text-sm font-medium transition hover:bg-surface-strong" href={`/dashboard/gerenciar-usuarios?edit=${usuario.id}`}>
                    Alterar senha
                  </a>
                  {usuario.id !== adminUserId && usuario.ativo ? (
                    <form action={adminDeactivateUser}>
                      <input type="hidden" name="userId" value={usuario.id} />
                      <button className="rounded-full border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50">
                        Excluir usuario
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className="rounded-[1.75rem] border border-border bg-surface px-6 py-6">
        <p className="text-sm uppercase tracking-[0.2em] text-muted">Senha</p>
        <h2 className="mt-2 text-2xl font-semibold">{usuarioEmEdicao ? `Alterar senha de ${usuarioEmEdicao.pessoa.nomeCompleto}` : "Selecione um usuario"}</h2>
        <p className="mt-2 text-sm text-muted">A redefinicao e direta e nao exige a senha antiga do usuario selecionado.</p>

        {usuarioEmEdicao ? (
          <ManagedForm
            action={adminUpdateUserPassword}
            className="mt-6 space-y-4"
            redirectTo={`/dashboard/gerenciar-usuarios?edit=${usuarioEmEdicao.id}&senha=ok`}
            submitLabel="Salvar nova senha"
            pendingLabel="Atualizando senha..."
          >
            <input type="hidden" name="userId" value={usuarioEmEdicao.id} />
            <div>
              <label className="mb-2 block text-sm font-medium">Nova senha</label>
              <input name="password" type="password" minLength={6} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Confirmar nova senha</label>
              <input name="confirmPassword" type="password" minLength={6} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" required />
            </div>
          </ManagedForm>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-muted">
            Escolha um usuario na lista ao lado para redefinir a senha dele.
          </div>
        )}
      </article>
    </section>
  );
}

