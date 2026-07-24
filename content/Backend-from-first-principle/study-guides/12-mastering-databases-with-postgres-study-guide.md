# Study guide — 12. Mastering Databases with Postgres

> This is added guidance, not a claim about the video's contents.

## Database habits to build early

- Model invariants in the database as well as in application validation.
- Use migrations for every schema change; rehearse rollback or forward-fix behavior.
- Parameterize queries and keep transactions short.
- Start with the simplest correct query; inspect real query plans before adding indexes.
- Measure read improvement against write cost and operational complexity.

## Production PostgreSQL discipline

### Schema review checklist

- What business invariant should be a database constraint?
- Which relationships require foreign keys and which deletion behavior?
- Is a nullable field actually “unknown,” “not applicable,” or “not yet set”?
- Does the type preserve money/time/identifier meaning correctly?
- Can a backfill be done safely on existing data?
- Can old and new application versions run during the migration?

### Safe migration workflow

For a production change, prefer expand → deploy compatible code → backfill → validate → contract/remove old field. Avoid an application deployment that immediately assumes a newly created column is populated for all historic rows. Large table rewrites, indexes, and constraints need an operational plan because they can lock or load a database.

Always rehearse migrations on a production-like snapshot when the data size or lock behavior is uncertain. Keep backup/restore and rollback/forward-fix decisions in the deployment plan.

### Transactions and isolation

Use a transaction when multiple writes must represent one business event. Keep it short: do not hold database locks while calling an external email/payment service. Use an outbox or queued follow-up work when a transaction must eventually trigger an external side effect.

Understand the isolation behavior your operation needs. A correct-looking read-then-write can fail under concurrency if two transactions make the same decision from stale reads. Use constraints, locking, or an atomic update where the invariant demands it.

### Query/index workflow

1. Capture the actual slow query and parameters.
2. Inspect the query plan.
3. Reduce returned columns/rows and remove accidental N+1 patterns.
4. Add or adjust an index that matches filtering/join/order.
5. Re-run the same workload and observe read speed, write cost, and index size.

Do not make an ORM a reason to stop learning SQL. An ORM can generate useful queries, but the database executes SQL and query plans.

### Operations and observability

Monitor connection-pool saturation, slow queries, lock waits/deadlocks, replication/backup state, disk growth, index growth, query latency, and error rates. Set connection limits intentionally; multiplying every application instance’s pool size can overwhelm the database.

### Production test matrix

- migration from an old schema with real-looking data;
- constraint and foreign-key violations;
- concurrent updates to the same logical resource;
- transaction rollback on mid-operation failure;
- pagination with inserts/deletes between pages;
- query-plan regression for critical endpoints;
- backup restore verification, not only backup creation.

## Learn by building: replace the in-memory product store

Install a PostgreSQL client for the practice lab:

~~~bash
npm install pg
npm install --save-dev @types/pg
~~~

Create a migration file such as migrations/001_products.sql:

~~~sql
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_in_paise INTEGER NOT NULL CHECK (price_in_paise > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX products_created_at_id_idx
  ON products (created_at DESC, id DESC);
~~~

Then create src/repositories/postgres-product-repository.ts:

~~~ts
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function findProductById(id: string) {
  const result = await pool.query(
    "SELECT id, name, price_in_paise FROM products WHERE id = $1",
    [id],
  );

  return result.rows[0] ?? null;
}
~~~

The $1 placeholder is essential. It keeps the query structure separate from the user-controlled value. The CHECK constraint protects the price rule even if a future script or another service bypasses the HTTP validator.

### Migration exercise

Insert one row, read it through the HTTP product route, then try inserting a negative price directly in SQL. PostgreSQL should reject it. That proves the business invariant exists in two complementary layers: helpful API validation and authoritative database protection.

## Read next

- [PostgreSQL documentation](https://www.postgresql.org/docs/)
- [PostgreSQL `EXPLAIN`](https://www.postgresql.org/docs/current/using-explain.html)
- [PostgreSQL transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html)
- [SQL style guide](https://www.sqlstyle.guide/)

## Public repositories worth studying

- [postgres/postgres](https://github.com/postgres/postgres)
- [pgvector/pgvector](https://github.com/pgvector/pgvector) — a well-known PostgreSQL extension.
- [supabase/postgres](https://github.com/supabase/postgres) — PostgreSQL packaging and extensions.
- [neondatabase/neon](https://github.com/neondatabase/neon) — serverless PostgreSQL architecture.
- [jackc/pgx](https://github.com/jackc/pgx) — PostgreSQL driver/toolkit for Go.
- [sqlc-dev/sqlc](https://github.com/sqlc-dev/sqlc) — generates typed code from SQL.

## Build exercise

Create `users`, `projects`, and `tasks` with migrations. Add foreign keys and a unique constraint, seed test data, write a joined list query, run `EXPLAIN`, then justify one index using the query's filter/order pattern.
