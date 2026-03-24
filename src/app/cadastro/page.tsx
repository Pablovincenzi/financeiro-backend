import { redirect } from "next/navigation";

import { SignUpForm } from "@/components/auth/sign-up-form";
import { getCurrentSession } from "@/lib/auth";

export default async function CadastroPage() {
  const session = await getCurrentSession();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(176,140,84,0.16),_transparent_28%)]" />
      <div className="relative grid w-full max-w-5xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[2rem] border border-border bg-[#123b39] px-8 py-10 text-white shadow-[0_24px_80px_rgba(18,59,57,0.24)]">
          <span className="inline-flex rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.24em] text-white/70">
            Novo cadastro
          </span>
          <h1 className="mt-6 max-w-md text-4xl font-semibold leading-tight">
            Crie seu acesso para entrar no Financeiro em poucos passos.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/75">
            Informe nome, e-mail e uma senha com pelo menos 6 caracteres. O sistema cria automaticamente a pessoa vinculada ao usuario.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/12 bg-white/8 p-4">
              <p className="text-sm text-white/60">Pessoa</p>
              <strong className="mt-2 block text-lg">Criada junto</strong>
            </div>
            <div className="rounded-3xl border border-white/12 bg-white/8 p-4">
              <p className="text-sm text-white/60">Acesso inicial</p>
              <strong className="mt-2 block text-lg">Perfil usuario</strong>
            </div>
            <div className="rounded-3xl border border-white/12 bg-white/8 p-4">
              <p className="text-sm text-white/60">Login</p>
              <strong className="mt-2 block text-lg">Mesmo e-mail</strong>
            </div>
          </div>
        </section>

        <section className="self-center">
          <SignUpForm />
        </section>
      </div>
    </main>
  );
}