import { redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/auth";
import { SignInForm } from "@/components/auth/sign-in-form";

export default async function LoginPage() {
  const session = await getCurrentSession();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.22),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(176,140,84,0.18),_transparent_28%)]" />
      <div className="relative grid w-full max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2rem] border border-border bg-[#1f2937] px-8 py-10 text-white shadow-[0_24px_80px_rgba(20,20,20,0.24)]">
          <span className="inline-flex rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.24em] text-white/70">
            Passo 3 do planner
          </span>
          <h1 className="mt-6 max-w-md text-4xl font-semibold leading-tight">
            Estrutura base pronta para autenticacao do Financeiro.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/75">
            Este projeto ja nasce com Next.js App Router, Prisma, PostgreSQL e autenticacao por credenciais vinculando usuario e pessoa.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/12 bg-white/6 p-4">
              <p className="text-sm text-white/60">Stack</p>
              <strong className="mt-2 block text-lg">Next.js + Prisma</strong>
            </div>
            <div className="rounded-3xl border border-white/12 bg-white/6 p-4">
              <p className="text-sm text-white/60">Banco</p>
              <strong className="mt-2 block text-lg">PostgreSQL</strong>
            </div>
            <div className="rounded-3xl border border-white/12 bg-white/6 p-4">
              <p className="text-sm text-white/60">Acesso</p>
              <strong className="mt-2 block text-lg">usuario, gerente, admin</strong>
            </div>
          </div>
        </section>

        <section className="self-center">
          <SignInForm />
        </section>
      </div>
    </main>
  );
}


