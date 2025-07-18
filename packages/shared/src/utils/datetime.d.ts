/**
 * @fileoverview Date and time utilities for JobSwipe
 * @description Common date/time functions and helpers
 * @version 1.0.0
 * @author JobSwipe Team
 */
export declare const MILLISECONDS_PER_SECOND = 1000;
export declare const SECONDS_PER_MINUTE = 60;
export declare const MINUTES_PER_HOUR = 60;
export declare const HOURS_PER_DAY = 24;
export declare const DAYS_PER_WEEK = 7;
export declare const DAYS_PER_YEAR = 365;
export declare const MILLISECONDS_PER_MINUTE: number;
export declare const MILLISECONDS_PER_HOUR: number;
export declare const MILLISECONDS_PER_DAY: number;
export declare const MILLISECONDS_PER_WEEK: number;
/**
 * Get current timestamp in milliseconds
 */
export declare function now(): number;
/**
 * Get current date
 */
export declare function today(): Date;
/**
 * Get start of day
 */
export declare function startOfDay(date: Date): Date;
/**
 * Get end of day
 */
export declare function endOfDay(date: Date): Date;
/**
 * Get start of week (Monday)
 */
export declare function startOfWeek(date: Date): Date;
/**
 * Get end of week (Sunday)
 */
export declare function endOfWeek(date: Date): Date;
/**
 * Get start of month
 */
export declare function startOfMonth(date: Date): Date;
/**
 * Get end of month
 */
export declare function endOfMonth(date: Date): Date;
/**
 * Get start of year
 */
export declare function startOfYear(date: Date): Date;
/**
 * Get end of year
 */
export declare function endOfYear(date: Date): Date;
/**
 * Add days to a date
 */
export declare function addDays(date: Date, days: number): Date;
/**
 * Add weeks to a date
 */
export declare function addWeeks(date: Date, weeks: number): Date;
/**
 * Add months to a date
 */
export declare function addMonths(date: Date, months: number): Date;
/**
 * Add years to a date
 */
export declare function addYears(date: Date, years: number): Date;
/**
 * Add hours to a date
 */
export declare function addHours(date: Date, hours: number): Date;
/**
 * Add minutes to a date
 */
export declare function addMinutes(date: Date, minutes: number): Date;
/**
 * Add seconds to a date
 */
export declare function addSeconds(date: Date, seconds: number): Date;
/**
 * Subtract days from a date
 */
export declare function subtractDays(date: Date, days: number): Date;
/**
 * Subtract weeks from a date
 */
export declare function subtractWeeks(date: Date, weeks: number): Date;
/**
 * Subtract months from a date
 */
export declare function subtractMonths(date: Date, months: number): Date;
/**
 * Subtract years from a date
 */
export declare function subtractYears(date: Date, years: number): Date;
/**
 * Check if two dates are the same day
 */
export declare function isSameDay(date1: Date, date2: Date): boolean;
/**
 * Check if two dates are in the same week
 */
export declare function isSameWeek(date1: Date, date2: Date): boolean;
/**
 * Check if two dates are in the same month
 */
export declare function isSameMonth(date1: Date, date2: Date): boolean;
/**
 * Check if two dates are in the same year
 */
export declare function isSameYear(date1: Date, date2: Date): boolean;
/**
 * Check if a date is today
 */
export declare function isToday(date: Date): boolean;
/**
 * Check if a date is yesterday
 */
export declare function isYesterday(date: Date): boolean;
/**
 * Check if a date is tomorrow
 */
export declare function isTomorrow(date: Date): boolean;
/**
 * Check if a date is in the past
 */
export declare function isPast(date: Date): boolean;
/**
 * Check if a date is in the future
 */
export declare function isFuture(date: Date): boolean;
/**
 * Check if a date is within a range
 */
export declare function isWithinRange(date: Date, start: Date, end: Date): boolean;
/**
 * Get difference in milliseconds
 */
export declare function differenceInMilliseconds(date1: Date, date2: Date): number;
/**
 * Get difference in seconds
 */
export declare function differenceInSeconds(date1: Date, date2: Date): number;
/**
 * Get difference in minutes
 */
export declare function differenceInMinutes(date1: Date, date2: Date): number;
/**
 * Get difference in hours
 */
export declare function differenceInHours(date1: Date, date2: Date): number;
/**
 * Get difference in days
 */
export declare function differenceInDays(date1: Date, date2: Date): number;
/**
 * Get difference in weeks
 */
export declare function differenceInWeeks(date1: Date, date2: Date): number;
/**
 * Get difference in months
 */
export declare function differenceInMonths(date1: Date, date2: Date): number;
/**
 * Get difference in years
 */
export declare function differenceInYears(date1: Date, date2: Date): number;
/**
 * Format date to ISO string
 */
export declare function toISOString(date: Date): string;
/**
 * Format date to ISO date string (YYYY-MM-DD)
 */
export declare function toISODateString(date: Date): string;
/**
 * Format date to ISO time string (HH:MM:SS)
 */
export declare function toISOTimeString(date: Date): string;
/**
 * Format date to Unix timestamp
 */
export declare function toUnixTimestamp(date: Date): number;
/**
 * Create date from Unix timestamp
 */
export declare function fromUnixTimestamp(timestamp: number): Date;
/**
 * Format date to human-readable string
 */
export declare function formatDate(date: Date, format?: string): string;
/**
 * Format relative time (e.g., "2 hours ago")
 */
export declare function formatRelativeTime(date: Date, baseDate?: Date): string;
/**
 * Get timezone offset in minutes
 */
export declare function getTimezoneOffset(date?: Date): number;
/**
 * Get timezone name
 */
export declare function getTimezoneName(): string;
/**
 * Convert date to timezone
 */
export declare function toTimezone(date: Date, timezone: string): Date;
/**
 * Convert date to UTC
 */
export declare function toUTC(date: Date): Date;
/**
 * Convert UTC date to local timezone
 */
export declare function fromUTC(date: Date): Date;
/**
 * Check if a value is a valid date
 */
export declare function isValidDate(value: any): value is Date;
/**
 * Check if a date string is valid
 */
export declare function isValidDateString(dateString: string): boolean;
/**
 * Check if a year is a leap year
 */
export declare function isLeapYear(year: number): boolean;
/**
 * Get number of days in a month
 */
export declare function getDaysInMonth(year: number, month: number): number;
/**
 * Check if a date is a weekend
 */
export declare function isWeekend(date: Date): boolean;
/**
 * Check if a date is a weekday
 */
export declare function isWeekday(date: Date): boolean;
/**
 * Get the next business day
 */
export declare function getNextBusinessDay(date: Date): Date;
/**
 * Get the previous business day
 */
export declare function getPreviousBusinessDay(date: Date): Date;
/**
 * Add business days to a date
 */
export declare function addBusinessDays(date: Date, days: number): Date;
/**
 * Subtract business days from a date
 */
export declare function subtractBusinessDays(date: Date, days: number): Date;
/**
 * Get difference in business days
 */
export declare function differenceInBusinessDays(date1: Date, date2: Date): number;
/**
 * Parse duration string (e.g., "2h 30m", "1d 4h")
 */
export declare function parseDuration(duration: string): number;
/**
 * Format duration in milliseconds to human-readable string
 */
export declare function formatDuration(ms: number): string;
/**
 * Get next occurrence of a specific time
 */
export declare function getNextOccurrence(time: {
    hour: number;
    minute: number;
    second?: number;
}): Date;
/**
 * Get cron-like next execution time
 */
export declare function getNextCronExecution(_cronExpression: string, _baseDate?: Date): Date;
/**
 * Check if current time is within business hours
 */
export declare function isBusinessHours(date?: Date, startHour?: number, endHour?: number): boolean;
/**
 * Get next business hour
 */
export declare function getNextBusinessHour(date?: Date, startHour?: number, endHour?: number): Date;
//# sourceMappingURL=datetime.d.ts.map