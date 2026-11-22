# Subscriber approval

New manager accounts selecting any package other than Basic start with `approval_status: pending`. Basic is recognized by its trimmed, case-insensitive package name, following the existing default-package convention. Omitting a package selects the existing active Basic package.

Super Admin opens **Subscribers**, reviews the requested package, and clicks **Approve**. `POST /api/users/:user_id/approve` records the administrator and approval time. Approval and initial checkout preparation share a transaction and user lock, so retries cannot create duplicate subscriptions or orders. An unavailable package rolls back approval.

Super Admin can also click **Revoke approval** (`POST /api/users/:user_id/revoke-approval`) to return a subscriber to pending approval. This blocks the subscriber and their staff on subsequent API requests, including existing sessions and checkout tokens. Basic and legacy accounts can also be revoked. Approving again restores access without changing existing subscription dates or charging again; expired subscriptions still require renewal. Unpaid checkout attempts are reused. The last approval timestamp and administrator remain recorded until the next approval.

Pending users receive an awaiting-approval message at signup and login. They receive no checkout token. Both regular API authentication and checkout authentication enforce approval from the database, including for staff under a pending owner. A previously issued token or an existing paid subscription cannot bypass the check. General profile/user updates cannot set approval fields.

After approval, paid users sign in to complete Razorpay checkout; approval does not grant a paid subscription. Free non-Basic packages start their subscription term on approval. No webhook is required for approval.

Migration `20261026000003-add-account-approval.js` preserves existing accounts as approved. This feature applies to new registrations and does not require existing subscribers or Basic users upgrading later to obtain retrospective approval. No automatic email notification is sent; users can retry login after the administrator approves them.

Apply with `cd backend && bun run db:migrate`. The migration adds approval status, requested package, approval timestamp, and administrator ID. Rollback removes those columns and approval audit data; retain a database backup if needed. Roll back application code together with the migration.

Focused integration coverage: `DB_NAME=<isolated_test_db> bun vitest --run tests/account-approval.test.js --no-file-parallelism`. Never use `bun run test` against the development database: it resets data.
