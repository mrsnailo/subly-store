# Subly Production Environment Checklist

Before deploying Subly to a production environment (such as Vercel, Docker, or AWS), run through this checklist to ensure stability, security, and performance.

---

## 1. Environment & Secret Enforcement

Subly uses a **fail-fast environment validation mechanism** at startup. The following environment variables must be defined in your production environment:

- [ ] **`DATABASE_URL`**
  - **Type:** PostgreSQL connection URI
  - **Requirement:** Must be a valid production database. For serverless/Vercel environments, connection pooling is **strongly recommended** to prevent connection exhaustion.
    - *Neon:* Use the connection pooler URL (ends with `-pooler` on port `5432` with `?sslmode=require`).
    - *Supabase:* Use the transaction mode connection string (usually port `6543`).
- [ ] **`AUTH_SECRET`**
  - **Type:** Base64 or random string
  - **Requirement:** Used by NextAuth to sign and encrypt session cookies. Generate a strong key using:
    ```bash
    openssl rand -base64 33
    ```
- [ ] **`ADMIN_EMAIL`**
  - **Type:** Email address
  - **Requirement:** The login email address for the admin panel owner. Do not use local defaults (`owner@subly.shop`).
- [ ] **`ADMIN_PASSWORD`**
  - **Type:** Password string
  - **Requirement:** A strong, secure password for the admin panel owner. Do not use local defaults (`subly-admin-123`).

---

## 2. Database Deployment & Initialization

- [ ] **Prisma Client Generation**
  - Confirm `prisma generate` runs on every deploy (typically via `npm run build` or the `postinstall` hook).
- [ ] **Production Migrations**
  - Do **not** use `prisma migrate dev` in production. Instead, run schema migrations using:
    ```bash
    npx prisma migrate deploy
    ```
- [ ] **Initial Database Seeding**
  - Run the seed script to create the admin user and initial category structure:
    ```bash
    npm run db:seed
    ```
  - Verify that the seeding script runs successfully and outputs `✓ Admin user ready` with your production `ADMIN_EMAIL`.

---

## 3. Security & Domain Configuration

- [ ] **HTTPS & SSL/TLS**
  - Enforce HTTPS across all pages and admin routes.
  - NextAuth cookies will automatically adapt to secure-only cookies in a production environment (`NODE_ENV=production`).
- [ ] **NextAuth Trusted Hosts**
  - Confirm `trustHost: true` is set in `auth.config.ts` so authentication redirects function properly behind proxies (e.g. Vercel, Cloudflare).
- [ ] **Password Strength**
  - Ensure the password stored in `ADMIN_PASSWORD` is long, random, and has not been leaked.

---

## 4. Performance & Reliability

- [ ] **Next.js Caching & Dynamic Routes**
  - Verify storefront pages correctly load dynamic content from the database.
- [ ] **Postgres Connection Limits**
  - Check the maximum connection limit on your Postgres provider and scale according to serverless function concurrency limits.
- [ ] **Error Monitoring**
  - Integrate error tracking (e.g. Sentry, Logtail) to capture runtime environment validation errors or database connection drops.
