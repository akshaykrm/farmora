# One-time free trial

Each subscriber may activate a zero-cost package once. A package is free when its effective price (`actual_price - discount_price`, floored at zero) is zero, including a fully discounted Basic package. This rule is shared across free packages, not limited to a package name or ID.

Free checkout marks `users.free_trial_used_at` inside the activation transaction. Both order preparation and activation reject a second trial with `FREE_TRIAL_ALREADY_USED`. Replaying an already completed order remains idempotent and creates no additional subscription. Owner locks serialize competing checkout attempts. Expiry and renewal do not reset usage. The persisted marker survives deleted subscription history and package renaming/repricing.

Migration `20261102000003-track-free-trial-usage.js` backfills existing usage from completed zero-cost checkout orders and historical subscriptions linked to currently free packages, including soft-deleted history. Legacy/seeded history is also checked when a user has no marker. Historical package prices are unavailable for legacy subscriptions without checkout snapshots; backfill uses their current package price.

Checkout and renewal options omit free packages for subscribers who have used their trial. `GET /api/subscriptions/package-options` returns eligible package names for the current subscriber; Super Admin can specify `user_id` to view that subscriber's choices. Subscriber queries for another account are denied. Public anonymous package listings remain unchanged. Admin day adjustments remain available and do not reset trial eligibility.

Apply the migration before starting the updated backend. To roll back, revert application code together with the migration; removing the marker loses durable usage evidence when history has been purged, so preserve a backup if needed.

Tests: `DB_NAME=<isolated_test_db> bun vitest --run tests/free-trial.test.js tests/checkout.test.js --no-file-parallelism`.
