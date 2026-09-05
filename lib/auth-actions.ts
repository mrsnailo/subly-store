"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { headers } from "next/headers";

function getRedirectPath(basePath: string, storeSlug: string | null) {
  if (storeSlug) return `/${storeSlug}${basePath}`;
  return basePath;
}

export async function authenticate(
  _prev: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  let storeSlug = null;
  try {
    const hdrs = await headers();
    storeSlug = hdrs.get("x-store-slug");
  } catch (e) {}

  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: getRedirectPath("/admin", storeSlug),
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
  let storeSlug = null;
  try {
    const hdrs = await headers();
    storeSlug = hdrs.get("x-store-slug");
  } catch (e) {}

  await signOut({ redirectTo: getRedirectPath("/admin/login", storeSlug) });
}
