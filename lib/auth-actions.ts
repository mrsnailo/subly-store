"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";

export async function authenticate(
  _prev: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/admin",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      const errMessage = (error.cause as any)?.err?.message || error.message || "";
      const isThrottled =
        (error as any).code === "throttled" ||
        errMessage.includes("Too many") ||
        errMessage.includes("throttled") ||
        error.type?.includes("throttled");

      if (isThrottled) {
        return errMessage || "Too many failed login attempts. Please try again later.";
      }

      if (error.type === "CredentialsSignin") {
        return "Invalid email or password.";
      }
      return "Something went wrong. Please try again.";
    }
    throw error; // re-throw redirect
  }
}

export async function logout() {
  await signOut({ redirectTo: "/admin/login" });
}
