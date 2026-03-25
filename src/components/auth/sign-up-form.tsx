"use client";

import Link from "next/link";
import { useActionState } from "react";

import { registerUser, type SignUpFormState } from "@/app/cadastro/actions";

const initialSignUpState: SignUpFormState = {
  success: false,
};

export function SignUpForm() {
  const [state, formAction, isPending] = useActionState(registerUser, initialSignUpState);

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-[2rem] border border-white/70 bg-white/88 px-6 py-7 shadow-[0_26px_80px_rgba(15,23,42,0.14)] backdrop-blur"
    >
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-blue-700">Cadastro</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Criar novo acesso</h2>
        <p className="mt-2 text-sm leading-6 text-muted">Preencha os dados principais para liberar a entrada no sistema.</p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground" htmlFor="cpf">
          CPF
        </label>
        <input
          id="cpf"
          name="cpf"
          type="text"
          autoComplete="off"
          inputMode="numeric"
          maxLength={14}
          required
          className="w-full rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
          placeholder="000.000.000-00"
        />
        {state.fieldErrors?.cpf ? <p className="text-sm text-red-700">{state.fieldErrors.cpf[0]}</p> : null}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground" htmlFor="name">
          Nome
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          minLength={3}
          required
          className="w-full rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
          placeholder="Seu nome completo"
        />
        {state.fieldErrors?.name ? <p className="text-sm text-red-700">{state.fieldErrors.name[0]}</p> : null}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground" htmlFor="email">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
          placeholder="voce@empresa.com"
        />
        {state.fieldErrors?.email ? <p className="text-sm text-red-700">{state.fieldErrors.email[0]}</p> : null}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground" htmlFor="password">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
          className="w-full rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
          placeholder="Minimo de 6 caracteres"
        />
        {state.fieldErrors?.password ? <p className="text-sm text-red-700">{state.fieldErrors.password[0]}</p> : null}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground" htmlFor="confirmPassword">
          Confirmacao de senha
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
          className="w-full rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
          placeholder="Repita a senha"
        />
        {state.fieldErrors?.confirmPassword ? (
          <p className="text-sm text-red-700">{state.fieldErrors.confirmPassword[0]}</p>
        ) : null}
      </div>

      {state.message ? <p className="rounded-[1.2rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{state.message}</p> : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-[1.2rem] bg-[linear-gradient(135deg,_#f27d24,_#d45f08)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Cadastrando..." : "Criar conta"}
      </button>

      <p className="rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-muted">
        O novo usuario ja sera criado com perfil <strong className="text-slate-900">usuario</strong> e podera acessar o sistema com o proprio e-mail.
      </p>

      <Link className="inline-flex text-sm font-medium text-blue-700 transition hover:text-blue-800" href="/login">
        Voltar para o login
      </Link>
    </form>
  );
}
