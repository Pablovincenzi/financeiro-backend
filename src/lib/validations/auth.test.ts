import { describe, expect, it } from "vitest";

import { signUpSchema } from "@/lib/validations/auth";

describe("signUpSchema", () => {
  it("aceita um cadastro valido", () => {
    const parsed = signUpSchema.safeParse({
      cpf: "529.982.247-25",
      name: "Maria Financeira",
      email: "MARIA@EXEMPLO.COM",
      password: "123456",
      confirmPassword: "123456",
    });

    expect(parsed.success).toBe(true);

    if (parsed.success) {
      expect(parsed.data.cpf).toBe("52998224725");
      expect(parsed.data.email).toBe("maria@exemplo.com");
    }
  });

  it("rejeita cpf invalido", () => {
    const parsed = signUpSchema.safeParse({
      cpf: "111.111.111-11",
      name: "Maria Financeira",
      email: "maria@exemplo.com",
      password: "123456",
      confirmPassword: "123456",
    });

    expect(parsed.success).toBe(false);
  });

  it("rejeita senha curta", () => {
    const parsed = signUpSchema.safeParse({
      cpf: "52998224725",
      name: "Maria Financeira",
      email: "maria@exemplo.com",
      password: "12345",
      confirmPassword: "12345",
    });

    expect(parsed.success).toBe(false);
  });

  it("rejeita confirmacao diferente", () => {
    const parsed = signUpSchema.safeParse({
      cpf: "52998224725",
      name: "Maria Financeira",
      email: "maria@exemplo.com",
      password: "123456",
      confirmPassword: "654321",
    });

    expect(parsed.success).toBe(false);

    if (!parsed.success) {
      expect(parsed.error.flatten().fieldErrors.confirmPassword).toContain("As senhas nao conferem.");
    }
  });
});