# Subly — Premium Digital Subscriptions Store

A Next.js storefront + admin CMS for selling digital subscriptions (Bangladesh
market), built from the `prototype/Subly Store.html` hi-fi design. The shop
owner manages categories, products and price tiers from an admin panel; the
public storefront renders entirely from the database.

## Stack

- **Next.js 16** (App Router, React 19, Turbopack)
- **PostgreSQL + Prisma 7** (driver adapter `@prisma/adapter-pg`)
- **NextAuth v5** (credentials login, JWT sessions) — admin gated by middleware
- **Tailwind v4** + the ported Subly design system in `app/globals.css`

## Architecture

```
app/
  page.tsx                     Public storefront (force-dynamic, reads DB)
  admin/login/                 Owner sign-in
  admin/(panel)/               Auth-gated admin shell (route group)
    page.tsx                   Dashboard (stats)
    categories/                List · add · edit · reorder · hide · delete
    products/                  List (grouped by category) · new · edit
  api/auth/[...nextauth]/      NextAuth route handler
components/
  cart/CartProvider.tsx        Client cart context (nav ↔ grid ↔ drawer)
  storefront/                  Nav, Shop grid, CartDrawer, Faq, Toast
  admin/                       Sidebar, ProductForm, ConfirmButton
lib/
  prisma.ts                    Prisma singleton (pg adapter)
  queries.ts                   getStorefront() — active categories + products
  actions.ts                   Server actions: category/product CRUD + reorder
  auth-actions.ts              signIn / signOut server actions
prisma/
  schema.prisma                AdminUser, Category, Product, Duration
  seed.ts                      Admin user + prototype catalogue
auth.ts / auth.config.ts       NextAuth (full / edge-safe split)
middleware.ts                  Protects /admin/*
```

**Data model:** `Category 1─* Product 1─* Duration`. Categories and products
each carry `sortOrder` (owner reorders with ↑/↓) and `isActive` (hide from store
without deleting). Durations are the BDT price tiers (`price` + optional
strike-through `wasPrice`). Deleting a category cascades to its products.

## Getting started

### 1. Database

A Postgres instance is expected at the `DATABASE_URL` in `.env`. For local dev
this project uses a Docker container on host port **5434**:

```bash
docker run -d --name subly-pg \
  -e POSTGRES_USER=subly -e POSTGRES_PASSWORD=subly -e POSTGRES_DB=subly \
  -p 5434:5432 postgres:16-alpine
```

### 2. Install, migrate, seed

```bash
npm install
npm run db:migrate     # apply Prisma migrations
npm run db:seed        # admin user + prototype catalogue
```

### 3. Run

```bash
npm run dev            # http://localhost:3000
```

- Storefront: <http://localhost:3000>
- Admin panel: <http://localhost:3000/admin>

### Admin credentials (from `.env`, change for production)

| Email              | Password          |
| ------------------ | ----------------- |
| `owner@subly.shop` | `subly-admin-123` |

## Scripts

| Script               | Purpose                                   |
| -------------------- | ----------------------------------------- |
| `npm run dev`        | Dev server                                |
| `npm run build`      | Production build                          |
| `npm run db:migrate` | `prisma migrate dev`                      |
| `npm run db:seed`    | Seed admin + catalogue (resets catalogue) |
| `npm run db:studio`  | Prisma Studio                             |

## How to deploy to Vercel

This repository is optimized for deployment to Vercel. Since we are using Next.js with Prisma and a PostgreSQL database adapter (`@prisma/adapter-pg`), it is designed to run efficiently in serverless environments.

### 1. Prisma Client Generation
Prisma Client is generated dynamically during the deployment build. 
- The `build` script in `package.json` is configured as `prisma generate && next build` which ensures that the Prisma Client is always up to date and generated into the `lib/generated/prisma` output directory before Next.js builds.
- A `postinstall` script runs `prisma generate` after dependency installation to ensure the generated client is available immediately in local development.

### 2. Environment Variables

Configure the following environment variables in your Vercel Project Settings under **Settings > Environment Variables**:

| Variable | Scope | Description / Value |
| --- | --- | --- |
| `DATABASE_URL` | Production & Preview | The connection string for your PostgreSQL database (e.g. Neon, Supabase, AWS RDS). |
| `AUTH_SECRET` | Production & Preview | A secure random string used by NextAuth to sign and encrypt cookies. Generate with `openssl rand -base64 33`. |
| `ADMIN_EMAIL` | Optional | Custom email for the admin owner account (used during database seeding). Defaults to `owner@subly.shop`. |
| `ADMIN_PASSWORD` | Optional | Custom password for the admin owner account. Defaults to `subly-admin-123`. |

> [!IMPORTANT]
> **Database Connection Pooling in Serverless Environments:**
> Since Vercel uses serverless functions, direct connections to PostgreSQL can easily exhaust the database connection limit. It is **highly recommended** to use a connection pooler or database proxy. 
> For example:
> - **Neon:** Use the Neon connection pooling URL (usually ends with `-pooler` and port `5432`) with `?sslmode=require` appended.
> - **Supabase:** Use the connection string with port `6543` (transaction mode pooler).

### 3. Database Migrations and Seeding

Vercel builds do not run migrations or database seeding automatically. To prepare your database:

1. **Run Migrations:** Apply the database migrations to your remote database by running:
   ```bash
   DATABASE_URL="your-production-db-url" npm run db:migrate
   ```
   *Note: For production, you should use `npx prisma migrate deploy` instead of `migrate dev` to apply pending migrations without resetting the schema.*

2. **Seed the Database:** Create the default admin account and populate the subscription catalogue:
   ```bash
   DATABASE_URL="your-production-db-url" npm run db:seed
   ```

## Notes / next steps

- Cart and checkout are client-side; "Checkout with bKash" and WhatsApp ordering
  are stubs. Adding an `Order` model + checkout flow is the natural next phase.
- Brand wordmarks are honest text placeholders (per the prototype) — swap in
  licensed brand SVGs for production.
- Rotate `AUTH_SECRET` and the admin password before deploying.
