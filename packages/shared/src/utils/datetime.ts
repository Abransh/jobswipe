/**
 * @fileoverview Date and time utilities for JobSwipe
 * @description Common date/time functions and helpers
 * @version 1.0.0
 * @author JobSwipe Team
 */

// =============================================================================
// DATE CONSTANTS
// =============================================================================

export const MILLISECONDS_PER_SECOND = 1000;
export const SECONDS_PER_MINUTE = 60;
export const MINUTES_PER_HOUR = 60;
export const HOURS_PER_DAY = 24;
export const DAYS_PER_WEEK = 7;
export const DAYS_PER_YEAR = 365;

export const MILLISECONDS_PER_MINUTE = MILLISECONDS_PER_SECOND * SECONDS_PER_MINUTE;
export const MILLISECONDS_PER_HOUR = MILLISECONDS_PER_MINUTE * MINUTES_PER_HOUR;
export const MILLISECONDS_PER_DAY = MILLISECONDS_PER_HOUR * HOURS_PER_DAY;
export const MILLISECONDS_PER_WEEK = MILLISECONDS_PER_DAY * DAYS_PER_WEEK;

// =============================================================================
// DATE UTILITIES
// =============================================================================

/**
 * Get current timestamp in milliseconds
 */
export function now(): number {
  return Date.now();
}

/**
 * Get current date
 */
export function today(): Date {
  return new Date();
}

/**
 * Get start of day
 */
export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get end of day
 */
export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Get start of week (Monday)
 */
export function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1);
  result.setDate(diff);
  return startOfDay(result);
}

/**
 * Get end of week (Sunday)
 */
export function endOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? 0 : 7);
  result.setDate(diff);
  return endOfDay(result);
}

/**
 * Get start of month
 */
export function startOfMonth(date: Date): Date {
  const result = new Date(date);
  result.setDate(1);
  return startOfDay(result);
}

/**
 * Get end of month
 */
export function endOfMonth(date: Date): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1, 0);
  return endOfDay(result);
}

/**
 * Get start of year
 */
export function startOfYear(date: Date): Date {
  const result = new Date(date);
  result.setMonth(0, 1);
  return startOfDay(result);
}

/**
 * Get end of year
 */
export function endOfYear(date: Date): Date {
  const result = new Date(date);
  result.setMonth(11, 31);
  return endOfDay(result);
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Add weeks to a date
 */
export function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * DAYS_PER_WEEK);
}

/**
 * Add months to a date
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Add years to a date
 */
export function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

/**
 * Add hours to a date
 */
export function addHours(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

/**
 * Add minutes to a date
 */
export function addMinutes(date: Date, minutes: number): Date {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
}

/**
 * Add seconds to a date
 */
export function addSeconds(date: Date, seconds: number): Date {
  const result = new Date(date);
  result.setSeconds(result.getSeconds() + seconds);
  return result;
}

/**
 * Subtract days from a date
 */
export function subtractDays(date: Date, days: number): Date {
  return addDays(date, -days);
}

/**
 * Subtract weeks from a date
 */
export function subtractWeeks(date: Date, weeks: number): Date {
  return addWeeks(date, -weeks);
}

/**
 * Subtract months from a date
 */
export function subtractMonths(date: Date, months: number): Date {
  return addMonths(date, -months);
}

/**
 * Subtract years from a date
 */
export function subtractYears(date: Date, years: number): Date {
  return addYears(date, -years);
}

// =============================================================================
// DATE COMPARISON
// =============================================================================

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Check if two dates are in the same week
 */
export function isSameWeek(date1: Date, date2: Date): boolean {
  const start1 = startOfWeek(date1);
  const start2 = startOfWeek(date2);
  return isSameDay(start1, start2);
}

/**
 * Check if two dates are in the same month
 */
export function isSameMonth(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth()
  );
}

/**
 * Check if two dates are in the same year
 */
export function isSameYear(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear();
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, today());
}

/**
 * Check if a date is yesterday
 */
export function isYesterday(date: Date): boolean {
  const yesterday = subtractDays(today(), 1);
  return isSameDay(date, yesterday);
}

/**
 * Check if a date is tomorrow
 */
export function isTomorrow(date: Date): boolean {
  const tomorrow = addDays(today(), 1);
  return isSameDay(date, tomorrow);
}

/**
 * Check if a date is in the past
 */
export function isPast(date: Date): boolean {
  return date < today();
}

/**
 * Check if a date is in the future
 */
export function isFuture(date: Date): boolean {
  return date > today();
}

/**
 * Check if a date is within a range
 */
export function isWithinRange(date: Date, start: Date, end: Date): boolean {
  return date >= start && date <= end;
}

// =============================================================================
// DATE DIFFERENCES
// =============================================================================

/**
 * Get difference in milliseconds
 */
export function differenceInMilliseconds(date1: Date, date2: Date): number {
  return date1.getTime() - date2.getTime();
}

/**
 * Get difference in seconds
 */
export function differenceInSeconds(date1: Date, date2: Date): number {
  return Math.floor(differenceInMilliseconds(date1, date2) / MILLISECONDS_PER_SECOND);
}

/**
 * Get difference in minutes
 */
export function differenceInMinutes(date1: Date, date2: Date): number {
  return Math.floor(differenceInMilliseconds(date1, date2) / MILLISECONDS_PER_MINUTE);
}

/**
 * Get difference in hours
 */
export function differenceInHours(date1: Date, date2: Date): number {
  return Math.floor(differenceInMilliseconds(date1, date2) / MILLISECONDS_PER_HOUR);
}

/**
 * Get difference in days
 */
export function differenceInDays(date1: Date, date2: Date): number {
  return Math.floor(differenceInMilliseconds(date1, date2) / MILLISECONDS_PER_DAY);
}

/**
 * Get difference in weeks
 */
export function differenceInWeeks(date1: Date, date2: Date): number {
  return Math.floor(differenceInDays(date1, date2) / DAYS_PER_WEEK);
}

/**
 * Get difference in months
 */
export function differenceInMonths(date1: Date, date2: Date): number {
  const yearDiff = date1.getFullYear() - date2.getFullYear();
  const monthDiff = date1.getMonth() - date2.getMonth();
  return yearDiff * 12 + monthDiff;
}

/**
 * Get difference in years
 */
export function differenceInYears(date1: Date, date2: Date): number {
  return date1.getFullYear() - date2.getFullYear();
}

// =============================================================================
// DATE FORMATTING
// =============================================================================

/**
 * Format date to ISO string
 */
export function toISOString(date: Date): string {
  return date.toISOString();
}

/**
 * Format date to ISO date string (YYYY-MM-DD)
 */
export function toISODateString(date: Date): string {
  return date.toISOString().split('T')[0] || '';
}

/**
 * Format date to ISO time string (HH:MM:SS)
 */
export function toISOTimeString(date: Date): string {
  const timePart = date.toISOString().split('T')[1];
  return timePart ? timePart.split('.')[0] : '';
}

/**
 * Format date to Unix timestamp
 */
export function toUnixTimestamp(date: Date): number {
  return Math.floor(date.getTime() / MILLISECONDS_PER_SECOND);
}

/**
 * Create date from Unix timestamp
 */
export function fromUnixTimestamp(timestamp: number): Date {
  return new Date(timestamp * MILLISECONDS_PER_SECOND);
}

/**
 * Format date to human-readable string
 */
export function formatDate(date: Date, format: string = 'YYYY-MM-DD'): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date, baseDate: Date = today()): string {
  const diff = differenceInMilliseconds(baseDate, date);
  const absDiff = Math.abs(diff);
  const isPast = diff > 0;
  
  const suffix = isPast ? 'ago' : 'from now';
  
  if (absDiff < MILLISECONDS_PER_MINUTE) {
    return isPast ? 'just now' : 'in a moment';
  }
  
  if (absDiff < MILLISECONDS_PER_HOUR) {
    const minutes = Math.floor(absDiff / MILLISECONDS_PER_MINUTE);
    return `${minutes} minute${minutes === 1 ? '' : 's'} ${suffix}`;
  }
  
  if (absDiff < MILLISECONDS_PER_DAY) {
    const hours = Math.floor(absDiff / MILLISECONDS_PER_HOUR);
    return `${hours} hour${hours === 1 ? '' : 's'} ${suffix}`;
  }
  
  if (absDiff < MILLISECONDS_PER_WEEK) {
    const days = Math.floor(absDiff / MILLISECONDS_PER_DAY);
    return `${days} day${days === 1 ? '' : 's'} ${suffix}`;
  }
  
  const weeks = Math.floor(absDiff / MILLISECONDS_PER_WEEK);
  return `${weeks} week${weeks === 1 ? '' : 's'} ${suffix}`;
}

// =============================================================================
// TIMEZONE UTILITIES
// =============================================================================

/**
 * Get timezone offset in minutes
 */
export function getTimezoneOffset(date: Date = today()): number {
  return date.getTimezoneOffset();
}

/**
 * Get timezone name
 */
export function getTimezoneName(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Convert date to timezone
 */
export function toTimezone(date: Date, timezone: string): Date {
  return new Date(date.toLocaleString('en-US', { timeZone: timezone }));
}

/**
 * Convert date to UTC
 */
export function toUTC(date: Date): Date {
  return new Date(date.getTime() + date.getTimezoneOffset() * MILLISECONDS_PER_MINUTE);
}

/**
 * Convert UTC date to local timezone
 */
export function fromUTC(date: Date): Date {
  return new Date(date.getTime() - date.getTimezoneOffset() * MILLISECONDS_PER_MINUTE);
}

// =============================================================================
// VALIDATION UTILITIES
// =============================================================================

/**
 * Check if a value is a valid date
 */
export function isValidDate(value: any): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/**
 * Check if a date string is valid
 */
export function isValidDateString(dateString: string): boolean {
  const date = new Date(dateString);
  return isValidDate(date);
}

/**
 * Check if a year is a leap year
 */
export function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

/**
 * Get number of days in a month
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Check if a date is a weekend
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
}

/**
 * Check if a date is a weekday
 */
export function isWeekday(date: Date): boolean {
  return !isWeekend(date);
}

// =============================================================================
// BUSINESS DAY UTILITIES
// =============================================================================

/**
 * Get the next business day
 */
export function getNextBusinessDay(date: Date): Date {
  let result = addDays(date, 1);
  
  while (isWeekend(result)) {
    result = addDays(result, 1);
  }
  
  return result;
}

/**
 * Get the previous business day
 */
export function getPreviousBusinessDay(date: Date): Date {
  let result = subtractDays(date, 1);
  
  while (isWeekend(result)) {
    result = subtractDays(result, 1);
  }
  
  return result;
}

/**
 * Add business days to a date
 */
export function addBusinessDays(date: Date, days: number): Date {
  let result = new Date(date);
  let remainingDays = days;
  
  while (remainingDays > 0) {
    result = addDays(result, 1);
    if (isWeekday(result)) {
      remainingDays--;
    }
  }
  
  return result;
}

/**
 * Subtract business days from a date
 */
export function subtractBusinessDays(date: Date, days: number): Date {
  let result = new Date(date);
  let remainingDays = days;
  
  while (remainingDays > 0) {
    result = subtractDays(result, 1);
    if (isWeekday(result)) {
      remainingDays--;
    }
  }
  
  return result;
}

/**
 * Get difference in business days
 */
export function differenceInBusinessDays(date1: Date, date2: Date): number {
  let start = new Date(Math.min(date1.getTime(), date2.getTime()));
  const end = new Date(Math.max(date1.getTime(), date2.getTime()));
  let count = 0;
  
  while (start < end) {
    if (isWeekday(start)) {
      count++;
    }
    start = addDays(start, 1);
  }
  
  return date1 < date2 ? -count : count;
}

// =============================================================================
// DURATION UTILITIES
// =============================================================================

/**
 * Parse duration string (e.g., "2h 30m", "1d 4h")
 */
export function parseDuration(duration: string): number {
  const regex = /(\d+)([dhms])/g;
  let totalMs = 0;
  let match;
  
  while ((match = regex.exec(duration)) !== null) {
    const value = parseInt(match[1] || '0', 10);
    const unit = match[2];
    
    switch (unit) {
      case 'd':
        totalMs += value * MILLISECONDS_PER_DAY;
        break;
      case 'h':
        totalMs += value * MILLISECONDS_PER_HOUR;
        break;
      case 'm':
        totalMs += value * MILLISECONDS_PER_MINUTE;
        break;
      case 's':
        totalMs += value * MILLISECONDS_PER_SECOND;
        break;
    }
  }
  
  return totalMs;
}

/**
 * Format duration in milliseconds to human-readable string
 */
export function formatDuration(ms: number): string {
  const absDuration = Math.abs(ms);
  const sign = ms < 0 ? '-' : '';
  
  const days = Math.floor(absDuration / MILLISECONDS_PER_DAY);
  const hours = Math.floor((absDuration % MILLISECONDS_PER_DAY) / MILLISECONDS_PER_HOUR);
  const minutes = Math.floor((absDuration % MILLISECONDS_PER_HOUR) / MILLISECONDS_PER_MINUTE);
  const seconds = Math.floor((absDuration % MILLISECONDS_PER_MINUTE) / MILLISECONDS_PER_SECOND);
  
  const parts = [];
  
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0) parts.push(`${seconds}s`);
  
  return sign + (parts.length > 0 ? parts.join(' ') : '0s');
}

// =============================================================================
// SCHEDULING UTILITIES
// =============================================================================

/**
 * Get next occurrence of a specific time
 */
export function getNextOccurrence(time: { hour: number; minute: number; second?: number }): Date {
  const now = today();
  const next = new Date(now);
  
  next.setHours(time.hour, time.minute, time.second || 0, 0);
  
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  
  return next;
}

/**
 * Get cron-like next execution time
 */
export function getNextCronExecution(_cronExpression: string, _baseDate: Date = today()): Date {
  // This is a simplified implementation
  // In a real application, you'd want to use a proper cron parser library
  throw new Error('Cron expression parsing not implemented in this utility');
}

/**
 * Check if current time is within business hours
 */
export function isBusinessHours(
  date: Date = today(),
  startHour: number = 9,
  endHour: number = 17
): boolean {
  if (isWeekend(date)) {
    return false;
  }
  
  const hour = date.getHours();
  return hour >= startHour && hour < endHour;
}

/**
 * Get next business hour
 */
export function getNextBusinessHour(
  date: Date = today(),
  startHour: number = 9,
  endHour: number = 17
): Date {
  let result = new Date(date);
  
  while (!isBusinessHours(result, startHour, endHour)) {
    if (isWeekend(result) || result.getHours() >= endHour) {
      result = startOfDay(getNextBusinessDay(result));
      result.setHours(startHour);
    } else {
      result.setHours(startHour);
    }
  }
  
  return result;
}