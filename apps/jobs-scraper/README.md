# 🌱 JobSwipe Jobs Scraper

Internal tool for scraping job listings from Greenhouse-powered job boards and populating the JobSwipe database with rich application metadata.

## 🎯 What It Does

1. **Scrapes job listings** from Greenhouse API
2. **Extracts application forms** with all field metadata
3. **Classifies fields** to determine automation strategy:
   - Direct profile mapping (first name, email, etc.)
   - Boolean conversions (visa sponsorship → Yes/No)
   - Calculated fields (years of experience)
   - AI-generated content (cover letters, "Why us?")
4. **Calculates automation metrics** (success rate, feasibility)
5. **Populates database** with complete application schemas

## 📦 Installation

From the repository root:

```bash
# Install dependencies
npm install

# Navigate to scraper
cd apps/jobs-scraper

# Install scraper dependencies
npm install
```

## 🚀 Usage

### Scrape Single Company

```bash
npm run scrape:company anthropic
npm run scrape:company openai
npm run scrape:company stripe
```

### Scrape Multiple Companies

Edit `src/scripts/scrape-all-companies.ts` to add your target companies, then:

```bash
npm run scrape:all
```

### Test Greenhouse Connection

```bash
npm run test:greenhouse
```

## 📊 What Gets Populated

After scraping, each job in the database will have:

### 1. **Basic Job Info**
- Title, description, location
- Company, department, posted date
- Salary range (if available)

### 2. **Application Schema** (JSON)
```json
{
  "fields": [
    {
      "id": "first_name",
      "label": "First Name",
      "required": true,
      "answerStrategy": "PROFILE_DIRECT",
      "profileMapping": "firstName",
      "confidence": 1.0
    },
    {
      "id": "question_xyz",
      "label": "Do you require visa sponsorship?",
      "required": true,
      "type": "multi_value_single_select",
      "options": [
        { "value": 1, "label": "Yes" },
        { "value": 0, "label": "No" }
      ],
      "answerStrategy": "PROFILE_BOOLEAN",
      "profileMapping": "needsVisaSponsorship",
      "confidence": 1.0
    }
  ],
  "metadata": {
    "estimatedSuccessRate": 92,
    "automationFeasibility": "high"
  }
}
```

### 3. **Automation Metrics**
- `estimatedSuccessRate` (0-100): Predicted automation success
- `automationFeasibility` (high/medium/low)
- `prefilledFieldCount`: Fields we can auto-fill
- `aiRequiredFieldCount`: Fields needing AI
- `totalRequiredFields`: Total required fields

## 🧠 Field Classification

The scraper automatically classifies each form field:

| Strategy | Description | Example | Success Rate |
|----------|-------------|---------|--------------|
| `PROFILE_DIRECT` | Direct mapping from user profile | firstName → "First Name" field | 98% |
| `PROFILE_BOOLEAN` | Boolean to Yes/No conversion | needsVisa → "Yes"/"No" | 98% |
| `PROFILE_CALCULATED` | Calculate from profile data | Sum work experience → years | 95% |
| `FILE_UPLOAD` | Resume/document upload | Resume upload | 95% |
| `AI_GENERATE` | AI generates content | Cover letter, "Why us?" | 90% |
| `AI_ASSISTED` | AI helps choose option | Complex dropdown selections | 75% |
| `SKIP` | Optional, can skip | Optional fields | 100% |

## 📁 Database Schema

### JobPosting Fields Added

```prisma
model JobPosting {
  // ... existing fields ...

  // Greenhouse-specific
  greenhouseCompanyId   String?
  greenhouseJobId       String?
  applicationSchema     Json?
  formMetadata          Json?

  // Automation metrics
  automationFeasibility String?  // 'high', 'medium', 'low'
  estimatedSuccessRate  Int?     // 0-100
  prefilledFieldCount   Int      @default(0)
  aiRequiredFieldCount  Int      @default(0)
  totalRequiredFields   Int      @default(0)

  // Tracking
  lastSchemaUpdate      DateTime?
  schemaVersion         String?
}
```

### UserProfile Fields Added

```prisma
model UserProfile {
  // ... existing fields ...

  needsVisaSponsorship  Boolean?  @default(false)
}
```

## 🔧 Configuration

### Rate Limiting

Default configuration (can be customized):

```typescript
{
  rateLimit: {
    requestsPerMinute: 30,
    delayBetweenRequests: 1000, // 1 second
  },
  delayBetweenCompanies: 5000, // 5 seconds
}
```

### Target Companies

Edit `src/scripts/scrape-all-companies.ts`:

```typescript
const COMPANIES = [
  'anthropic',
  'openai',
  'stripe',
  // Add more...
];
```

## 📋 Example Output

```
🌱 Starting Greenhouse scrape for: anthropic
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Found 47 active jobs

[1/47] Processing: Account Executive, Mid Market EMEA
   📊 Success Rate: 92% (high)
   🤖 Pre-filled: 8/10 | AI: 2
✅ Saved successfully

[2/47] Processing: Senior Software Engineer
   📊 Success Rate: 88% (high)
   🤖 Pre-filled: 7/9 | AI: 2
✅ Saved successfully

...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Scraping Summary:
   ✅ Processed: 47
   ❌ Failed: 0
   ⏱️  Duration: 125.43s
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🎯 Next Steps

After scraping, the populated data can be used by:

1. **Pre-Flight Validator** - Checks if user can apply before queuing
2. **AI Agent** - Uses schema to build intelligent application prompts
3. **Queue Prioritizer** - Prioritizes high-automation jobs

## 🛠️ Development

### Project Structure

```
apps/jobs-scraper/
├── src/
│   ├── services/
│   │   └── GreenhouseJobScraper.ts    # Main scraper logic
│   ├── scripts/
│   │   ├── scrape-greenhouse.ts       # Single company CLI
│   │   ├── scrape-all-companies.ts    # Bulk scraper CLI
│   │   └── test-greenhouse.ts         # Connection tester
│   └── types/
│       └── greenhouse.types.ts        # TypeScript types
├── package.json
├── tsconfig.json
└── README.md
```

### Adding New Scrapers

To add scrapers for other job boards (LinkedIn, Indeed, etc.):

1. Create new service: `src/services/LinkedInJobScraper.ts`
2. Implement similar interface
3. Add CLI script
4. Update `scrape-all-companies.ts`

## 📝 Notes

- **Rate Limiting**: Be respectful to Greenhouse API
- **Database**: Requires PostgreSQL with Prisma
- **Error Handling**: Failed jobs are logged but don't stop scraping
- **Caching**: No caching - always fetches fresh data
- **Updates**: Re-scraping updates existing jobs

## 🔒 Security

- No API keys required (Greenhouse boards are public)
- Database credentials via environment variables
- No sensitive data stored in code

## 📚 References

- [Greenhouse Job Board API](https://developers.greenhouse.io/job-board.html)
- [JobSwipe Main Repo](../../README.md)
