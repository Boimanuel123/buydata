import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      status?: string;
      slug?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    status?: string;
    slug?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    agentId?: string;
    status?: string;
    slug?: string;
  }
}
