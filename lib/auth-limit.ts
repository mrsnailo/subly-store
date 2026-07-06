import bcrypt from "bcryptjs";
import { z } from "zod";
import { headers } from "next/headers";
import { prisma } from "./prisma";

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_FAILED_ATTEMPTS = 5;

const credsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function authorizeCredentials(raw: unknown) {
  const parsed = credsSchema.safeParse(raw);
  if (!parsed.success) return null;

  const { email, password } = parsed.data;

  let ip = "127.0.0.1";
  try {
    const headersList = await headers();
    ip = headersList.get("x-forwarded-for")?.split(",")[0].trim() || 
         headersList.get("x-real-ip") || 
         "127.0.0.1";
  } catch (e) {
    // headers() may throw if called during build/static optimization
  }

  const now = new Date();
  const windowStart = new Date(now.getTime() - WINDOW_MS);

  // Check if IP is blocked
  const failedAttemptsByIp = await prisma.loginAttempt.count({
    where: {
      ip,
      success: false,
      createdAt: { gte: windowStart },
    },
  });

  if (failedAttemptsByIp >= MAX_FAILED_ATTEMPTS) {
    throw new Error("Too many failed login attempts from this IP. Please try again in 15 minutes.");
  }

  // Check if email is blocked
  const failedAttemptsByEmail = await prisma.loginAttempt.count({
    where: {
      email,
      success: false,
      createdAt: { gte: windowStart },
    },
  });

  if (failedAttemptsByEmail >= MAX_FAILED_ATTEMPTS) {
    throw new Error("Too many failed login attempts for this email. Please try again in 15 minutes.");
  }

  // Prune old attempt logs to keep database size stable
  try {
    await prisma.loginAttempt.deleteMany({
      where: {
        createdAt: { lt: windowStart },
      },
    });
  } catch (e) {
    console.error("Failed to prune login attempts:", e);
  }

  const dummyHash = "$2a$10$vI8aWBnW3fID.1Spke.rKe.uxb52.t2.C.0GfUXT8x4K5JmK8s6/y"; // Valid bcrypt hash
  const user = await prisma.adminUser.findUnique({ where: { email } });

  const ok = await bcrypt.compare(password, user?.passwordHash || dummyHash);
  if (!user || !ok) {
    await prisma.loginAttempt.create({
      data: { ip, email, success: false },
    });
    return null;
  }

  // Log successful attempt
  await prisma.loginAttempt.create({
    data: { ip, email, success: true },
  });

  return { id: user.id, email: user.email, name: user.name ?? "Owner" };
}
