# 🚀 Quick Start Guide

Get the JobSwipe Jobs Scraper running in 5 minutes.

## 📋 Prerequisites

- Node.js 20+
- PostgreSQL database
- Database already set up from main JobSwipe project

## 🔧 Setup (One-Time)

### 1. Run Database Migration

From the repository root:

```bash
# Navigate to database package
cd packages/database

# Run migration to add new fields
npx prisma migrate dev --name add_greenhouse_scraper_fields

# Generate Prisma client
npx prisma generate
```

### 2. Install Scraper Dependencies

```bash
# Navigate to scraper
cd ../../apps/jobs-scraper

# Install dependencies
npm install
```

## 🎯 Usage

### Test Connection First

```bash
npm run test:greenhouse
```

Expected output:
```
🧪 Testing Greenhouse API Connection

Company              Status
────────────────────────────────────────────────────────────
✅ anthropic          - 47 jobs found
   📝 Sample job "Account Executive" has 14 questions
✅ openai             - 32 jobs found
   📝 Sample job "Software Engineer" has 12 questions
...
```

### Scrape a Single Company

```bash
npm run scrape:company anthropic
```

This will:
1. Fetch all active jobs from Anthropic's Greenhouse board
2. Extract application form schemas
3. Classify each field
4. Calculate automation metrics
5. Save to database

Expected output:
```
🌱 Starting Greenhouse scrape for: anthropic
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Found 47 active jobs

[1/47] Processing: Account Executive, Mid Market EMEA
   📊 Success Rate: 92% (high)
   🤖 Pre-filled: 8/10 | AI: 2
✅ Saved successfully

...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Scraping Summary:
   ✅ Processed: 47
   ❌ Failed: 0
   ⏱️  Duration: 125.43s
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Scrape Multiple Companies

1. Edit target companies in `src/scripts/scrape-all-companies.ts`:

```typescript
const COMPANIES = [
  'anthropic',
  'openai',
  'stripe',
  'github',
  'notion',
  // Add more...
];
```

2. Run:

```bash
npm run scrape:all
```

## 📊 Verify Data

Use Prisma Studio to view the populated data:

```bash
cd ../../packages/database
npx prisma studio
```

Then navigate to `JobPosting` table and check:
- `applicationSchema` column (JSON with form fields)
- `automationFeasibility` column (high/medium/low)
- `estimatedSuccessRate` column (0-100)

## 🎯 Example Query

After scraping, find high-automation jobs:

```typescript
// In your app
import { PrismaClient } from '@jobswipe/database';

const prisma = new PrismaClient();

const highAutomationJobs = await prisma.jobPosting.findMany({
  where: {
    automationFeasibility: 'high',
    estimatedSuccessRate: { gte: 85 }
  },
  include: {
    company: true
  },
  orderBy: {
    estimatedSuccessRate: 'desc'
  }
});

console.log(`Found ${highAutomationJobs.length} high-automation jobs!`);

// Check application schema for a job
const job = highAutomationJobs[0];
console.log(JSON.stringify(job.applicationSchema, null, 2));
```

## 📋 Common Companies on Greenhouse

```bash
# AI Companies
npm run scrape:company anthropic
npm run scrape:company openai

# Tech Giants
npm run scrape:company stripe
npm run scrape:company github
npm run scrape:company shopify

# Startups
npm run scrape:company notion
npm run scrape:company figma
npm run scrape:company vercel
npm run scrape:company linear

# Finance
npm run scrape:company stripe
npm run scrape:company plaid
```

## 🔄 Scheduling (Optional)

### Option 1: Cron Job

Add to your crontab:

```bash
# Scrape all companies daily at 2 AM
0 2 * * * cd /path/to/jobswipe/apps/jobs-scraper && npm run scrape:all
```

### Option 2: Node Scheduler

Create `src/scheduler.ts`:

```typescript
import cron from 'node-cron';
import { GreenhouseJobScraper } from './services/GreenhouseJobScraper';

const COMPANIES = ['anthropic', 'openai', 'stripe'];

// Run every day at 2 AM
cron.schedule('0 2 * * *', async () => {
  console.log('🕐 Starting scheduled scrape...');

  const scraper = new GreenhouseJobScraper();

  for (const company of COMPANIES) {
    await scraper.scrapeCompany(company);
  }

  await scraper.close();
});
```

## 🐛 Troubleshooting

### Error: Company not found (404)

The company doesn't use Greenhouse or the company ID is wrong.

**Solution**:
1. Visit `https://boards.greenhouse.io/[company-name]` in your browser
2. If it redirects or 404s, the company doesn't use Greenhouse
3. Try variations: `company-name`, `companyname`, `company`

### Error: Database connection failed

**Solution**:
```bash
# Check .env file exists
cp .env.example .env

# Update DATABASE_URL in .env
DATABASE_URL="postgresql://user:password@localhost:5432/jobswipe"
```

### Error: Prisma client not found

**Solution**:
```bash
cd ../../packages/database
npx prisma generate
```

## 🎉 Success!

You should now have:
- ✅ Jobs populated in database
- ✅ Application schemas extracted
- ✅ Automation metrics calculated
- ✅ Ready for pre-flight validation and AI automation

## 📚 Next Steps

1. **Build Pre-Flight Validator** - Validate user can apply before queuing
2. **Enhance AI Agent** - Use schemas to build smart prompts
3. **Queue Prioritization** - Prioritize high-automation jobs

See main [README.md](./README.md) for full documentation.
