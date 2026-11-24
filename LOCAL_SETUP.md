# Local setup

## Prepared environment

Setup verified on 26 October 2026 with Bun 1.4.4, PostgreSQL 18, Flutter 3.41.4,
and Dart 3.11.1. Bun and its `bunx` link live in ignored `.local/bin`. Database
files live in ignored `.local/postgres`, separate from the system PostgreSQL data.
The database listens only on `127.0.0.1:55432` and uses local trust authentication.
This cluster is for dummy data only.

Backend: `http://localhost:3000`. Frontend: `http://localhost:5174` during setup,
because another process occupied Vite's default port 5173. Check Vite's output on
subsequent starts. Existing databases and the process on 5173 were not changed.

Start from the repository root:

```bash
export PATH="$PWD/.local/bin:$PATH"
bun run dev:local
```

The helper starts the prepared database if stopped, then runs both web services.
Set `POSTGRES_BIN` if PostgreSQL binaries are not in `/Library/PostgreSQL/18/bin`.
Stop web services with Ctrl+C. Stop the database separately when needed:

```bash
/Library/PostgreSQL/18/bin/pg_ctl -D "$PWD/.local/postgres" stop -m fast
```

## Demo accounts

These credentials are exclusively for this local dummy database:

| Role | Username | Password |
| --- | --- | --- |
| Super Admin | `superadmin` | `admin123` |
| Manager | `demo_manager` | `DemoFarm123!` |
| Staff | `demo_staff` | `DemoFarm123!` |

Use the manager to explore farm operations. Super Admin sees platform management.
Staff have a custom operations role capped by the manager's Basic package.

The demo adds one manager, one staff member, an active subscription, two farms,
one season, two open batches, one completed batch, three vendors, five items,
six purchases and assignments, one sale, and 22 daily logs. Dates are relative to
the seed date. The completed flock has 500 chicks, 10 mortalities, 490 birds sold,
980 kg sold, and ₹117,600 revenue. System seeders also create platform data.

## Fresh setup on another machine

Install Bun and PostgreSQL. Create a dedicated empty local database and role.
Copy `backend/.env.example` to `backend/.env`; set database credentials and a
random `JWT_SECRET`. Copy `frontend/.env.example` to `frontend/.env`.

```bash
bun install --frozen-lockfile
cd backend
bun run db:migrate
bun run db:seed
bun run seed:demo
cd ..
bun run dev
```

`DB_PORT` is used by both runtime and migration configuration. Its fallback is
5432; the example uses 55432. Run backend commands from `backend` so dotenv finds
the correct file. The demo seed requires `NODE_ENV=development`, a loopback
`DB_HOST`, and `DB_NAME=farmora_local`. It writes in one transaction. A second run
detects `demo_manager` and leaves all records unchanged. It does not repair an
edited fixture or renew an expired demo subscription.

Run system seeds only once on a fresh database; they are not all repeat-safe.
`seed:core` currently references a missing brands seeder; use `db:seed` for fresh
setup. Do not run `db:refresh`, `db:reset`, or `bun run test` against data you want
to keep: those scripts undo migrations.

## Flutter

```bash
cd app/farmora
flutter pub get
flutter run -d chrome --dart-define=API_BASE_URL=http://localhost:3000/
```

The trailing slash is required by the HTTP wrapper. Android emulator uses
`http://10.0.2.2:3000/`; iOS simulator uses `http://localhost:3000/`. Native targets
can need debug network permissions for local HTTP. No mobile emulator was running
during setup. The default API URL remains the existing remote URL unless the
override is supplied. Web is the fully verified local client; Flutter has existing
authentication response-shape and signup-payload mismatches that need separate work.

## Validation and known issues

- Frontend production build passes. Vite warns about its large JavaScript bundle.
- All three demo logins and their dashboard API requests return HTTP 200.
- Demo seed runs successfully twice without duplicate records.
- Razorpay checkout and encrypted admin settings are implemented. See
  [payment setup](backend/RAZORPAY.md). This phase uses API keys and callback/status
  verification; webhook configuration is deferred.
- The backend suite runs in a separate database. The legacy assignment suite still
  fails to load because of obsolete `#utils/db` imports. Referral tests now complete
  a mocked captured payment before asserting bonuses, and package fixtures use the
  current price fields.
- Flutter analysis reports 39 existing warnings/information items, including a
  missing `flutter_lints` include. The starter counter widget test is outdated.
- Flutter's locked `google_fonts` 6.2.1 initially failed compilation with this SDK;
  the lockfile now uses 6.3.3 within the existing dependency constraint. Flutter
  web production build passes with the local API override. Its WebAssembly dry
  run warns about older plugins; the JavaScript build succeeds. SDK-pinned test
  dependencies were also refreshed for installed Flutter 3.41.4.

For backend checks, create a separate database, migrate and seed it once, then run
`DB_NAME=farmora_test bun vitest --run --no-file-parallelism` from `backend`.
The demo database is not used for tests.
