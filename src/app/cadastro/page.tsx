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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(47,111,191,0.2),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(242,125,36,0.16),_transparent_26%),linear-gradient(180deg,_#0f172a_0%,_#15233a_54%,_#edf3fb_160%)]" />
      <div className="relative grid w-full max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="overflow-hidden rounded-[2.25rem] border border-white/12 bg-[linear-gradient(150deg,_rgba(15,23,42,0.95),_rgba(22,41,70,0.92)_52%,_rgba(242,125,36,0.8)_100%)] px-8 py-10 text-white shadow-[0_32px_100px_rgba(15,23,42,0.32)]">
          <span className="inline-flex rounded-full border border-white/18 bg-white/6 px-3 py-1 text-xs uppercase tracking-[0.24em] text-white/70">
            Novo cadastro
          </span>
          <h1 className="mt-6 max-w-lg text-5xl font-semibold leading-[1.02] tracking-tight">
            Crie um acesso novo e entre no Financeiro com uma base pronta para operar.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200/78">
            O cadastro cria a pessoa vinculada, configura o perfil inicial de usuario e deixa o acesso pronto para o painel principal.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.8rem] border border-white/12 bg-white/7 p-5 backdrop-blur-sm">
              <p className="text-sm text-white/55">Pessoa</p>
              <strong className="mt-2 block text-lg">Criada automaticamente</strong>
            </div>
            <div className="rounded-[1.8rem] border border-white/12 bg-white/7 p-5 backdrop-blur-sm">
              <p className="text-sm text-white/55">Perfil inicial</p>
              <strong className="mt-2 block text-lg">Usuario</strong>
            </div>
            <div className="rounded-[1.8rem] border border-white/12 bg-white/7 p-5 backdrop-blur-sm">
              <p className="text-sm text-white/55">Acesso</p>
              <strong className="mt-2 block text-lg">Login pelo e-mail</strong>
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
