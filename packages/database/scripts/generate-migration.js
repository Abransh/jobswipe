#!/usr/bin/env node

/**
 * Script to generate Prisma migration in non-interactive mode
 * This creates the initial migration with onboarding fields
 */

const { execSync } = require('child_process');
const path = require('path');

// Change to database directory
process.chdir(path.join(__dirname, '..'));

try {
  console.log('🚀 Generating Prisma migration for onboarding features...');

  // Generate the migration
  execSync('prisma migrate dev --name add-onboarding-tracking --create-only', {
    stdio: 'inherit',
    env: { ...process.env, PRISMA_MIGRATE_SKIP_GENERATE: 'true' }
  });

  console.log('✅ Migration generated successfully!');
  console.log('📝 Review the migration file before applying with: prisma migrate dev');

} catch (error) {
  console.error('❌ Error generating migration:', error.message);
  process.exit(1);
}