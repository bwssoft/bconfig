import { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      email: string;
      created_at: Date;
      id: string;
      type: "external" | "client" | "employee";
    }
  }

  interface User {
    email: string;
    created_at: Date;
    id: string;
    type: "external" | "client" | "employee";
  }
}