# Dashboard package reminder

Super Admin can set **Settings → Subscription reminders → Days before package expiry**. The platform-wide default is 10 calendar days; allowed values are whole numbers from 0 to 365. Zero shows the card on the expiry date and after expiry. Missing subscriptions have no dashboard card. Expired subscriptions remain visible for renewal when the dashboard is accessible.

`GET /api/settings/subscriptions` and `PUT /api/settings/subscriptions` require Super Admin. The body is `{ "subscription_reminder_days": 10 }`. Dashboard responses include the effective `reminder_days` and `expiring_soon` flag in the subscription summary. The frontend renders the current package card only when that flag is true. Changes take effect on the next dashboard fetch; subscription dates and billing are unchanged.

Apply `20261102000001-create-platform-settings.js` with `cd backend && bun run db:migrate` before starting the updated backend. The singleton settings row persists independently of Razorpay credentials. Roll back code together with the migration; undo drops this setting and restores the previous hardcoded reminder behavior.

Tests: `DB_NAME=<isolated_test_db> bun vitest --run tests/subscription-reminder.test.js --no-file-parallelism`.
