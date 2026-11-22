# Package user limits

Super Admin sets **Packages → User limit**. The limit counts existing staff accounts belonging to the subscriber, including disabled accounts; the subscriber account is excluded. Blank means unlimited. Zero prevents adding staff. Existing packages remain unlimited until configured. Lowering a limit does not remove existing users but blocks new creation while usage meets or exceeds the cap.

All staff creators share the subscriber's quota, including delegated staff and Super Admin creating on the subscriber's behalf. Creation locks the subscriber row before counting and inserting, so concurrent requests cannot exceed the cap. Role/permission assignment failures roll back creation. Deleting a staff account frees a slot; disabling it does not.

The active subscription's package controls the limit; future renewals do not apply early. An active subscription is required even when the user limit is unlimited. `GET /api/users/allowance` exposes used/limit/remaining and requires user-read permission. Super Admin can pass `parent_id` to inspect a subscriber; other users cannot query another subscriber's quota. Quota failures return `USER_LIMIT_REACHED`. The Users screen shows usage, disables Add User when full, and reports server-side quota errors.

Package pricing and exports also include the user limit. Apply `20261102000004-add-package-user-limit.js` with `cd backend && bun run db:migrate` before starting updated code. Rollback requires reverting application code with the migration; removing the column loses configured limits but preserves accounts.

Tests: `DB_NAME=<isolated_test_db> bun vitest --run tests/user-limits.test.js tests/permissions.test.js --no-file-parallelism`.
