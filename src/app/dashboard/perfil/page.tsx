import { ManagedForm } from "@/components/dashboard/managed-form";
import { requireCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { updateCurrentUserPassword } from "@/app/dashboard/user-actions";

type PageProps = {
  searchParams?: Promise<{ senha?: string }>;
};

const roleLabel: Record<string, string> = {
  usuario: "Usuario",
  gerente: "Gerente",
  administrador: "Administrador",
};

export default async function PerfilPage({ searchParams }: PageProps) {
  const { userId, session } = await requireCurrentUser();
  const params = searchParams ? await searchParams : undefined;

  const usuario = await prisma.usuario.findUniqueOrThrow({
    where: { id: userId },
    include: { pessoa: true },
  });

  return (
    <section className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
      <article className="rounded-[1.75rem] border border-border bg-surface px-6 py-6">
        <p className="text-sm uppercase tracking-[0.2em] text-muted">Meu perfil</p>
        <h1 className="mt-2 text-2xl font-semibold">Dados da sessao atual</h1>
        <div className="mt-6 grid gap-3">
          <div className="rounded-2xl border border-border px-4 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Nome</p>
            <strong className="mt-2 block text-lg">{usuario.pessoa.nomeCompleto}</strong>
          </div>
          <div className="rounded-2xl border border-border px-4 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Login</p>
            <strong className="mt-2 block text-lg">{usuario.login}</strong>
          </div>
          <div className="rounded-2xl border border-border px-4 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">E-mail</p>
            <strong className="mt-2 block text-lg">{usuario.emailLogin}</strong>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-border px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Perfil</p>
              <strong className="mt-2 block text-lg">{roleLabel[session.user.nivelAcesso ?? "usuario"] ?? session.user.nivelAcesso}</strong>
            </div>
            <div className="rounded-2xl border border-border px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Ultimo login</p>
              <strong className="mt-2 block text-lg">{usuario.ultimoLoginEm ? formatDate(usuario.ultimoLoginEm) : "Sem registro"}</strong>
            </div>
          </div>
          <div className="rounded-2xl border border-border px-4 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">CPF</p>
            <strong className="mt-2 block text-lg">{usuario.pessoa.cpf ?? "Nao informado"}</strong>
          </div>
        </div>
      </article>

      <article className="rounded-[1.75rem] border border-border bg-surface px-6 py-6">
        <p className="text-sm uppercase tracking-[0.2em] text-muted">Seguranca</p>
        <h2 className="mt-2 text-2xl font-semibold">Redefinir senha</h2>
        <p className="mt-2 text-sm text-muted">Voce pode trocar a senha diretamente por aqui. Nao vamos pedir a senha antiga neste fluxo.</p>
        {params?.senha === "ok" ? (
          <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Senha atualizada com sucesso.
          </p>
        ) : null}
        <ManagedForm
          action={updateCurrentUserPassword}
          className="mt-6 space-y-4"
          redirectTo="/dashboard/perfil?senha=ok"
          submitLabel="Salvar nova senha"
          pendingLabel="Atualizando senha..."
        >
          <div>
            <label className="mb-2 block text-sm font-medium">Nova senha</label>
            <input name="password" type="password" minLength={6} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" required />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Confirmar nova senha</label>
            <input name="confirmPassword" type="password" minLength={6} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" required />
          </div>
        </ManagedForm>
      </article>
    </section>
  );
}
