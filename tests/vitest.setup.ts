import "dotenv/config";
process.env.VITEST = "true";

// Fail fast with an actionable message instead of a cryptic driver-level
// "SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string" when the
// database tests run without a connection string. On a fresh clone use the
// hermetic runner (which provisions a throwaway Postgres); CI provides this via
// the workflow's Postgres service.
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Run `npm run test:local` (or `bash scripts/test.sh`), " +
      "which starts a throwaway Postgres and applies migrations before the suite. " +
      "Do not run `npm test`/`vitest` directly on a fresh clone.",
  );
}
