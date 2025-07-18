"use strict";
/**
 * @fileoverview String utilities for JobSwipe
 * @description Common string manipulation functions and helpers
 * @version 1.0.0
 * @author JobSwipe Team
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEmpty = isEmpty;
exports.isNotEmpty = isNotEmpty;
exports.truncate = truncate;
exports.truncateWords = truncateWords;
exports.capitalize = capitalize;
exports.capitalizeWords = capitalizeWords;
exports.toTitleCase = toTitleCase;
exports.toCamelCase = toCamelCase;
exports.toPascalCase = toPascalCase;
exports.toSnakeCase = toSnakeCase;
exports.toKebabCase = toKebabCase;
exports.toConstantCase = toConstantCase;
exports.isAlpha = isAlpha;
exports.isAlphaNumeric = isAlphaNumeric;
exports.isNumeric = isNumeric;
exports.isEmail = isEmail;
exports.isUrl = isUrl;
exports.isUuid = isUuid;
exports.isJson = isJson;
exports.isHexColor = isHexColor;
exports.isAscii = isAscii;
exports.removeWhitespace = removeWhitespace;
exports.normalizeWhitespace = normalizeWhitespace;
exports.stripHtml = stripHtml;
exports.stripMarkdown = stripMarkdown;
exports.escapeHtml = escapeHtml;
exports.unescapeHtml = unescapeHtml;
exports.escapeRegex = escapeRegex;
exports.pad = pad;
exports.padRight = padRight;
exports.reverse = reverse;
exports.repeat = repeat;
exports.replaceAll = replaceAll;
exports.insert = insert;
exports.remove = remove;
exports.countOccurrences = countOccurrences;
exports.countWords = countWords;
exports.countCharacters = countCharacters;
exports.countLines = countLines;
exports.getMostFrequentChar = getMostFrequentChar;
exports.getCharacterFrequency = getCharacterFrequency;
exports.isPalindrome = isPalindrome;
exports.isAnagram = isAnagram;
exports.levenshteinDistance = levenshteinDistance;
exports.similarity = similarity;
exports.generateRandom = generateRandom;
exports.generateRandomAlphanumeric = generateRandomAlphanumeric;
exports.generateRandomAlpha = generateRandomAlpha;
exports.generateRandomNumeric = generateRandomNumeric;
exports.generateRandomHex = generateRandomHex;
exports.generateSlug = generateSlug;
exports.generateInitials = generateInitials;
exports.findAllIndices = findAllIndices;
exports.findWords = findWords;
exports.extractUrls = extractUrls;
exports.extractEmails = extractEmails;
exports.extractPhoneNumbers = extractPhoneNumbers;
exports.extractHashtags = extractHashtags;
exports.extractMentions = extractMentions;
exports.format = format;
exports.formatNamed = formatNamed;
exports.formatNumber = formatNumber;
exports.formatFileSize = formatFileSize;
exports.pluralize = pluralize;
exports.formatList = formatList;
exports.mask = mask;
exports.center = center;
// =============================================================================
// BASIC STRING UTILITIES
// =============================================================================
/**
 * Check if a string is empty or whitespace only
 */
function isEmpty(str) {
    return !str || str.trim().length === 0;
}
/**
 * Check if a string is not empty
 */
function isNotEmpty(str) {
    return !isEmpty(str);
}
/**
 * Truncate string to specified length
 */
function truncate(str, length, suffix = '...') {
    if (str.length <= length) {
        return str;
    }
    return str.substring(0, length - suffix.length) + suffix;
}
/**
 * Truncate string at word boundary
 */
function truncateWords(str, maxWords, suffix = '...') {
    const words = str.split(/\s+/);
    if (words.length <= maxWords) {
        return str;
    }
    return words.slice(0, maxWords).join(' ') + suffix;
}
/**
 * Capitalize first letter of a string
 */
function capitalize(str) {
    if (isEmpty(str)) {
        return str;
    }
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
/**
 * Capitalize first letter of each word
 */
function capitalizeWords(str) {
    return str.replace(/\b\w/g, char => char.toUpperCase());
}
/**
 * Convert string to title case
 */
function toTitleCase(str) {
    return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
}
/**
 * Convert string to camelCase
 */
function toCamelCase(str) {
    return str
        .replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '')
        .replace(/^[A-Z]/, char => char.toLowerCase());
}
/**
 * Convert string to PascalCase
 */
function toPascalCase(str) {
    const camelCase = toCamelCase(str);
    return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
}
/**
 * Convert string to snake_case
 */
function toSnakeCase(str) {
    return str
        .replace(/([A-Z])/g, '_$1')
        .replace(/[-\s]+/g, '_')
        .toLowerCase()
        .replace(/^_/, '');
}
/**
 * Convert string to kebab-case
 */
function toKebabCase(str) {
    return str
        .replace(/([A-Z])/g, '-$1')
        .replace(/[-_\s]+/g, '-')
        .toLowerCase()
        .replace(/^-/, '');
}
/**
 * Convert string to CONSTANT_CASE
 */
function toConstantCase(str) {
    return toSnakeCase(str).toUpperCase();
}
// =============================================================================
// STRING VALIDATION
// =============================================================================
/**
 * Check if string contains only letters
 */
function isAlpha(str) {
    return /^[a-zA-Z]+$/.test(str);
}
/**
 * Check if string contains only letters and numbers
 */
function isAlphaNumeric(str) {
    return /^[a-zA-Z0-9]+$/.test(str);
}
/**
 * Check if string contains only numbers
 */
function isNumeric(str) {
    return /^[0-9]+$/.test(str);
}
/**
 * Check if string is a valid email
 */
function isEmail(str) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(str);
}
/**
 * Check if string is a valid URL
 */
function isUrl(str) {
    try {
        // Use URL constructor if available (Node.js/modern browsers)
        if (typeof URL !== 'undefined') {
            new URL(str);
            return true;
        }
        // Fallback regex validation
        const urlRegex = /^https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:[\w/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:[\w.])*)?)?$/;
        return urlRegex.test(str);
    }
    catch {
        return false;
    }
}
/**
 * Check if string is a valid UUID
 */
function isUuid(str) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
}
/**
 * Check if string is a valid JSON
 */
function isJson(str) {
    try {
        JSON.parse(str);
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Check if string is a valid hexadecimal color
 */
function isHexColor(str) {
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexColorRegex.test(str);
}
/**
 * Check if string contains only ASCII characters
 */
function isAscii(str) {
    return /^[\x00-\x7F]*$/.test(str);
}
// =============================================================================
// STRING MANIPULATION
// =============================================================================
/**
 * Remove all whitespace from string
 */
function removeWhitespace(str) {
    return str.replace(/\s/g, '');
}
/**
 * Remove extra whitespace (multiple spaces, tabs, newlines)
 */
function normalizeWhitespace(str) {
    return str.replace(/\s+/g, ' ').trim();
}
/**
 * Remove HTML tags from string
 */
function stripHtml(str) {
    return str.replace(/<[^>]*>/g, '');
}
/**
 * Remove markdown formatting from string
 */
function stripMarkdown(str) {
    return str
        .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1') // Bold and italic
        .replace(/`([^`]+)`/g, '$1') // Inline code
        .replace(/^#+\s+/gm, '') // Headers
        .replace(/^\s*[-*+]\s+/gm, '') // Lists
        .replace(/^\s*\d+\.\s+/gm, '') // Numbered lists
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1'); // Images
}
/**
 * Escape HTML special characters
 */
function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}
/**
 * Unescape HTML special characters
 */
function unescapeHtml(str) {
    return str
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'");
}
/**
 * Escape regular expression special characters
 */
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
/**
 * Pad string to specified length
 */
function pad(str, length, padString = ' ') {
    if (str.length >= length) {
        return str;
    }
    const padLength = length - str.length;
    const fullPads = Math.floor(padLength / padString.length);
    const remainder = padLength % padString.length;
    return padString.repeat(fullPads) + padString.slice(0, remainder) + str;
}
/**
 * Pad string on the right
 */
function padRight(str, length, padString = ' ') {
    if (str.length >= length) {
        return str;
    }
    const padLength = length - str.length;
    const fullPads = Math.floor(padLength / padString.length);
    const remainder = padLength % padString.length;
    return str + padString.repeat(fullPads) + padString.slice(0, remainder);
}
/**
 * Reverse a string
 */
function reverse(str) {
    return str.split('').reverse().join('');
}
/**
 * Repeat string n times
 */
function repeat(str, count) {
    return str.repeat(count);
}
/**
 * Replace all occurrences of a substring
 */
function replaceAll(str, search, replacement) {
    return str.split(search).join(replacement);
}
/**
 * Insert string at specified position
 */
function insert(str, index, insertion) {
    return str.slice(0, index) + insertion + str.slice(index);
}
/**
 * Remove substring from string
 */
function remove(str, substring) {
    return str.replace(new RegExp(escapeRegex(substring), 'g'), '');
}
// =============================================================================
// STRING ANALYSIS
// =============================================================================
/**
 * Count occurrences of a substring
 */
function countOccurrences(str, substring) {
    return (str.match(new RegExp(escapeRegex(substring), 'g')) || []).length;
}
/**
 * Count words in string
 */
function countWords(str) {
    return str.trim().split(/\s+/).filter(word => word.length > 0).length;
}
/**
 * Count characters in string (excluding whitespace)
 */
function countCharacters(str) {
    return str.replace(/\s/g, '').length;
}
/**
 * Count lines in string
 */
function countLines(str) {
    return str.split(/\r\n|\r|\n/).length;
}
/**
 * Get most frequent character
 */
function getMostFrequentChar(str) {
    const charCount = {};
    let maxCount = 0;
    let mostFrequentChar = '';
    for (const char of str) {
        charCount[char] = (charCount[char] || 0) + 1;
        if (charCount[char] > maxCount) {
            maxCount = charCount[char];
            mostFrequentChar = char;
        }
    }
    return mostFrequentChar;
}
/**
 * Get character frequency map
 */
function getCharacterFrequency(str) {
    const frequency = {};
    for (const char of str) {
        frequency[char] = (frequency[char] || 0) + 1;
    }
    return frequency;
}
/**
 * Check if string is a palindrome
 */
function isPalindrome(str) {
    const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
    return cleaned === reverse(cleaned);
}
/**
 * Check if string is an anagram of another string
 */
function isAnagram(str1, str2) {
    const normalize = (s) => s.toLowerCase().replace(/[^a-z]/g, '').split('').sort().join('');
    return normalize(str1) === normalize(str2);
}
/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1, str2) {
    const matrix = Array(str2.length + 1)
        .fill(null)
        .map(() => Array(str1.length + 1).fill(null));
    for (let i = 0; i <= str1.length; i++) {
        matrix[0][i] = i;
    }
    for (let j = 0; j <= str2.length; j++) {
        matrix[j][0] = j;
    }
    for (let j = 1; j <= str2.length; j++) {
        for (let i = 1; i <= str1.length; i++) {
            const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(matrix[j][i - 1] + 1, matrix[j - 1][i] + 1, matrix[j - 1][i - 1] + cost);
        }
    }
    return matrix[str2.length][str1.length];
}
/**
 * Calculate string similarity (0-1)
 */
function similarity(str1, str2) {
    const maxLength = Math.max(str1.length, str2.length);
    if (maxLength === 0)
        return 1;
    const distance = levenshteinDistance(str1, str2);
    return (maxLength - distance) / maxLength;
}
// =============================================================================
// STRING GENERATION
// =============================================================================
/**
 * Generate random string with specified charset
 */
function generateRandom(length, charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
}
/**
 * Generate random alphanumeric string
 */
function generateRandomAlphanumeric(length) {
    return generateRandom(length, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
}
/**
 * Generate random alphabetic string
 */
function generateRandomAlpha(length) {
    return generateRandom(length, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
}
/**
 * Generate random numeric string
 */
function generateRandomNumeric(length) {
    return generateRandom(length, '0123456789');
}
/**
 * Generate random hex string
 */
function generateRandomHex(length) {
    return generateRandom(length, '0123456789abcdef');
}
/**
 * Generate slug from string
 */
function generateSlug(str) {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
/**
 * Generate initials from name
 */
function generateInitials(name) {
    return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 3);
}
// =============================================================================
// STRING SEARCH
// =============================================================================
/**
 * Find all indices of a substring
 */
function findAllIndices(str, substring) {
    const indices = [];
    let index = str.indexOf(substring);
    while (index !== -1) {
        indices.push(index);
        index = str.indexOf(substring, index + 1);
    }
    return indices;
}
/**
 * Find words that match a pattern
 */
function findWords(str, pattern) {
    const words = str.match(/\b\w+\b/g) || [];
    return words.filter(word => pattern.test(word));
}
/**
 * Extract URLs from string
 */
function extractUrls(str) {
    const urlRegex = /https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:[\w/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:[\w.])*)?)?/g;
    return str.match(urlRegex) || [];
}
/**
 * Extract emails from string
 */
function extractEmails(str) {
    const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+/g;
    return str.match(emailRegex) || [];
}
/**
 * Extract phone numbers from string
 */
function extractPhoneNumbers(str) {
    const phoneRegex = /(\+\d{1,3}\s?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    return str.match(phoneRegex) || [];
}
/**
 * Extract hashtags from string
 */
function extractHashtags(str) {
    const hashtagRegex = /#\w+/g;
    return str.match(hashtagRegex) || [];
}
/**
 * Extract mentions from string
 */
function extractMentions(str) {
    const mentionRegex = /@\w+/g;
    return str.match(mentionRegex) || [];
}
// =============================================================================
// STRING FORMATTING
// =============================================================================
/**
 * Format string with placeholders
 */
function format(template, ...args) {
    return template.replace(/{(\d+)}/g, (match, index) => {
        const argIndex = parseInt(index, 10);
        return args[argIndex] !== undefined ? String(args[argIndex]) : match;
    });
}
/**
 * Format string with named placeholders
 */
function formatNamed(template, values) {
    return template.replace(/{(\w+)}/g, (match, key) => {
        return values[key] !== undefined ? String(values[key]) : match;
    });
}
/**
 * Format number with thousand separators
 */
function formatNumber(num, separator = ',') {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}
/**
 * Format file size
 */
function formatFileSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
}
/**
 * Pluralize word based on count
 */
function pluralize(word, count, suffix = 's') {
    return count === 1 ? word : word + suffix;
}
/**
 * Format list with proper conjunctions
 */
function formatList(items, conjunction = 'and') {
    if (items.length === 0)
        return '';
    if (items.length === 1)
        return items[0];
    if (items.length === 2)
        return `${items[0]} ${conjunction} ${items[1]}`;
    const itemsCopy = [...items];
    const last = itemsCopy.pop();
    return `${itemsCopy.join(', ')}, ${conjunction} ${last || ''}`;
}
/**
 * Mask sensitive string (e.g., credit card, email)
 */
function mask(str, visibleChars = 4, maskChar = '*') {
    if (str.length <= visibleChars) {
        return str;
    }
    const maskedLength = str.length - visibleChars;
    const maskedPart = maskChar.repeat(maskedLength);
    const visiblePart = str.slice(-visibleChars);
    return maskedPart + visiblePart;
}
/**
 * Center string within specified width
 */
function center(str, width, fillChar = ' ') {
    if (str.length >= width) {
        return str;
    }
    const totalPadding = width - str.length;
    const leftPadding = Math.floor(totalPadding / 2);
    const rightPadding = totalPadding - leftPadding;
    return fillChar.repeat(leftPadding) + str + fillChar.repeat(rightPadding);
}
//# sourceMappingURL=string.js.map