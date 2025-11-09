# Setup Instructions - Greenhouse Job Scraper

## Problem Diagnosis

The scraper is failing because:

1. ✅ **Schema Updated**: `packages/database/prisma/schema.prisma` has `externalId String? @unique`
2. ❌ **Migration Not Applied**: Database doesn't have the unique constraint yet
3. ❌ **Prisma Client Out of Sync**: Client was generated before schema changes
4. ❌ **Network Issues**: Prisma can't download engines (403 Forbidden errors)

**Result**: Runtime error when trying to use `externalId` in upsert `where` clause.

## Solution Steps

### Step 1: Set Up Database Connection

Create `.env` file in project root:

```bash
cd /home/user/jobswipe
cp packages/database/.env.example .env
```

Edit `.env` and add your database connection:

```bash
DATABASE_URL="postgresql://username:password@localhost:5432/jobswipe?schema=public"
```

### Step 2: Apply Database Migration

I've created a migration file at:
`packages/database/prisma/migrations/20251109_add_greenhouse_scraper_fields/migration.sql`

**Option A: Using Prisma (if engines download successfully)**

```bash
cd packages/database
npx prisma migrate deploy
```

**Option B: Manual SQL Execution (if Prisma fails)**

```bash
cd packages/database

# Connect to your database and run the migration
psql $DATABASE_URL -f prisma/migrations/20251109_add_greenhouse_scraper_fields/migration.sql
```

**Option C: Using a Database Client**

Copy the SQL from the migration file and execute it in your preferred database client (TablePlus, pgAdmin, DBeaver, etc.).

### Step 3: Generate Prisma Client

**Option A: Standard Generation**

```bash
cd packages/database
npx prisma generate
```

**Option B: If Network Errors Persist**

The 403 errors suggest a network restriction. Try:

1. **Check Prisma Version**:
   ```bash
   npm list @prisma/client prisma
   ```

2. **Clear npm cache and reinstall**:
   ```bash
   cd /home/user/jobswipe
   rm -rf node_modules package-lock.json
   rm -rf packages/database/node_modules
   npm install
   ```

3. **Use a different network** or **VPN** if in a restricted environment

4. **Download engines manually**:
   - Download from: https://github.com/prisma/prisma-engines/releases
   - Place in: `packages/database/node_modules/.prisma/client/`

### Step 4: Verify Prisma Client Update

Check that `externalId` is now recognized as unique:

```bash
cd packages/database
grep -A 3 "JobPostingWhereUniqueInput = {" src/generated/index.d.ts | head -10
```

You should see `externalId?:` listed as a top-level field (not nested in filters).

### Step 5: Clear TypeScript Cache and Run Scraper

```bash
cd ../../apps/jobs-scraper

# Clear any cached compiled code
rm -rf node_modules/.cache
rm -rf dist

# Run the scraper
npm run scrape:company anthropic
```

## Verification

After completing the steps above, verify the setup:

1. **Database has the columns**:
   ```sql
   SELECT column_name, data_type, is_nullable
   FROM information_schema.columns
   WHERE table_name = 'job_postings'
   AND column_name IN ('externalId', 'greenhouseCompanyId', 'greenhouseJobId', 'applicationSchema');
   ```

2. **Unique constraint exists**:
   ```sql
   SELECT constraint_name, constraint_type
   FROM information_schema.table_constraints
   WHERE table_name = 'job_postings'
   AND constraint_type = 'UNIQUE';
   ```

3. **Scraper runs successfully**:
   ```bash
   npm run scrape:company anthropic
   ```

   Expected output:
   ```
   🌱 Starting Greenhouse scrape for: anthropic
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   📋 Found 47 active jobs
   [1/47] Processing: Account Executive...
   ✅ Saved successfully
   ```

## What the Migration Does

The migration file adds:

### New Columns to `job_postings`:

1. **External ID** (for deduplication):
   - `externalId` - Unique identifier across sources

2. **Greenhouse Fields** (API metadata):
   - `greenhouseCompanyId` - Company identifier in Greenhouse
   - `greenhouseJobId` - Job ID in Greenhouse
   - `applicationSchema` - JSON with complete form schema
   - `formMetadata` - Additional form metadata

3. **Automation Intelligence**:
   - `automationFeasibility` - 'high', 'medium', 'low'
   - `estimatedSuccessRate` - 0-100 percentage
   - `prefilledFieldCount` - Fields we can auto-fill
   - `aiRequiredFieldCount` - Fields needing AI generation
   - `totalRequiredFields` - Total required fields

4. **Schema Tracking**:
   - `lastSchemaUpdate` - When schema was last updated
   - `schemaVersion` - Schema version for compatibility

### New Column to `user_profiles`:

- `needsVisaSponsorship` - Boolean for visa requirement

### Indexes Created:

- Unique index on `externalId`
- Unique compound index on `(greenhouseCompanyId, greenhouseJobId)`
- Performance indexes on automation metrics

## Troubleshooting

### Error: "Unknown argument 'externalId'"

**Cause**: Prisma client wasn't regenerated after schema change.

**Fix**: Complete Steps 2-4 above.

### Error: "403 Forbidden" when running Prisma commands

**Cause**: Network restrictions blocking Prisma engine downloads.

**Fix**: Try Option B in Step 3 (manual engine download) or use a different network.

### Error: "relation 'job_postings' does not exist"

**Cause**: Database not initialized.

**Fix**:
```bash
cd packages/database
npx prisma migrate deploy
npx prisma db seed  # If you have seed data
```

### Scraper still uses compound key at runtime

**Cause**: Cached TypeScript compilation.

**Fix**:
```bash
cd apps/jobs-scraper
rm -rf node_modules/.cache dist
# Also restart your terminal/ts-node if running in watch mode
```

## Next Steps After Setup

Once the scraper is working:

1. **Test with multiple companies**:
   ```bash
   npm run test:greenhouse  # Test API connectivity
   npm run scrape:company openai
   npm run scrape:company stripe
   ```

2. **Verify data in database**:
   ```bash
   cd ../../packages/database
   npx prisma studio
   ```
   Navigate to `JobPosting` table and check:
   - `applicationSchema` column has JSON form data
   - `automationFeasibility` is calculated
   - `estimatedSuccessRate` is populated

3. **Schedule automated scraping**:
   See `QUICKSTART.md` for cron job setup

4. **Build Pre-Flight Validator** (next phase):
   Use the populated `applicationSchema` to validate user profiles before queuing applications.
