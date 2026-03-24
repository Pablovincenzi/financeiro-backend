import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL nao configurada."),
  AUTH_SECRET: z.string().min(12, "AUTH_SECRET deve ter pelo menos 12 caracteres."),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
});
