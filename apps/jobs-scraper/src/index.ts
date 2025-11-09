/**
 * JobSwipe Jobs Scraper
 *
 * Main entry point for the jobs scraper service.
 */

export { GreenhouseJobScraper } from './services/GreenhouseJobScraper';
export * from './types/greenhouse.types';

// Re-export for convenience
export { default as prisma } from '@jobswipe/database';
