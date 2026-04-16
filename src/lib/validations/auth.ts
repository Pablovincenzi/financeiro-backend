import { z } from "zod";

function normalizeCpf(value: string) {
  return value.replace(/\D/g, "");
}

function isValidCpf(value: string) {
  const cpf = normalizeCpf(value);

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  let sum = 0;

  for (let index = 0; index < 9; index += 1) {
    sum += Number(cpf[index]) * (10 - index);
  }

  let digit = (sum * 10) % 11;

  if (digit === 10) {
    digit = 0;
  }

  if (digit !== Number(cpf[9])) {
    return false;
  }

  sum = 0;

  for (let index = 0; index < 10; index += 1) {
    sum += Number(cpf[index]) * (11 - index);
  }

  digit = (sum * 10) % 11;

  if (digit === 10) {
    digit = 0;
  }

  return digit === Number(cpf[10]);
}

export const signInSchema = z.object({
  login: z.string().trim().min(3, "Informe um login ou email valido."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
});

export const signUpSchema = z
  .object({
    cpf: z
      .string()
      .trim()
      .min(1, "Informe o CPF.")
      .transform(normalizeCpf)
      .refine(isValidCpf, "Informe um CPF valido."),
    name: z.string().trim().min(3, "Informe o nome completo."),
    email: z.email("Informe um email valido.").transform((value) => value.trim().toLowerCase()),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
    confirmPassword: z.string().min(6, "Confirme a senha com pelo menos 6 caracteres."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas nao conferem.",
    path: ["confirmPassword"],
  });

export const passwordResetSchema = z
  .object({
    userId: z.coerce.number().int().positive().optional(),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
    confirmPassword: z.string().min(6, "Confirme a senha com pelo menos 6 caracteres."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas nao conferem.",
    path: ["confirmPassword"],
  });

export type SignInSchema = z.infer<typeof signInSchema>;
export type SignUpSchema = z.infer<typeof signUpSchema>;
export type PasswordResetSchema = z.infer<typeof passwordResetSchema>;
