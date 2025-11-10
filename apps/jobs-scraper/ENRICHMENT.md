# Job Description Enrichment with AI

## Overview

The Greenhouse scraper now includes **optional AI-powered enrichment** that extracts structured data from unstructured job descriptions using Claude API.

### What Gets Extracted

The enrichment service extracts:

1. **Salary Information**
   - Minimum and maximum salary
   - Currency (USD, GBP, EUR, etc.)
   - Period (yearly, hourly, monthly)
   - Equity/stock options
   - Bonus structure

2. **Visa Sponsorship**
   - Whether sponsorship is available
   - Details and restrictions
   - Authorization requirements

3. **Remote Work Policy**
   - Type (remote, hybrid, onsite)
   - Flexibility details
   - Location restrictions

4. **Benefits**
   - List of specific benefits mentioned
   - (e.g., "401k", "health insurance", "unlimited PTO")

5. **Requirements**
   - Education requirements
   - Experience level and years
   - Required vs preferred skills
   - Language requirements

## How It Works

```
Job Description (HTML)
    ↓
[Strip HTML tags]
    ↓
[Send to Claude API with extraction prompt]
    ↓
[Parse JSON response]
    ↓
[Save to database]
```

### Example

**Input** (Job Description):
```
We're hiring a Senior Software Engineer in London, UK.

Salary: £80,000 - £120,000 per year + equity
Benefits: Private health insurance, unlimited PTO, pension matching

Requirements:
- 5+ years of experience
- Must be authorized to work in the UK (we cannot provide visa sponsorship)
- Proficient in Python, TypeScript, and React

This is a hybrid role (3 days in office, 2 days remote).
```

**Output** (Enriched Data):
```json
{
  "salary": {
    "min": 80000,
    "max": 120000,
    "currency": "GBP",
    "period": "yearly",
    "equity": "equity included"
  },
  "visaSponsorship": {
    "available": false,
    "details": "Must be authorized to work in the UK",
    "restrictions": ["cannot provide visa sponsorship"]
  },
  "remote": {
    "type": "hybrid",
    "flexibility": "3 days in office, 2 days remote"
  },
  "benefits": [
    "Private health insurance",
    "unlimited PTO",
    "pension matching"
  ],
  "requirements": {
    "experience": {
      "years": 5,
      "level": "senior"
    },
    "skills": {
      "required": ["Python", "TypeScript", "React"]
    }
  },
  "metadata": {
    "confidence": 95,
    "model": "claude-3-haiku-20240307"
  }
}
```

**Database Storage**:
```sql
INSERT INTO job_postings (
  title,
  salaryMin,      -- 80000
  salaryMax,      -- 120000
  currency,       -- 'GBP'
  salaryType,     -- 'YEARLY'
  equity,         -- 'equity included'
  formMetadata    -- JSON with visa, remote, benefits, requirements
);
```

## Setup

### 1. Get Claude API Key

1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Navigate to API Keys
4. Create a new API key
5. Copy the key (starts with `sk-ant-...`)

### 2. Configure Environment

Add to your `.env` file:

```bash
# Required for enrichment
ANTHROPIC_API_KEY="sk-ant-your-key-here"

# Enable enrichment (optional - defaults to false)
ENABLE_JOB_ENRICHMENT=true
```

### 3. Install Dependencies

```bash
cd apps/jobs-scraper
pnpm install
```

This will install `@anthropic-ai/sdk`.

## Usage

### Basic Scraping (No Enrichment)

```bash
npm run scrape:company anthropic
```

This runs the scraper **without** AI enrichment:
- ✅ Fetches jobs
- ✅ Extracts form schemas
- ❌ Does NOT extract salary/visa from descriptions
- Fast and free

### Scraping with Enrichment

```bash
ENABLE_JOB_ENRICHMENT=true npm run scrape:company anthropic
```

This runs the scraper **with** AI enrichment:
- ✅ Fetches jobs
- ✅ Extracts form schemas
- ✅ Extracts salary/visa/benefits from descriptions
- Slower (adds ~1-2 seconds per job)
- Costs API credits (see below)

### Permanent Enable

Add to your `.env`:
```bash
ENABLE_JOB_ENRICHMENT=true
```

Then run normally:
```bash
npm run scrape:company anthropic
```

## Cost Analysis

### API Usage per Job

- **Model**: Claude 3 Haiku (fastest, cheapest)
- **Input tokens**: ~800 tokens (job description)
- **Output tokens**: ~200 tokens (structured JSON)
- **Total**: ~1000 tokens per job

### Pricing (as of Nov 2024)

- **Claude 3 Haiku**: $0.25 per million input tokens, $1.25 per million output tokens
- **Cost per job**: ~$0.00045 (less than half a cent)
- **Cost for 100 jobs**: ~$0.045 (4.5 cents)
- **Cost for 1000 jobs**: ~$0.45

### Example: Anthropic (283 jobs)

- **Without enrichment**: Free, ~5 minutes
- **With enrichment**: ~$0.13, ~10-15 minutes

## Performance Impact

| Metric | Without Enrichment | With Enrichment |
|--------|-------------------|-----------------|
| Time per job | 1-2 seconds | 3-4 seconds |
| API calls per job | 2 (Greenhouse) | 3 (Greenhouse + Claude) |
| Database writes | Same | Same + enriched fields |
| Total time (100 jobs) | ~3 minutes | ~6 minutes |

## Confidence Scoring

Each enrichment includes a confidence score (0-100):

```typescript
{
  metadata: {
    confidence: 85,  // 85% confidence in extracted data
    extractedAt: "2024-11-09T18:30:00Z",
    model: "claude-3-haiku-20240307"
  }
}
```

**Confidence breakdown**:
- Salary found: +20 points
- Visa policy found: +20 points
- Remote policy found: +15 points
- Benefits found: +15 points
- Requirements found: +30 points

**Confidence levels**:
- **90-100**: High confidence (all fields found)
- **70-89**: Good confidence (most fields found)
- **50-69**: Medium confidence (some fields found)
- **0-49**: Low confidence (few fields found)

## Fallback Behavior

If enrichment fails (API error, no API key, etc.):

1. **Warning logged**: `⚠️  Failed to initialize enrichment service`
2. **Scraper continues**: Jobs are still scraped without enrichment
3. **No crash**: Enrichment is purely additive

This ensures the scraper is robust and doesn't fail if the API is down.

## Benefits of Enrichment

### For Users

1. **See salary before applying**: Users can filter jobs by salary range
2. **Know visa requirements**: Avoid applying to jobs that don't sponsor visas
3. **Understand benefits**: Compare compensation packages
4. **Remote work clarity**: Filter for remote, hybrid, or onsite roles

### For AI Automation

1. **Better job matching**: Match users to jobs based on salary expectations
2. **Smarter pre-flight checks**: Validate visa requirements before applying
3. **Enhanced cover letters**: AI can reference specific benefits and compensation
4. **Skill matching**: Match user skills to job requirements more accurately

### For Platform

1. **Richer job data**: More structured data for search and filtering
2. **Better user experience**: Users get complete information upfront
3. **Competitive advantage**: Most job boards don't extract this data
4. **Data insights**: Analyze salary trends, remote work adoption, etc.

## Database Schema

Enriched data is stored in:

```sql
job_postings (
  -- Existing fields
  id, title, description, location, ...

  -- Enriched salary fields
  salaryMin INTEGER,
  salaryMax INTEGER,
  currency VARCHAR(3),
  salaryType VARCHAR(20),
  equity TEXT,
  bonus TEXT,

  -- Enriched metadata (JSON)
  formMetadata JSONB {
    visaSponsorship: {
      available: boolean,
      details: string,
      restrictions: string[]
    },
    remote: {
      type: 'remote' | 'hybrid' | 'onsite',
      flexibility: string,
      restrictions: string[]
    },
    benefits: string[],
    requirements: {
      education: string[],
      experience: { years: number, level: string },
      skills: { required: string[], preferred: string[] },
      languages: string[]
    },
    enrichmentMetadata: {
      extractedAt: string,
      confidence: number,
      model: string
    }
  }
)
```

## Querying Enriched Data

### Find high-paying jobs

```sql
SELECT title, salaryMin, salaryMax, currency
FROM job_postings
WHERE salaryMin >= 100000
AND currency = 'USD'
ORDER BY salaryMin DESC;
```

### Find jobs that sponsor visas

```sql
SELECT title, company
FROM job_postings
WHERE formMetadata->>'visaSponsorship'->>'available' = 'true';
```

### Find fully remote jobs

```sql
SELECT title, location
FROM job_postings
WHERE formMetadata->>'remote'->>'type' = 'remote';
```

### Find jobs with specific benefits

```sql
SELECT title
FROM job_postings
WHERE formMetadata->'benefits' @> '["unlimited PTO"]'::jsonb;
```

## Troubleshooting

### Error: "ANTHROPIC_API_KEY is required"

**Cause**: Enrichment enabled but no API key set.

**Fix**:
```bash
export ANTHROPIC_API_KEY="sk-ant-your-key-here"
# Or add to .env file
```

### Warning: "Failed to initialize enrichment service"

**Cause**: Invalid API key or network issue.

**Fix**:
1. Check API key is correct
2. Test API key: `curl https://api.anthropic.com/v1/messages -H "x-api-key: $ANTHROPIC_API_KEY"`
3. Check network connectivity

### Enrichment seems inaccurate

**Cause**: Job description is poorly formatted or unclear.

**What happens**:
- Confidence score will be low (<50)
- Some fields will be `null`
- Scraper still succeeds

**Fix**: This is expected - not all job descriptions contain structured data. Review low-confidence jobs manually.

## Limitations

1. **Only works with Greenhouse**: Currently integrated only with Greenhouse scraper
2. **English-only**: Best results with English job descriptions
3. **API rate limits**: Claude API has rate limits (check your plan)
4. **Not perfect**: AI extraction can miss or misinterpret information
5. **Costs money**: ~$0.50 per 1000 jobs (very affordable but not free)

## Future Enhancements

- [ ] Support for other job boards (LinkedIn, Indeed, etc.)
- [ ] Multi-language support
- [ ] Cache enrichment results to avoid re-processing
- [ ] Batch API calls for better performance
- [ ] Custom extraction prompts per company
- [ ] Validation against form fields (cross-check salary in form vs description)

## Comparison: With vs Without Enrichment

| Feature | Basic Scraper | With Enrichment |
|---------|--------------|-----------------|
| Job listings | ✅ | ✅ |
| Application form schema | ✅ | ✅ |
| Form field classification | ✅ | ✅ |
| Automation metrics | ✅ | ✅ |
| **Salary extraction** | ❌ | ✅ |
| **Visa policy** | ❌ | ✅ |
| **Benefits list** | ❌ | ✅ |
| **Remote policy** | ❌ | ✅ |
| **Skill extraction** | ❌ | ✅ |
| **Cost** | Free | ~$0.50/1000 jobs |
| **Speed** | Fast | Medium |

## Recommendation

**Start without enrichment** to validate the scraper works, then **enable enrichment for production** to provide a better user experience.

For development/testing:
```bash
npm run scrape:company anthropic
```

For production:
```bash
ENABLE_JOB_ENRICHMENT=true npm run scrape:company anthropic
```
