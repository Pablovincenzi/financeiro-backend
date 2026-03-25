import { redirect } from "next/navigation";

import { SignInForm } from "@/components/auth/sign-in-form";
import { getCurrentSession } from "@/lib/auth";

type LoginPageProps = {
  searchParams?: Promise<{
    cadastrado?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getCurrentSession();

  if (session?.user) {
    redirect("/dashboard");
  }

  const params = searchParams ? await searchParams : undefined;
  const showSuccessMessage = params?.cadastrado === "1";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(47,111,191,0.22),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(242,125,36,0.14),_transparent_26%),linear-gradient(180deg,_#0f172a_0%,_#162338_52%,_#edf3fb_160%)]" />
      <div className="relative grid w-full max-w-6xl gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="overflow-hidden rounded-[2.25rem] border border-white/12 bg-[linear-gradient(145deg,_rgba(15,23,42,0.95),_rgba(24,42,72,0.92)_56%,_rgba(47,111,191,0.88)_100%)] px-8 py-10 text-white shadow-[0_32px_100px_rgba(15,23,42,0.32)]">
          <span className="inline-flex rounded-full border border-white/18 bg-white/6 px-3 py-1 text-xs uppercase tracking-[0.24em] text-white/70">
            Financeiro Workspace
          </span>
          <h1 className="mt-6 max-w-lg text-5xl font-semibold leading-[1.02] tracking-tight">
            Controle o financeiro com uma interface mais clara, modular e orientada a decisao.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200/78">
            Acesse receitas, despesas, categorias, relatorios e operacoes recorrentes em uma superficie pensada para leitura rapida e navegacao constante.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.8rem] border border-white/12 bg-white/7 p-5 backdrop-blur-sm">
              <p className="text-sm text-white/55">Navegacao</p>
              <strong className="mt-2 block text-lg">Barra lateral persistente</strong>
            </div>
            <div className="rounded-[1.8rem] border border-white/12 bg-white/7 p-5 backdrop-blur-sm">
              <p className="text-sm text-white/55">Leitura</p>
              <strong className="mt-2 block text-lg">Azul, cinza e laranja</strong>
            </div>
            <div className="rounded-[1.8rem] border border-white/12 bg-white/7 p-5 backdrop-blur-sm">
              <p className="text-sm text-white/55">Acesso</p>
              <strong className="mt-2 block text-lg">Perfis por usuario</strong>
            </div>
          </div>
        </section>

        <section className="self-center space-y-4">
          {showSuccessMessage ? (
            <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50/95 px-5 py-4 text-sm text-emerald-800 shadow-[0_18px_45px_rgba(16,185,129,0.08)]">
              Cadastro realizado com sucesso. Agora voce ja pode entrar com seu email e senha.
            </div>
          ) : null}
          <SignInForm />
        </section>
      </div>
    </main>
  );
}
