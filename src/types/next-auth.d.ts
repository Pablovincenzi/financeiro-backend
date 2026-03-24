import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      nivelAcesso?: string;
      pessoaId?: number;
    };
  }

  interface User {
    nivelAcesso?: string;
    pessoaId?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    nivelAcesso?: string;
    pessoaId?: number;
  }
}

