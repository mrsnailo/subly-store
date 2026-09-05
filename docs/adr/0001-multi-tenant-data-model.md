# 1. Multi-Tenant Data Model

Date: 2026-09-05

## Status
Accepted

## Context
Subly Store needs to support self-serve multi-tenancy where multiple store owners can run their own independent storefronts. We need to decide how to structure the database to support this. The primary considerations are operational complexity, scalability, and strict tenant isolation (zero cross-tenant data leaks). 

## Decision
We chose a **shared database, shared schema** architecture over multiple database instances or database schemas. 

We introduced a `Store` model representing a tenant, and added a required `storeId` foreign key to `Category`, `Product`, `Duration`, `StoreSettings`, and `AdminUser`.
A `storeId_slug` compound unique index replaces the global `slug` unique constraint on `Category` and `Product`.

To enforce tenant isolation:
1. Every server action and query now requires a `storeId` argument.
2. We banned the use of `findFirst` without bounds; every data operation is explicitly filtered using `where: { storeId }`.
3. Tenant association is embedded securely into the NextAuth `jwt` and `session` upon login, ensuring that the `storeId` is checked directly from trusted session data across the admin boundary rather than client inputs.

## Consequences
- **Advantages:** 
  - Significant reduction in operational complexity to start. We don't have to manage provisioning distinct PostgreSQL instances per signup or running dynamic DDL for schemas.
  - Simplifies migrations as a schema change is seamlessly applied across all tenants.
- **Disadvantages:**
  - Strict developer discipline is required to guarantee that no query drops the `storeId` predicate. A leaked query could cross tenant boundaries.
  - Risk of "Noisy Neighbor" syndrome later down the line if one tenant performs high-volume queries, though this can be mitigated with caching (using Next.js `unstable_cache` keyed by `storeId`).
