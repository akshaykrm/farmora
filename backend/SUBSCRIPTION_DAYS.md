# Admin subscription day adjustments

Super Admin opens **Subscribers → Update days**, or **Subscription history → Update days** for a specific period. Positive whole numbers extend the selected expiry; negative numbers shorten it. The dialog previews the resulting expiry before saving. Allowed adjustments are nonzero whole numbers between -3650 and 3650 days. A subscriber must already have a subscription.

`PUT /api/subscriptions/:subscription_id/days` accepts `{ "days": 10, "expected_valid_to": "<original ISO expiry>" }`. Only Super Admin can use this endpoint. A stale original expiry returns 409 rather than applying the same adjustment twice. The service locks the owner first, then the subscription, matching checkout's renewal lock order. The new expiry must follow the start and cannot overlap another non-deleted subscription period. Existing future periods remain unchanged; review history if an adjustment conflicts with a scheduled renewal.

The adjustment changes `valid_to` only. It does not collect payment, change packages, grant approval, reset the start date, or create a renewal. Extending an expired period uses that period's expiry as the starting point, rather than today's date. Login and dashboard expiry summaries use the saved date on the next request.

Tests: `DB_NAME=<isolated_test_db> bun vitest --run tests/subscription-days.test.js --no-file-parallelism`.
