import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { authorizeCredentials } from "@/lib/auth-limit";

export class ThrottledError extends CredentialsSignin {
  code = "throttled";
  constructor(message = "Too many failed login attempts. Please try again later.") {
    super(message);
    this.message = message;
  }
}

export const credentialsProvider = Credentials({
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },
  async authorize(raw) {
    try {
      return await authorizeCredentials(raw);
    } catch (error: any) {
      if (error instanceof Error && error.message.includes("Too many failed login attempts")) {
        throw new ThrottledError(error.message);
      }
      throw error;
    }
  },
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [credentialsProvider],
});
