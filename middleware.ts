import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Edge middleware uses the Prisma-free config; it only checks the JWT session.
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/admin/:path*"],
};
