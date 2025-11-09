#!/usr/bin/env ts-node

/**
 * Greenhouse Scraper CLI
 *
 * Usage:
 *   npm run scrape:company anthropic
 *   npm run scrape:company openai
 */

import { GreenhouseJobScraper } from '../services/GreenhouseJobScraper';

async function main() {
  const companyId = process.argv[2];

  if (!companyId) {
    console.error('❌ Error: Company ID is required');
    console.log('\nUsage:');
    console.log('  npm run scrape:company <company-id>');
    console.log('\nExample:');
    console.log('  npm run scrape:company anthropic');
    console.log('  npm run scrape:company openai');
    process.exit(1);
  }

  const scraper = new GreenhouseJobScraper();

  try {
    // Test connection first
    console.log(`🔍 Testing connection to Greenhouse for: ${companyId}...`);
    const isConnected = await scraper.testConnection(companyId);

    if (!isConnected) {
      console.error(`❌ Cannot connect to Greenhouse for company: ${companyId}`);
      console.log('\nPossible issues:');
      console.log('  - Company ID is incorrect');
      console.log('  - Company does not use Greenhouse');
      console.log('  - Network connectivity issue');
      process.exit(1);
    }

    console.log('✅ Connection successful!\n');

    // Scrape company
    const result = await scraper.scrapeCompany(companyId, {
      rateLimit: {
        requestsPerMinute: 30,
        delayBetweenRequests: 1000,
      },
    });

    if (result.success) {
      console.log('\n✅ Scraping completed successfully!');
      process.exit(0);
    } else {
      console.error('\n❌ Scraping completed with errors');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Scraping failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await scraper.close();
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
