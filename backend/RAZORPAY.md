# Razorpay package checkout

This integration uses one-time Razorpay Orders and Standard Checkout for signup
and manual renewal. Automatic recurring billing and refund-driven entitlement
changes are not implemented.

## Setup

1. Run `bun run db:migrate` from `backend` before starting the new code. Migration
   `20261026000001-create-checkout-orders.js` creates `payment_gateway_settings`
   and `checkout_orders` and extends payment methods to include UPI and free plans.
2. Set `PAYMENT_SETTINGS_ENCRYPTION_KEY` in `backend/.env` to 64 hexadecimal
   characters (32 random bytes). Generate it once:

   ```bash
   bun -e 'console.log(require("node:crypto").randomBytes(32).toString("hex"))'
   ```

3. Restart the backend after changing the encryption environment variable.
4. Sign in as Super Admin and open **Settings**. Save Razorpay test key ID and
   key secret. Saved credentials are not automatically validated with Razorpay;
   validate them by completing a test checkout.
5. Click **Test saved connection**. It performs a read-only Razorpay request and
   reports whether the saved keys are accepted. It does not create a payment.
6. Configure automatic payment capture in Razorpay. Farmora activates access only
   after Razorpay reports `captured`, not merely `authorized`.

This phase requires only key ID and key secret. Webhook setup is deferred. Browser
callbacks verify capture on the server. If the browser closes, Farmora reconciles
its pending order when the customer returns to checkout or checks payment status.
Without a webhook, there is no unattended activation while the customer is away.

Optional future setup: the backend already supports signed events at
`/api/payments/razorpay/webhook`. Enabling it later requires a public HTTPS endpoint,
`payment.captured` / `order.paid` events, and a matching webhook secret saved through
the admin API. The Settings screen intentionally shows only API keys for this phase.

The local setup already has an encryption key in the ignored `.env` file. Real
gateway credentials must be entered by the administrator. Tests use isolated fake
credentials and do not alter the local demo database or contact Razorpay.

Secrets use AES-256-GCM encryption in PostgreSQL. Settings responses expose key ID
and configured flags, never secrets. Blank secret fields preserve existing values.
Changing key ID requires its new secret. Saving keys does not validate them; use
Test saved connection to validate after saving. Each save creates a credential version;
pending orders keep using their original version. Keep old Razorpay keys valid
until their pending orders resolve. Back up the encryption key with the database;
changing or losing it makes saved credentials unreadable. Serve production admin
and API traffic over HTTPS.

## Account and payment lifecycle

- Signup saves the account, internal vendor, invoice configuration, and local
  checkout record in one transaction. A paid account has no subscription yet.
- Signup and login return a one-hour checkout token for unpaid/expired managers.
  Checkout tokens are rejected by normal application APIs and admin settings.
  Signing in again provides a fresh token so payment can be resumed.
- The backend calculates the amount from the selected active package. Prices,
  duration, referral partner, and bonus configuration are captured in the order.
  Amounts sent to Razorpay are integer paise in INR; clients cannot submit prices.
- Free packages activate inside the local transaction without Razorpay. Free
  activations do not generate referral bonuses.
- Paid checkout creates/reuses a Razorpay Order. Callback verification checks
  HMAC signature, stored order ownership, payment ID, amount, currency, and captured
  status using a server-to-server Razorpay fetch.
- Webhooks verify the original raw bytes and reconcile against Razorpay. Status
  checks also reconcile captured payments when the browser callback was lost.
- Activation locks the account and order, then creates subscription, completed
  payment, referral credit, and completed checkout in one database transaction.
  Unique identifiers and locks prevent duplicate callbacks/webhooks from granting
  access or referral bonuses twice.
- Failed/cancelled attempts leave the account and checkout pending. The customer
  can retry. Referral bonuses are credited only after a verified paid activation.
- Renewal starts after the latest subscription expiry, or now if already expired.
  Pending renewals resume the same order. Request UUIDs prevent replay from adding
  another renewal; a separate intentional renewal uses a new UUID.

## API contract

All ordinary responses use the existing `{ status, data, error }` envelope.

| Endpoint | Access | Purpose |
| --- | --- | --- |
| `GET /api/settings/razorpay` | Super Admin | Read configured flags and key ID |
| `PUT /api/settings/razorpay` | Super Admin | Save key ID and key secret; optional future webhook secret |
| `POST /api/settings/razorpay/test` | Super Admin | Read-only credential connection check |
| `GET /api/checkout/session` | Manager checkout/app session | Resume purchase and list active packages |
| `POST /api/checkout/orders` | Manager checkout/app session or Super Admin | Create/resume initial or renewal checkout |
| `GET /api/checkout/orders/:id` | Owner or Super Admin | Reconcile and read status |
| `POST /api/checkout/orders/:id/verify` | Owner or Super Admin | Verify Checkout callback |
| `POST /api/checkout/access` | Manager checkout/app session | Exchange for normal app session after activation |
| `POST /api/payments/razorpay/webhook` | Razorpay signature | Recover payment independently of browser |

Order creation requires `package_id`, `kind` (`initial` or `renewal`), and a stable
UUID `request_id`. Only Super Admin can supply another subscriber's `user_id` or
assign a referral partner by ID. Signup may still accept a public referral code.
Existing `/api/subscriptions/subscribe` and `/renew` now also require `request_id`
and return checkout data. Subscription edits by Super Admin remain administrative
operations; they do not charge a customer.

Public password reset previously allowed anyone to replace an account password.
It is now restricted to authenticated Super Admin. The sign-in recovery dialog
directs users to their administrator; verified email-based recovery is separate work.

## Verification

Create a dedicated database whose name ends with `_test`, migrate and seed it,
then run:

```bash
DB_NAME=farmora_checkout_test bun vitest --run tests/checkout.test.js --no-file-parallelism
```

Tests cover encrypted/write-only settings, restricted sessions, free activation,
server pricing, concurrent callbacks/webhooks, invalid signatures, wrong ownership,
uncaptured payments, retries, DB rollback, renewal idempotency, key rotation, missing
credentials, and exact webhook bytes. Referral regression tests now explicitly
complete a mocked captured payment before asserting bonuses.

Live readiness still requires an actual Razorpay test payment. Public webhook
delivery is deferred until that phase is enabled. There is no development bypass that activates a paid plan without capture.

Razorpay references:
- [Standard Checkout](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/)
- [Webhook validation](https://razorpay.com/docs/webhooks/validate-test/)
- [Orders API](https://razorpay.com/docs/api/orders/create/)

Local gateway check: the supplied test credentials returned HTTP 401 from Razorpay.
The administrator will correct and validate credentials later. No real payment was
attempted; captured payments and webhook delivery were tested with gateway mocks.
