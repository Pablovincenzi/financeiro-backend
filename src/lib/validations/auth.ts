import { z } from "zod";

export const signInSchema = z.object({
  login: z.string().min(3, "Informe um login ou email valido."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
});

export type SignInSchema = z.infer<typeof signInSchema>;

