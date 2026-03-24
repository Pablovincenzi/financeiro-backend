"use server";

import { Prisma } from "@prisma/client";
import { hash } from "bcryptjs";
import { redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { signUpSchema } from "@/lib/validations/auth";

export type SignUpFormState = {
  success: boolean;
  message?: string;
  fieldErrors?: {
    cpf?: string[];
    name?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
  };
};

export async function registerUser(_: SignUpFormState, formData: FormData): Promise<SignUpFormState> {
  const session = await getCurrentSession();

  if (session?.user) {
    redirect("/dashboard");
  }

  const parsedData = signUpSchema.safeParse({
    cpf: formData.get("cpf"),
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsedData.success) {
    return {
      success: false,
      fieldErrors: parsedData.error.flatten().fieldErrors,
      message: "Revise os dados informados.",
    };
  }

  const { cpf, name, email, password } = parsedData.data;

  const [existingUser, existingCpf] = await Promise.all([
    prisma.usuario.findFirst({
      where: {
        OR: [{ emailLogin: email }, { login: email }],
      },
      select: {
        id: true,
      },
    }),
    prisma.pessoa.findUnique({
      where: {
        cpf,
      },
      select: {
        id: true,
      },
    }),
  ]);

  if (existingUser) {
    return {
      success: false,
      fieldErrors: {
        email: ["Ja existe um cadastro com este email."],
      },
      message: "Nao foi possivel concluir o cadastro.",
    };
  }

  if (existingCpf) {
    return {
      success: false,
      fieldErrors: {
        cpf: ["Usuario ja cadastrado para este CPF."],
      },
      message: "Usuario ja cadastrado.",
    };
  }

  const passwordHash = await hash(password, 12);

  try {
    await prisma.$transaction(async (tx) => {
      const pessoa = await tx.pessoa.create({
        data: {
          cpf,
          nomeCompleto: name,
          email,
        },
        select: {
          id: true,
        },
      });

      await tx.usuario.create({
        data: {
          pessoaId: pessoa.id,
          login: email,
          emailLogin: email,
          senhaHash: passwordHash,
          nivelAcesso: "usuario",
        },
      });
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        success: false,
        fieldErrors: {
          cpf: ["Usuario ja cadastrado para este CPF."],
        },
        message: "Usuario ja cadastrado.",
      };
    }

    throw error;
  }

  redirect("/login?cadastrado=1");
}