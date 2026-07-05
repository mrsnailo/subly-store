import "dotenv/config";
import { vi, describe, it, expect, beforeEach, afterAll, beforeAll } from "vitest";
import { authorizeCredentials } from "../lib/auth-limit";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

let mockIp = "127.0.0.1";

vi.mock("next/headers", () => ({
  headers: vi.fn().mockImplementation(async () => {
    return {
      get: (name: string) => {
        if (name === "x-forwarded-for") return mockIp;
        return null;
      }
    };
  }),
}));

describe("Brute force protection & Rate Limiting", () => {
  const testEmail = "test-admin-rate-limit@example.com";
  const testPassword = "secure-password-123";

  beforeAll(async () => {
    // Ensure test user exists
    const passwordHash = await bcrypt.hash(testPassword, 10);
    await prisma.adminUser.upsert({
      where: { email: testEmail },
      update: { passwordHash },
      create: {
        email: testEmail,
        passwordHash,
        name: "Test Admin",
      },
    });
  });

  afterAll(async () => {
    // Cleanup test user and login attempts
    await prisma.loginAttempt.deleteMany({
      where: { email: testEmail },
    });
    await prisma.adminUser.delete({
      where: { email: testEmail },
    });
  });

  beforeEach(async () => {
    // Clear login attempts before each test
    await prisma.loginAttempt.deleteMany({});
    mockIp = "1.2.3.4";
  });

  it("should successfully authorize with correct credentials and record successful attempt", async () => {
    const result = await authorizeCredentials({
      email: testEmail,
      password: testPassword,
    });

    expect(result).not.toBeNull();
    expect(result?.email).toBe(testEmail);

    // Verify a successful attempt is recorded
    const attempts = await prisma.loginAttempt.findMany({
      where: { email: testEmail },
    });
    expect(attempts).toHaveLength(1);
    expect(attempts[0].success).toBe(true);
    expect(attempts[0].ip).toBe(mockIp);
  });

  it("should fail to authorize with incorrect credentials and record failed attempt", async () => {
    const result = await authorizeCredentials({
      email: testEmail,
      password: "wrong-password",
    });

    expect(result).toBeNull();

    // Verify a failed attempt is recorded
    const attempts = await prisma.loginAttempt.findMany({
      where: { email: testEmail },
    });
    expect(attempts).toHaveLength(1);
    expect(attempts[0].success).toBe(false);
  });

  it("should block attempts from the same IP after 5 failures", async () => {
    mockIp = "9.9.9.9";

    // Simulate 5 failed attempts from this IP
    for (let i = 0; i < 5; i++) {
      await authorizeCredentials({
        email: `other-user-${i}@example.com`,
        password: "wrong-password",
      });
    }

    // 6th attempt (even with correct credentials) should throw Error
    await expect(
      authorizeCredentials({
        email: testEmail,
        password: testPassword,
      })
    ).rejects.toThrow("Too many failed login attempts from this IP");
  });

  it("should block attempts for the same email after 5 failures", async () => {
    mockIp = "1.1.1.1";

    // Simulate 5 failed attempts for this email, each from a different IP
    for (let i = 0; i < 5; i++) {
      mockIp = `1.1.1.${i}`;
      await authorizeCredentials({
        email: testEmail,
        password: "wrong-password",
      });
    }

    // 6th attempt from a new IP should still be blocked because of email block
    mockIp = "1.1.1.99";
    await expect(
      authorizeCredentials({
        email: testEmail,
        password: testPassword,
      })
    ).rejects.toThrow("Too many failed login attempts for this email");
  });
});
