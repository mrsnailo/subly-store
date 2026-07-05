/**
 * Environment variable validation.
 * Fails fast with a clear error message if required environment variables are missing.
 */

const REQUIRED_ENV_VARS = [
  "DATABASE_URL",
  "AUTH_SECRET",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
] as const;

export function validateEnv() {
  // Skip validation during the Next.js production build phase to allow building/packaging
  // without production secrets in CI/CD environments.
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return;
  }

  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    const errorMsg = `
========================================================================
❌ MISSING REQUIRED ENVIRONMENT VARIABLES:
${missing.map((key) => `   - ${key}`).join("\n")}

The application cannot start or run without these variables.
Please set them in your environment or in a .env file.
========================================================================
`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
}

// Execute validation immediately when the module is imported
validateEnv();
