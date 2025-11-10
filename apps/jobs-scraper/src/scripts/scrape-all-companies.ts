#!/usr/bin/env ts-node

/**
 * Bulk Company Scraper
 *
 * Scrapes multiple Greenhouse companies in sequence.
 * Add your target companies to the COMPANIES array below.
 */

import { GreenhouseJobScraper } from '../services/GreenhouseJobScraper';

// ============================================================================
// CONFIGURATION - Add your target companies here
// ============================================================================

const COMPANIES = [
  'anthropic',
  'openai',
  'stripe',
  'github',
  'shopify',
  'notion',
  'figma',
  'vercel',
  'linear',
  'zapier',
  // Add more companies here...
];

const SCRAPER_CONFIG = {
  rateLimit: {
    requestsPerMinute: 30,
    delayBetweenRequests: 1000, // 1 second between jobs
  },
  delayBetweenCompanies: 5000, // 5 seconds between companies
};

// ============================================================================
// MAIN SCRIPT
// ============================================================================

async function main() {
  const scraper = new GreenhouseJobScraper();

  console.log('🚀 Starting bulk Greenhouse scrape');
  console.log(`📋 Companies to scrape: ${COMPANIES.length}\n`);

  const results = {
    total: COMPANIES.length,
    successful: 0,
    failed: 0,
    skipped: 0,
    totalJobsProcessed: 0,
    totalJobsFailed: 0,
  };

  for (let i = 0; i < COMPANIES.length; i++) {
    const companyId = COMPANIES[i];

    console.log(`\n${'='.repeat(60)}`);
    console.log(`[${i + 1}/${COMPANIES.length}] Company: ${companyId.toUpperCase()}`);
    console.log('='.repeat(60));

    try {
      // Test connection first
      const isConnected = await scraper.testConnection(companyId);

      if (!isConnected) {
        console.log(`⏭️  Skipping ${companyId} - not on Greenhouse or unreachable`);
        results.skipped++;
        continue;
      }

      // Scrape company
      const result = await scraper.scrapeCompany(companyId, SCRAPER_CONFIG);

      if (result.success) {
        results.successful++;
        results.totalJobsProcessed += result.jobsProcessed;
        results.totalJobsFailed += result.jobsFailed;
      } else {
        results.failed++;
      }

      // Delay between companies
      if (i < COMPANIES.length - 1) {
        console.log(`\n⏳ Waiting ${SCRAPER_CONFIG.delayBetweenCompanies / 1000}s before next company...\n`);
        await delay(SCRAPER_CONFIG.delayBetweenCompanies);
      }
    } catch (error) {
      console.error(`❌ Error scraping ${companyId}:`, error instanceof Error ? error.message : error);
      results.failed++;
      continue;
    }
  }

  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 FINAL SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total companies: ${results.total}`);
  console.log(`✅ Successful: ${results.successful}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⏭️  Skipped: ${results.skipped}`);
  console.log(`\n📋 Jobs processed: ${results.totalJobsProcessed}`);
  console.log(`❌ Jobs failed: ${results.totalJobsFailed}`);
  console.log('='.repeat(60));

  await scraper.close();

  if (results.failed === 0) {
    console.log('\n✅ All companies scraped successfully!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some companies failed. Check logs above.');
    process.exit(1);
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
