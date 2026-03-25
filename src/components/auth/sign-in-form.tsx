"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { signInSchema, type SignInSchema } from "@/lib/validations/auth";

export function SignInForm() {
  const router = useRouter();
  const [formError, setFormError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      login: "",
      password: "",
    },
  });

  const onSubmit = async (values: SignInSchema) => {
    setFormError("");

    const result = await signIn("credentials", {
      login: values.login,
      password: values.password,
      redirect: false,
    });

    if (result?.error) {
      setFormError("Login ou senha invalidos.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <form
      className="space-y-5 rounded-[2rem] border border-white/70 bg-white/88 px-6 py-7 shadow-[0_26px_80px_rgba(15,23,42,0.14)] backdrop-blur"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-blue-700">Acesso</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Entrar no painel</h2>
        <p className="mt-2 text-sm leading-6 text-muted">Use seu login ou e-mail para acessar a area financeira.</p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground" htmlFor="login">
          Login ou e-mail
        </label>
        <input
          id="login"
          type="text"
          autoComplete="username"
          className="w-full rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
          placeholder="admin@financeiro.local"
          {...register("login")}
        />
        {errors.login ? <p className="text-sm text-red-700">{errors.login.message}</p> : null}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground" htmlFor="password">
          Senha
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className="w-full rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
          placeholder="Digite sua senha"
          {...register("password")}
        />
        {errors.password ? <p className="text-sm text-red-700">{errors.password.message}</p> : null}
      </div>

      {formError ? <p className="rounded-[1.2rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-[1.2rem] bg-[linear-gradient(135deg,_#2f6fbf,_#1d4f91)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Entrando..." : "Entrar"}
      </button>

      <Link
        className="inline-flex w-full items-center justify-center rounded-[1.2rem] border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700 transition hover:bg-orange-100"
        href="/cadastro"
      >
        Cadastrar novo usuario
      </Link>
    </form>
  );
}
