#!/usr/bin/env ts-node

/**
 * Test Greenhouse API Connection
 *
 * Quick test to verify Greenhouse API is accessible
 * and company IDs are correct.
 */

import axios from 'axios';

const TEST_COMPANIES = [
  'anthropic',
  'openai',
  'stripe',
  'github',
  'shopify',
  'notion',
];

async function testCompany(companyId: string): Promise<void> {
  const url = `https://boards-api.greenhouse.io/v1/boards/${companyId}/jobs`;

  try {
    const response = await axios.get(url, {
      headers: {
        Accept: 'application/json',
      },
      timeout: 10000,
    });

    const jobCount = response.data.jobs?.length || 0;

    if (jobCount > 0) {
      console.log(`✅ ${companyId.padEnd(20)} - ${jobCount} jobs found`);

      // Test detailed job fetch
      const firstJob = response.data.jobs[0];
      const detailUrl = `${url}/${firstJob.id}?questions=true`;

      const detailResponse = await axios.get(detailUrl, {
        headers: { Accept: 'application/json' },
        timeout: 10000,
      });

      const questionCount = detailResponse.data.questions?.length || 0;
      console.log(
        `   📝 Sample job "${firstJob.title}" has ${questionCount} questions`
      );
    } else {
      console.log(`⚠️  ${companyId.padEnd(20)} - No jobs found`);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        console.log(`❌ ${companyId.padEnd(20)} - Not on Greenhouse (404)`);
      } else {
        console.log(
          `❌ ${companyId.padEnd(20)} - Error: ${error.response?.status}`
        );
      }
    } else {
      console.log(`❌ ${companyId.padEnd(20)} - Network error`);
    }
  }
}

async function main() {
  console.log('🧪 Testing Greenhouse API Connection\n');
  console.log('Company'.padEnd(20) + ' Status');
  console.log('─'.repeat(60));

  for (const company of TEST_COMPANIES) {
    await testCompany(company);
    await delay(500);
  }

  console.log('\n✅ Test complete!');
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch(console.error);
