import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { signInSchema } from "@/lib/validations/auth";

void env;

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8,
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credenciais",
      credentials: {
        login: { label: "Login", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const parsedCredentials = signInSchema.safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const { login, password } = parsedCredentials.data;

        const user = await prisma.usuario.findFirst({
          where: {
            ativo: true,
            pessoa: {
              ativo: true,
            },
            OR: [{ login }, { emailLogin: login }],
          },
          include: {
            pessoa: true,
          },
        });

        if (!user || !user.senhaHash) {
          return null;
        }

        const passwordMatches = await compare(password, user.senhaHash);

        if (!passwordMatches) {
          return null;
        }

        await prisma.usuario.update({
          where: {
            id: user.id,
          },
          data: {
            ultimoLoginEm: new Date(),
          },
        });

        return {
          id: String(user.id),
          name: user.pessoa.nomeCompleto,
          email: user.emailLogin,
          nivelAcesso: user.nivelAcesso,
          pessoaId: user.pessoaId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.nivelAcesso = user.nivelAcesso;
        token.pessoaId = user.pessoaId;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.nivelAcesso = typeof token.nivelAcesso === "string" ? token.nivelAcesso : undefined;
        session.user.pessoaId = typeof token.pessoaId === "number" ? token.pessoaId : undefined;
      }

      return session;
    },
  },
};

export function getCurrentSession() {
  return getServerSession(authOptions);
}

export async function requireCurrentUser() {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    throw new Error("Usuario nao autenticado.");
  }

  return {
    session,
    userId: Number(session.user.id),
  };
}
