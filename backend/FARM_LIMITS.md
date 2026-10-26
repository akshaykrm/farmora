# Package farm limits

Super Admin can set **Farm limit** in the package create/edit form. The package
list, public pricing cards, and package exports show the allowance.

- A blank value (`null`) means unlimited farms. Existing packages migrate to this
  value so previously available access remains available until an admin sets limits.
- A non-negative integer sets a finite limit. Zero blocks all farm creation.
- The current active subscription determines the package. A future renewal does
  not change the allowance before its start date.
- Managers and their staff share the manager's allowance. Every farm counts,
  including inactive farms. Filters and pagination do not affect usage.
- Lowering a limit below existing usage preserves existing farms and blocks new
  creation. Increasing the limit makes new slots available immediately.
- Deleting a farm frees a slot if deletion is permitted by its existing references.
- Super Admin's own platform operations remain unrestricted.

`GET /api/farms/allowance` returns usage, limit, remaining slots, current package,
subscription status, and whether another farm can be created. It uses the existing
farm read permission. Creation still requires the existing farm write permission.
The Farms page displays this allowance and disables its Add button at the limit.

All farm creation paths, including setup generation, enforce the limit inside a
database transaction. Requests lock the same owner row before counting and inserting,
so simultaneous manager/staff requests cannot consume the last slot twice. The setup
farm counts toward the same allowance. A failed setup rolls back its generated data.

Package edits apply to current subscribers, matching the existing package permission
model. Checkout price and duration snapshots are unchanged by this allowance policy.

Run migration `20261026000002-add-package-farm-limit.js` before starting this version.
From `backend`, run focused tests on a separate migrated/seeded database:

```bash
DB_NAME=farmora_checkout_final_test bun vitest --run tests/farm-limits.test.js tests/setup.test.js --no-file-parallelism
```
