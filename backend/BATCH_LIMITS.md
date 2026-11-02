# Package batch limits

Super Admin sets **Packages → Batch limit**. Blank means unlimited; zero prevents creating batches. The quota counts all existing batches for the subscriber across all farms and seasons, including closed and inactive batches. Closing a batch does not free a slot. Staff share their subscriber's total; staff-created batches are owned by the subscriber. Existing batches remain accessible when a package limit is lowered below current usage.

The active subscription's package controls the quota. A future renewal does not change it early. Every create path, including setup generation, locks the subscriber's user row before counting and inserting. This prevents concurrent requests from exceeding the limit. Farm and season ownership are checked before insertion. `GET /api/batches/allowance` exposes usage under batch-read permission, and quota errors return `BATCH_LIMIT_REACHED`.

Farm quotas are retired: farms are unlimited for active subscribers. The old farm allowance endpoint stays compatible and reports unlimited. The legacy `farm_limit` database column is retained for rollback and ignored by current quota logic. Package forms, pricing, exports, and API validation use `batch_limit`.

Apply `20261102000002-add-package-batch-limit.js` with `cd backend && bun run db:migrate`. Existing packages start with unlimited batches; set appropriate totals in Packages. Legacy farm values are not copied because they represent a different resource. Rollback requires reverting application code together with the migration; removing the batch column loses newly configured batch limits. Back up settings before rollback.

Tests: `DB_NAME=<isolated_test_db> bun vitest --run tests/batch-limits.test.js tests/farm-limits.test.js tests/setup.test.js --no-file-parallelism`.
