# Database Migration System

## Overview
Automated database migration system for Railway deployment. Migrations run automatically when the backend server starts, ensuring the database schema is always up to date.

## How It Works

1. **Server Startup**: When `server.js` starts, it automatically runs `runMigrations()` after connecting to MySQL
2. **Migration Tracking**: A `migrations` table tracks which migrations have been executed
3. **Idempotent**: Safe to run multiple times - only executes new migrations
4. **Sequential**: Migrations run in alphabetical order (000, 001, 002, etc.)

## Migration Files

Located in `backend/migrations/`:

- **`000_initial_schema.sql`** - Creates `users` and `health_features` tables (for fresh databases)
- **`001_add_model_columns.sql`** - Adds `base_model4_score` and `base_model5_score` columns
- **`002_create_user_profiles.sql`** - Creates `user_profiles` table for demographic data
- **`run_migrations.js`** - Migration runner script

## For Railway Deployment

### Environment Variables Required
```
DB_HOST=your-railway-mysql-host
DB_USER=root
DB_PASSWORD=your-railway-db-password
DB_NAME=railway
DB_PORT=3306
NODE_ENV=production
```

### Deployment Process
1. Railway provisions empty MySQL database
2. Backend service starts
3. `server.js` connects to database
4. Migrations run automatically (000 → 001 → 002)
5. Server begins accepting requests

### First-Time Setup on Railway
The migration system handles everything automatically:
- Creates `users` table
- Creates `health_features` table with all columns
- Adds model score columns
- Creates `user_profiles` table
- No manual SQL execution needed!

## Adding New Migrations

1. Create new file: `003_your_migration_name.sql`
2. Write SQL statements (CREATE, ALTER, etc.)
3. Commit and push to GitHub
4. Railway auto-deploys
5. Migration runs automatically on next server start

### Migration File Template
```sql
-- Migration: Description of what this migration does
-- Description: Detailed explanation
-- Date: YYYY-MM-DD

-- Your SQL statements here
ALTER TABLE your_table
ADD COLUMN new_column VARCHAR(255);

-- Multiple statements separated by semicolons
CREATE INDEX idx_new_column ON your_table(new_column);
```

## Testing Migrations Locally

### Run migrations manually (for testing):
```bash
cd backend/migrations
node run_migrations.js
```

### Check migration status:
```bash
mysql -u root -h localhost dibs -e "SELECT * FROM migrations ORDER BY executed_at"
```

### Reset migrations (caution - drops all data):
```bash
# Drop all tables
mysql -u root -h localhost dibs -e "DROP TABLE IF EXISTS health_features, user_profiles, users, migrations"

# Re-run migrations
cd backend/migrations
node run_migrations.js
```

## Troubleshooting

### Migration fails in production
- Check Railway logs for error messages
- Verify all environment variables are set
- Ensure SQL syntax is correct
- Test migration locally first

### "Table already exists" error
- Normal for existing databases
- Migration system uses `CREATE TABLE IF NOT EXISTS`
- Safe to ignore if tables already exist

### "Unknown column" error
- Check column order in migration files
- Ensure dependent migrations run first
- Use `AFTER column_name` carefully in ALTER statements

## Architecture Notes

- **Production Safety**: Server exits if migrations fail in production
- **Development Flexibility**: Server continues if migrations fail locally
- **No Downtime**: Migrations run before server accepts HTTP requests
- **Atomic**: Each migration executes in a transaction (rollback on error)

## Migration History

| File | Purpose | Tables Affected |
|------|---------|----------------|
| 000_initial_schema.sql | Initial database setup | users, health_features |
| 001_add_model_columns.sql | Add ML model score columns | health_features |
| 002_create_user_profiles.sql | User demographic data | user_profiles |
