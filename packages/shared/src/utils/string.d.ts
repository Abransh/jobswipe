/**
 * @fileoverview String utilities for JobSwipe
 * @description Common string manipulation functions and helpers
 * @version 1.0.0
 * @author JobSwipe Team
 */
/**
 * Check if a string is empty or whitespace only
 */
export declare function isEmpty(str: string): boolean;
/**
 * Check if a string is not empty
 */
export declare function isNotEmpty(str: string): boolean;
/**
 * Truncate string to specified length
 */
export declare function truncate(str: string, length: number, suffix?: string): string;
/**
 * Truncate string at word boundary
 */
export declare function truncateWords(str: string, maxWords: number, suffix?: string): string;
/**
 * Capitalize first letter of a string
 */
export declare function capitalize(str: string): string;
/**
 * Capitalize first letter of each word
 */
export declare function capitalizeWords(str: string): string;
/**
 * Convert string to title case
 */
export declare function toTitleCase(str: string): string;
/**
 * Convert string to camelCase
 */
export declare function toCamelCase(str: string): string;
/**
 * Convert string to PascalCase
 */
export declare function toPascalCase(str: string): string;
/**
 * Convert string to snake_case
 */
export declare function toSnakeCase(str: string): string;
/**
 * Convert string to kebab-case
 */
export declare function toKebabCase(str: string): string;
/**
 * Convert string to CONSTANT_CASE
 */
export declare function toConstantCase(str: string): string;
/**
 * Check if string contains only letters
 */
export declare function isAlpha(str: string): boolean;
/**
 * Check if string contains only letters and numbers
 */
export declare function isAlphaNumeric(str: string): boolean;
/**
 * Check if string contains only numbers
 */
export declare function isNumeric(str: string): boolean;
/**
 * Check if string is a valid email
 */
export declare function isEmail(str: string): boolean;
/**
 * Check if string is a valid URL
 */
export declare function isUrl(str: string): boolean;
/**
 * Check if string is a valid UUID
 */
export declare function isUuid(str: string): boolean;
/**
 * Check if string is a valid JSON
 */
export declare function isJson(str: string): boolean;
/**
 * Check if string is a valid hexadecimal color
 */
export declare function isHexColor(str: string): boolean;
/**
 * Check if string contains only ASCII characters
 */
export declare function isAscii(str: string): boolean;
/**
 * Remove all whitespace from string
 */
export declare function removeWhitespace(str: string): string;
/**
 * Remove extra whitespace (multiple spaces, tabs, newlines)
 */
export declare function normalizeWhitespace(str: string): string;
/**
 * Remove HTML tags from string
 */
export declare function stripHtml(str: string): string;
/**
 * Remove markdown formatting from string
 */
export declare function stripMarkdown(str: string): string;
/**
 * Escape HTML special characters
 */
export declare function escapeHtml(str: string): string;
/**
 * Unescape HTML special characters
 */
export declare function unescapeHtml(str: string): string;
/**
 * Escape regular expression special characters
 */
export declare function escapeRegex(str: string): string;
/**
 * Pad string to specified length
 */
export declare function pad(str: string, length: number, padString?: string): string;
/**
 * Pad string on the right
 */
export declare function padRight(str: string, length: number, padString?: string): string;
/**
 * Reverse a string
 */
export declare function reverse(str: string): string;
/**
 * Repeat string n times
 */
export declare function repeat(str: string, count: number): string;
/**
 * Replace all occurrences of a substring
 */
export declare function replaceAll(str: string, search: string, replacement: string): string;
/**
 * Insert string at specified position
 */
export declare function insert(str: string, index: number, insertion: string): string;
/**
 * Remove substring from string
 */
export declare function remove(str: string, substring: string): string;
/**
 * Count occurrences of a substring
 */
export declare function countOccurrences(str: string, substring: string): number;
/**
 * Count words in string
 */
export declare function countWords(str: string): number;
/**
 * Count characters in string (excluding whitespace)
 */
export declare function countCharacters(str: string): number;
/**
 * Count lines in string
 */
export declare function countLines(str: string): number;
/**
 * Get most frequent character
 */
export declare function getMostFrequentChar(str: string): string;
/**
 * Get character frequency map
 */
export declare function getCharacterFrequency(str: string): Record<string, number>;
/**
 * Check if string is a palindrome
 */
export declare function isPalindrome(str: string): boolean;
/**
 * Check if string is an anagram of another string
 */
export declare function isAnagram(str1: string, str2: string): boolean;
/**
 * Calculate Levenshtein distance between two strings
 */
export declare function levenshteinDistance(str1: string, str2: string): number;
/**
 * Calculate string similarity (0-1)
 */
export declare function similarity(str1: string, str2: string): number;
/**
 * Generate random string with specified charset
 */
export declare function generateRandom(length: number, charset?: string): string;
/**
 * Generate random alphanumeric string
 */
export declare function generateRandomAlphanumeric(length: number): string;
/**
 * Generate random alphabetic string
 */
export declare function generateRandomAlpha(length: number): string;
/**
 * Generate random numeric string
 */
export declare function generateRandomNumeric(length: number): string;
/**
 * Generate random hex string
 */
export declare function generateRandomHex(length: number): string;
/**
 * Generate slug from string
 */
export declare function generateSlug(str: string): string;
/**
 * Generate initials from name
 */
export declare function generateInitials(name: string): string;
/**
 * Find all indices of a substring
 */
export declare function findAllIndices(str: string, substring: string): number[];
/**
 * Find words that match a pattern
 */
export declare function findWords(str: string, pattern: RegExp): string[];
/**
 * Extract URLs from string
 */
export declare function extractUrls(str: string): string[];
/**
 * Extract emails from string
 */
export declare function extractEmails(str: string): string[];
/**
 * Extract phone numbers from string
 */
export declare function extractPhoneNumbers(str: string): string[];
/**
 * Extract hashtags from string
 */
export declare function extractHashtags(str: string): string[];
/**
 * Extract mentions from string
 */
export declare function extractMentions(str: string): string[];
/**
 * Format string with placeholders
 */
export declare function format(template: string, ...args: any[]): string;
/**
 * Format string with named placeholders
 */
export declare function formatNamed(template: string, values: Record<string, any>): string;
/**
 * Format number with thousand separators
 */
export declare function formatNumber(num: number, separator?: string): string;
/**
 * Format file size
 */
export declare function formatFileSize(bytes: number): string;
/**
 * Pluralize word based on count
 */
export declare function pluralize(word: string, count: number, suffix?: string): string;
/**
 * Format list with proper conjunctions
 */
export declare function formatList(items: string[], conjunction?: string): string;
/**
 * Mask sensitive string (e.g., credit card, email)
 */
export declare function mask(str: string, visibleChars?: number, maskChar?: string): string;
/**
 * Center string within specified width
 */
export declare function center(str: string, width: number, fillChar?: string): string;
//# sourceMappingURL=string.d.ts.map