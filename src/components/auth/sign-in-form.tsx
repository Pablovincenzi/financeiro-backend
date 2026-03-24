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
      className="space-y-5 rounded-[2rem] border border-border bg-surface px-6 py-7 shadow-[0_18px_60px_rgba(80,64,40,0.12)]"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground" htmlFor="login">
          Login ou e-mail
        </label>
        <input
          id="login"
          type="text"
          autoComplete="username"
          className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-accent"
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
          className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-accent"
          placeholder="Digite sua senha"
          {...register("password")}
        />
        {errors.password ? <p className="text-sm text-red-700">{errors.password.message}</p> : null}
      </div>

      {formError ? <p className="text-sm text-red-700">{formError}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Entrando..." : "Entrar"}
      </button>

      <Link
        className="inline-flex w-full items-center justify-center rounded-2xl border border-border px-4 py-3 text-sm font-semibold text-foreground transition hover:border-accent hover:text-accent"
        href="/cadastro"
      >
        Cadastrar
      </Link>

      <p className="text-sm leading-6 text-muted">
        Entre com seu email e senha para acessar o painel financeiro.
      </p>
    </form>
  );
}