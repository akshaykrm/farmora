# 🌱 Database Seeding Guide

> Historical reference: the demo seeders and accounts listed below are no longer
> present. Use [the current local setup guide](../LOCAL_SETUP.md) and
> `bun run seed:demo` for the current schema and dummy data.

## Overview

This document describes the database seeding strategy for the Farmora application. All seeders are designed to work seamlessly together with proper dependency management.

## 📋 Seeder Execution Order

Seeders are executed in chronological order based on their timestamp. The order ensures all foreign key dependencies are met:

### 1. Core User & Package Data

- `20250208124437-super-admin.js` - Super admin user (ID: 1)
- `20251109062649-default-packages.js` - Subscription packages
- `20251110165924-managers.js` - Manager users (IDs: 2, 3)
- `20251110170546-staff.js` - Staff users (IDs: 4, 5)

### 2. Farm & Subscription Data

- `20251110171049-farm.js` - Farms (linked to managers)
- `20251110171725-subscription.js` - Subscriptions (linked to users & packages)

### 3. RBAC (Role-Based Access Control)

- `20251116065945-permission.js` - Permissions
- `20251116073938-role.js` - Roles (linked to managers)
- `20251214162201-role-permissions.js` - Role-Permission mappings
- `20251214162202-user-role-assignments.js` - User-Role assignments

### 4. Farm Management

- `20251214162203-seasons.js` - Seasons (linked to masters)
- `20251214162204-vendors.js` - Vendors (linked to masters)
- `20251214162205-batches.js` - Batches (linked to seasons & farms)

### 5. Inventory Management

- `20251214162206-item-categories.js` - Item categories
- `20251214162207-items.js` - Items (linked to categories, vendors, batches)
- `20251214162208-item-batch-assignments.js` - Item-Batch assignments
- `20251214162209-item-returns.js` - Item returns

## 🎯 Seeded Data Summary

| Table                  | Records | Description                                      |
| ---------------------- | ------- | ------------------------------------------------ |
| users                  | 9       | 1 admin, 2 managers, 2 staff, 4 additional users |
| packages               | 4       | Subscription packages                            |
| permissions            | 4       | Season CRUD permissions                          |
| roles                  | 2       | "Season All Access" and "Season Read Only"       |
| role_permissions       | 5       | Role-permission mappings                         |
| user_role_assignments  | 2       | Staff user role assignments                      |
| farms                  | 4       | Farms for managers                               |
| subscriptions          | 4       | User subscriptions                               |
| seasons                | 3       | Seasonal periods                                 |
| vendors                | 3       | Suppliers (supplier type)                        |
| batches                | 4       | Production batches                               |
| item_categories        | 5       | Seeds, Fertilizers, Pesticides, Equipment, Tools |
| items                  | 4       | Inventory items                                  |
| item_batch_assignments | 4       | Item-batch links                                 |
| item_returns           | 3       | Item return records                              |
| **TOTAL**              | **60**  | **Total seeded records**                         |

## 🔑 Key IDs for Testing

### Users

- **Admin**: ID 1, username: `superadmin`, password: `admin123`
- **Manager 1**: ID 2, username: `jvnjose`, password: `root`
- **Manager 2**: ID 3, username: `raoof`, password: `root`
- **Staff Users**: IDs 4-5

### Managers & Farms

- Manager ID 2 → Farm ID 1 (Green Valley Farm)
- Manager ID 3 → Farm ID 2 (Sunnybrook Farm)

### Seasons & Batches

- Season 1 (Winter 2024) → Batches 1, 2
- Season 2 (Spring 2025) → Batch 3
- Season 3 (Summer 2024) → Batch 4

### Items

- Item 1: Corn Seeds (Category: Seeds, Vendor: 1, Batch: 1)
- Item 2: Fertilizer (Category: Fertilizers, Vendor: 2, Batch: 1)
- Item 3: Pesticide (Category: Pesticides, Vendor: 1, Batch: 2)
- Item 4: Equipment (Category: Equipment, Vendor: 3, Batch: 4)

## 🚀 Running Seeders

### Seed All Data

```bash
npm run db:seed
```

### Reset and Reseed

```bash
npm run db:seed:undo:all
npm run db:seed
```

### Fresh Database Setup

```bash
# Undo all migrations
npm run db:migrate:undo:all

# Run all migrations
npm run db:migrate

# Seed data
npm run db:seed
```

### Full Reset (Migrations + Seeds)

```bash
npm run db:reset
```

## 📝 Important Notes

### Enum Values to Remember

**User Types:**

- `admin` - Super admin
- `manager` - Farm managers
- `staff` - Farm staff

**Vendor Types:**

- `supplier` - Supplies supplier
- `buyer` - Produce buyer

**Status Values (most tables):**

- `active`
- `inactive`

**Return Types:**

- `vendor` - Return to vendor
- `batch` - Transfer to another batch

### Data Relationships

1. **Master ID System**: Manager users (IDs 2, 3) are "masters" who own farms, seasons, items, etc.
2. **Staff users** are linked to managers via implicit `master_id` or explicit relationships
3. **Batches** require both `season_id` AND `farm_id`
4. **Items** are linked to categories, vendors, and batches
5. **Item Returns** can go to either vendor OR another batch (not both)

## 🔧 Troubleshooting

### Common Issues

**Issue: Foreign key constraint error**

- Solution: Ensure seeders run in the correct order (use timestamps)
- Check that parent records exist before creating child records

**Issue: Enum value error**

- Solution: Check the allowed enum values in migrations
- Common enums: user_type, vendor_type, status, return_type

**Issue: Not null constraint violation**

- Solution: Ensure all required fields are provided in seeders
- Check migration files for `allowNull: false` fields

### Verifying Seeded Data

You can verify data was seeded correctly:

```sql
-- Check record counts
SELECT 'users' as table, COUNT(*) FROM users
UNION ALL
SELECT 'farms', COUNT(*) FROM farms
UNION ALL
SELECT 'items', COUNT(*) FROM items;

-- Check relationships
SELECT i.name as item, c.name as category, v.name as vendor
FROM items i
JOIN item_categories c ON i.category_id = c.id
JOIN vendors v ON i.vendor_id = v.id;
```

## 📚 Adding New Seeders

When creating new seeders:

1. **Use correct timestamp format**: `YYYYMMDDHHMMSS-description.js`
2. **Consider dependencies**: Ensure parent data exists
3. **Use snake_case** for column names (matches `underscored: true`)
4. **Include timestamps**: `created_at`, `updated_at`
5. **Test both up() and down()** methods
6. **Document relationships** in comments

### Example Template

```javascript
/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const records = [
      {
        // your fields here
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]

    await queryInterface.bulkInsert('table_name', records)
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      'table_name',
      {
        /* filter criteria */
      },
      {}
    )
  },
}
```

## ✅ Verification Checklist

After seeding, verify:

- [ ] All 15 tables have data
- [ ] Total of 60 records created
- [ ] All foreign key relationships are valid
- [ ] Enum values are correct
- [ ] Login works with test users
- [ ] No orphaned records

---

**Last Updated**: 2024-12-14  
**Database Version**: PostgreSQL 14+  
**ORM**: Sequelize 6.37.5
