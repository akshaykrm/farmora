# Farmora

Farmora is a private poultry farm management SaaS. It tracks flocks, inventory,
farm finances, subscriptions, investors, and referral partners. See
[LOCAL_SETUP.md](LOCAL_SETUP.md) for local startup, demo accounts, and validation results.
See [Razorpay setup](backend/RAZORPAY.md) for payment configuration and checkout lifecycle.

## Code map

- `backend/server.js` connects PostgreSQL and starts the Express API.
- `backend/app.js` mounts routes, logging, response/error handling, and report hooks.
- `backend/src/routes`, `controllers`, `validators`, and `services` handle HTTP
  routing, Joi validation, and business rules. Investor and referral features have
  their own directories under `backend/src`.
- `backend/models` defines Sequelize models and associations. `migrations` records
  schema changes; `seeders` supplies platform data.
- `frontend/src/App.tsx` maps React pages and route guards. `paths.ts` defines menus.
- `frontend/src/pages` groups each feature's UI, API calls, forms, and query hooks.
- `frontend/src/store/authentication` maintains session state. React Query handles
  server data; Tailwind and MUI provide styling and controls.
- `backend/src/reports` contains the report registry, builders, financial and daily
  log metrics, cache, and closed-batch snapshots. Exports use ExcelJS and PDFKit.
- `app/farmora` is a separate Flutter client using Provider, repositories, and an
  HTTP wrapper. It currently covers introduction, authentication, packages, and an
  early dashboard. It does not implement the web application's full feature set.

## Access and tenancy

Super Admin manages packages, subscribers, system roles, and referral partners.
Managers are subscribers who own tenant data. A manager's user ID is the
`master_id` on farms, seasons, batches, vendors, items, purchases, and other records.
Staff use their manager's ID through `parent_id` and the tenant-scope helpers.

Login returns a JWT and resolved permission keys. Authenticated requests reload
the user and permissions. Managers receive permissions from their active package's
system role. Staff receive assigned role and direct permissions intersected with
the same package ceiling. Frontend guards control menus; backend permission
middleware enforces API access. Managers and staff require an active subscription
at login.

## Farm workflow

1. Create a subscriber and subscription. Complete profile and setup checklist.
2. Add farms and seasons. Each batch belongs to one farm and one season.
3. Configure suppliers, customers, and items. Item types distinguish chicks,
   medicine, three feed types, regular items, and internal expense categories.
4. Record purchases, batch assignments, returns/transfers, supplier payments,
   sales, integration costs, working costs, and general income/expenses.
5. Record daily mortality, feed, bird weights, and sales. Feed purchases use bags;
   daily feed also uses bags, with 50 kg per bag in metric calculations.
6. Review batch/season overviews, cash flow, and operational/financial reports.
   Closing a batch enables saved report snapshots; hooks invalidate affected data.

Investor management and transaction ledgers track capital and profit/loss
transactions. Referral partner ledgers track subscription bonuses and payouts.
These are separate from farm supplier/customer ledgers.

## Development

Use Bun for backend and frontend commands. Backend reads `backend/.env` when run
from that directory. Frontend reads `frontend/.env`; Vite embeds
`VITE_BACKEND_URL` at build time. Flutter uses `--dart-define=API_BASE_URL=...`.

Root Bun workspaces run backend and frontend together. Flutter remains separate.
Deployment workflows build frontend and reload backend with PM2; local setup does
not use those deployment credentials or services. Changes follow the private PR
workflow in [CONTRIBUTING.md](CONTRIBUTING.md).
