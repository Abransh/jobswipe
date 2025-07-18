"use strict";
/**
 * @fileoverview Date and time utilities for JobSwipe
 * @description Common date/time functions and helpers
 * @version 1.0.0
 * @author JobSwipe Team
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MILLISECONDS_PER_WEEK = exports.MILLISECONDS_PER_DAY = exports.MILLISECONDS_PER_HOUR = exports.MILLISECONDS_PER_MINUTE = exports.DAYS_PER_YEAR = exports.DAYS_PER_WEEK = exports.HOURS_PER_DAY = exports.MINUTES_PER_HOUR = exports.SECONDS_PER_MINUTE = exports.MILLISECONDS_PER_SECOND = void 0;
exports.now = now;
exports.today = today;
exports.startOfDay = startOfDay;
exports.endOfDay = endOfDay;
exports.startOfWeek = startOfWeek;
exports.endOfWeek = endOfWeek;
exports.startOfMonth = startOfMonth;
exports.endOfMonth = endOfMonth;
exports.startOfYear = startOfYear;
exports.endOfYear = endOfYear;
exports.addDays = addDays;
exports.addWeeks = addWeeks;
exports.addMonths = addMonths;
exports.addYears = addYears;
exports.addHours = addHours;
exports.addMinutes = addMinutes;
exports.addSeconds = addSeconds;
exports.subtractDays = subtractDays;
exports.subtractWeeks = subtractWeeks;
exports.subtractMonths = subtractMonths;
exports.subtractYears = subtractYears;
exports.isSameDay = isSameDay;
exports.isSameWeek = isSameWeek;
exports.isSameMonth = isSameMonth;
exports.isSameYear = isSameYear;
exports.isToday = isToday;
exports.isYesterday = isYesterday;
exports.isTomorrow = isTomorrow;
exports.isPast = isPast;
exports.isFuture = isFuture;
exports.isWithinRange = isWithinRange;
exports.differenceInMilliseconds = differenceInMilliseconds;
exports.differenceInSeconds = differenceInSeconds;
exports.differenceInMinutes = differenceInMinutes;
exports.differenceInHours = differenceInHours;
exports.differenceInDays = differenceInDays;
exports.differenceInWeeks = differenceInWeeks;
exports.differenceInMonths = differenceInMonths;
exports.differenceInYears = differenceInYears;
exports.toISOString = toISOString;
exports.toISODateString = toISODateString;
exports.toISOTimeString = toISOTimeString;
exports.toUnixTimestamp = toUnixTimestamp;
exports.fromUnixTimestamp = fromUnixTimestamp;
exports.formatDate = formatDate;
exports.formatRelativeTime = formatRelativeTime;
exports.getTimezoneOffset = getTimezoneOffset;
exports.getTimezoneName = getTimezoneName;
exports.toTimezone = toTimezone;
exports.toUTC = toUTC;
exports.fromUTC = fromUTC;
exports.isValidDate = isValidDate;
exports.isValidDateString = isValidDateString;
exports.isLeapYear = isLeapYear;
exports.getDaysInMonth = getDaysInMonth;
exports.isWeekend = isWeekend;
exports.isWeekday = isWeekday;
exports.getNextBusinessDay = getNextBusinessDay;
exports.getPreviousBusinessDay = getPreviousBusinessDay;
exports.addBusinessDays = addBusinessDays;
exports.subtractBusinessDays = subtractBusinessDays;
exports.differenceInBusinessDays = differenceInBusinessDays;
exports.parseDuration = parseDuration;
exports.formatDuration = formatDuration;
exports.getNextOccurrence = getNextOccurrence;
exports.getNextCronExecution = getNextCronExecution;
exports.isBusinessHours = isBusinessHours;
exports.getNextBusinessHour = getNextBusinessHour;
// =============================================================================
// DATE CONSTANTS
// =============================================================================
exports.MILLISECONDS_PER_SECOND = 1000;
exports.SECONDS_PER_MINUTE = 60;
exports.MINUTES_PER_HOUR = 60;
exports.HOURS_PER_DAY = 24;
exports.DAYS_PER_WEEK = 7;
exports.DAYS_PER_YEAR = 365;
exports.MILLISECONDS_PER_MINUTE = exports.MILLISECONDS_PER_SECOND * exports.SECONDS_PER_MINUTE;
exports.MILLISECONDS_PER_HOUR = exports.MILLISECONDS_PER_MINUTE * exports.MINUTES_PER_HOUR;
exports.MILLISECONDS_PER_DAY = exports.MILLISECONDS_PER_HOUR * exports.HOURS_PER_DAY;
exports.MILLISECONDS_PER_WEEK = exports.MILLISECONDS_PER_DAY * exports.DAYS_PER_WEEK;
// =============================================================================
// DATE UTILITIES
// =============================================================================
/**
 * Get current timestamp in milliseconds
 */
function now() {
    return Date.now();
}
/**
 * Get current date
 */
function today() {
    return new Date();
}
/**
 * Get start of day
 */
function startOfDay(date) {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
}
/**
 * Get end of day
 */
function endOfDay(date) {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
}
/**
 * Get start of week (Monday)
 */
function startOfWeek(date) {
    const result = new Date(date);
    const day = result.getDay();
    const diff = result.getDate() - day + (day === 0 ? -6 : 1);
    result.setDate(diff);
    return startOfDay(result);
}
/**
 * Get end of week (Sunday)
 */
function endOfWeek(date) {
    const result = new Date(date);
    const day = result.getDay();
    const diff = result.getDate() - day + (day === 0 ? 0 : 7);
    result.setDate(diff);
    return endOfDay(result);
}
/**
 * Get start of month
 */
function startOfMonth(date) {
    const result = new Date(date);
    result.setDate(1);
    return startOfDay(result);
}
/**
 * Get end of month
 */
function endOfMonth(date) {
    const result = new Date(date);
    result.setMonth(result.getMonth() + 1, 0);
    return endOfDay(result);
}
/**
 * Get start of year
 */
function startOfYear(date) {
    const result = new Date(date);
    result.setMonth(0, 1);
    return startOfDay(result);
}
/**
 * Get end of year
 */
function endOfYear(date) {
    const result = new Date(date);
    result.setMonth(11, 31);
    return endOfDay(result);
}
/**
 * Add days to a date
 */
function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}
/**
 * Add weeks to a date
 */
function addWeeks(date, weeks) {
    return addDays(date, weeks * exports.DAYS_PER_WEEK);
}
/**
 * Add months to a date
 */
function addMonths(date, months) {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
}
/**
 * Add years to a date
 */
function addYears(date, years) {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + years);
    return result;
}
/**
 * Add hours to a date
 */
function addHours(date, hours) {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result;
}
/**
 * Add minutes to a date
 */
function addMinutes(date, minutes) {
    const result = new Date(date);
    result.setMinutes(result.getMinutes() + minutes);
    return result;
}
/**
 * Add seconds to a date
 */
function addSeconds(date, seconds) {
    const result = new Date(date);
    result.setSeconds(result.getSeconds() + seconds);
    return result;
}
/**
 * Subtract days from a date
 */
function subtractDays(date, days) {
    return addDays(date, -days);
}
/**
 * Subtract weeks from a date
 */
function subtractWeeks(date, weeks) {
    return addWeeks(date, -weeks);
}
/**
 * Subtract months from a date
 */
function subtractMonths(date, months) {
    return addMonths(date, -months);
}
/**
 * Subtract years from a date
 */
function subtractYears(date, years) {
    return addYears(date, -years);
}
// =============================================================================
// DATE COMPARISON
// =============================================================================
/**
 * Check if two dates are the same day
 */
function isSameDay(date1, date2) {
    return (date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate());
}
/**
 * Check if two dates are in the same week
 */
function isSameWeek(date1, date2) {
    const start1 = startOfWeek(date1);
    const start2 = startOfWeek(date2);
    return isSameDay(start1, start2);
}
/**
 * Check if two dates are in the same month
 */
function isSameMonth(date1, date2) {
    return (date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth());
}
/**
 * Check if two dates are in the same year
 */
function isSameYear(date1, date2) {
    return date1.getFullYear() === date2.getFullYear();
}
/**
 * Check if a date is today
 */
function isToday(date) {
    return isSameDay(date, today());
}
/**
 * Check if a date is yesterday
 */
function isYesterday(date) {
    const yesterday = subtractDays(today(), 1);
    return isSameDay(date, yesterday);
}
/**
 * Check if a date is tomorrow
 */
function isTomorrow(date) {
    const tomorrow = addDays(today(), 1);
    return isSameDay(date, tomorrow);
}
/**
 * Check if a date is in the past
 */
function isPast(date) {
    return date < today();
}
/**
 * Check if a date is in the future
 */
function isFuture(date) {
    return date > today();
}
/**
 * Check if a date is within a range
 */
function isWithinRange(date, start, end) {
    return date >= start && date <= end;
}
// =============================================================================
// DATE DIFFERENCES
// =============================================================================
/**
 * Get difference in milliseconds
 */
function differenceInMilliseconds(date1, date2) {
    return date1.getTime() - date2.getTime();
}
/**
 * Get difference in seconds
 */
function differenceInSeconds(date1, date2) {
    return Math.floor(differenceInMilliseconds(date1, date2) / exports.MILLISECONDS_PER_SECOND);
}
/**
 * Get difference in minutes
 */
function differenceInMinutes(date1, date2) {
    return Math.floor(differenceInMilliseconds(date1, date2) / exports.MILLISECONDS_PER_MINUTE);
}
/**
 * Get difference in hours
 */
function differenceInHours(date1, date2) {
    return Math.floor(differenceInMilliseconds(date1, date2) / exports.MILLISECONDS_PER_HOUR);
}
/**
 * Get difference in days
 */
function differenceInDays(date1, date2) {
    return Math.floor(differenceInMilliseconds(date1, date2) / exports.MILLISECONDS_PER_DAY);
}
/**
 * Get difference in weeks
 */
function differenceInWeeks(date1, date2) {
    return Math.floor(differenceInDays(date1, date2) / exports.DAYS_PER_WEEK);
}
/**
 * Get difference in months
 */
function differenceInMonths(date1, date2) {
    const yearDiff = date1.getFullYear() - date2.getFullYear();
    const monthDiff = date1.getMonth() - date2.getMonth();
    return yearDiff * 12 + monthDiff;
}
/**
 * Get difference in years
 */
function differenceInYears(date1, date2) {
    return date1.getFullYear() - date2.getFullYear();
}
// =============================================================================
// DATE FORMATTING
// =============================================================================
/**
 * Format date to ISO string
 */
function toISOString(date) {
    return date.toISOString();
}
/**
 * Format date to ISO date string (YYYY-MM-DD)
 */
function toISODateString(date) {
    return date.toISOString().split('T')[0] || '';
}
/**
 * Format date to ISO time string (HH:MM:SS)
 */
function toISOTimeString(date) {
    const timePart = date.toISOString().split('T')[1];
    return timePart ? timePart.split('.')[0] : '';
}
/**
 * Format date to Unix timestamp
 */
function toUnixTimestamp(date) {
    return Math.floor(date.getTime() / exports.MILLISECONDS_PER_SECOND);
}
/**
 * Create date from Unix timestamp
 */
function fromUnixTimestamp(timestamp) {
    return new Date(timestamp * exports.MILLISECONDS_PER_SECOND);
}
/**
 * Format date to human-readable string
 */
function formatDate(date, format = 'YYYY-MM-DD') {
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
function formatRelativeTime(date, baseDate = today()) {
    const diff = differenceInMilliseconds(baseDate, date);
    const absDiff = Math.abs(diff);
    const isPast = diff > 0;
    const suffix = isPast ? 'ago' : 'from now';
    if (absDiff < exports.MILLISECONDS_PER_MINUTE) {
        return isPast ? 'just now' : 'in a moment';
    }
    if (absDiff < exports.MILLISECONDS_PER_HOUR) {
        const minutes = Math.floor(absDiff / exports.MILLISECONDS_PER_MINUTE);
        return `${minutes} minute${minutes === 1 ? '' : 's'} ${suffix}`;
    }
    if (absDiff < exports.MILLISECONDS_PER_DAY) {
        const hours = Math.floor(absDiff / exports.MILLISECONDS_PER_HOUR);
        return `${hours} hour${hours === 1 ? '' : 's'} ${suffix}`;
    }
    if (absDiff < exports.MILLISECONDS_PER_WEEK) {
        const days = Math.floor(absDiff / exports.MILLISECONDS_PER_DAY);
        return `${days} day${days === 1 ? '' : 's'} ${suffix}`;
    }
    const weeks = Math.floor(absDiff / exports.MILLISECONDS_PER_WEEK);
    return `${weeks} week${weeks === 1 ? '' : 's'} ${suffix}`;
}
// =============================================================================
// TIMEZONE UTILITIES
// =============================================================================
/**
 * Get timezone offset in minutes
 */
function getTimezoneOffset(date = today()) {
    return date.getTimezoneOffset();
}
/**
 * Get timezone name
 */
function getTimezoneName() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
/**
 * Convert date to timezone
 */
function toTimezone(date, timezone) {
    return new Date(date.toLocaleString('en-US', { timeZone: timezone }));
}
/**
 * Convert date to UTC
 */
function toUTC(date) {
    return new Date(date.getTime() + date.getTimezoneOffset() * exports.MILLISECONDS_PER_MINUTE);
}
/**
 * Convert UTC date to local timezone
 */
function fromUTC(date) {
    return new Date(date.getTime() - date.getTimezoneOffset() * exports.MILLISECONDS_PER_MINUTE);
}
// =============================================================================
// VALIDATION UTILITIES
// =============================================================================
/**
 * Check if a value is a valid date
 */
function isValidDate(value) {
    return value instanceof Date && !isNaN(value.getTime());
}
/**
 * Check if a date string is valid
 */
function isValidDateString(dateString) {
    const date = new Date(dateString);
    return isValidDate(date);
}
/**
 * Check if a year is a leap year
 */
function isLeapYear(year) {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}
/**
 * Get number of days in a month
 */
function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
}
/**
 * Check if a date is a weekend
 */
function isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
}
/**
 * Check if a date is a weekday
 */
function isWeekday(date) {
    return !isWeekend(date);
}
// =============================================================================
// BUSINESS DAY UTILITIES
// =============================================================================
/**
 * Get the next business day
 */
function getNextBusinessDay(date) {
    let result = addDays(date, 1);
    while (isWeekend(result)) {
        result = addDays(result, 1);
    }
    return result;
}
/**
 * Get the previous business day
 */
function getPreviousBusinessDay(date) {
    let result = subtractDays(date, 1);
    while (isWeekend(result)) {
        result = subtractDays(result, 1);
    }
    return result;
}
/**
 * Add business days to a date
 */
function addBusinessDays(date, days) {
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
function subtractBusinessDays(date, days) {
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
function differenceInBusinessDays(date1, date2) {
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
function parseDuration(duration) {
    const regex = /(\d+)([dhms])/g;
    let totalMs = 0;
    let match;
    while ((match = regex.exec(duration)) !== null) {
        const value = parseInt(match[1] || '0', 10);
        const unit = match[2];
        switch (unit) {
            case 'd':
                totalMs += value * exports.MILLISECONDS_PER_DAY;
                break;
            case 'h':
                totalMs += value * exports.MILLISECONDS_PER_HOUR;
                break;
            case 'm':
                totalMs += value * exports.MILLISECONDS_PER_MINUTE;
                break;
            case 's':
                totalMs += value * exports.MILLISECONDS_PER_SECOND;
                break;
        }
    }
    return totalMs;
}
/**
 * Format duration in milliseconds to human-readable string
 */
function formatDuration(ms) {
    const absDuration = Math.abs(ms);
    const sign = ms < 0 ? '-' : '';
    const days = Math.floor(absDuration / exports.MILLISECONDS_PER_DAY);
    const hours = Math.floor((absDuration % exports.MILLISECONDS_PER_DAY) / exports.MILLISECONDS_PER_HOUR);
    const minutes = Math.floor((absDuration % exports.MILLISECONDS_PER_HOUR) / exports.MILLISECONDS_PER_MINUTE);
    const seconds = Math.floor((absDuration % exports.MILLISECONDS_PER_MINUTE) / exports.MILLISECONDS_PER_SECOND);
    const parts = [];
    if (days > 0)
        parts.push(`${days}d`);
    if (hours > 0)
        parts.push(`${hours}h`);
    if (minutes > 0)
        parts.push(`${minutes}m`);
    if (seconds > 0)
        parts.push(`${seconds}s`);
    return sign + (parts.length > 0 ? parts.join(' ') : '0s');
}
// =============================================================================
// SCHEDULING UTILITIES
// =============================================================================
/**
 * Get next occurrence of a specific time
 */
function getNextOccurrence(time) {
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
function getNextCronExecution(_cronExpression, _baseDate = today()) {
    // This is a simplified implementation
    // In a real application, you'd want to use a proper cron parser library
    throw new Error('Cron expression parsing not implemented in this utility');
}
/**
 * Check if current time is within business hours
 */
function isBusinessHours(date = today(), startHour = 9, endHour = 17) {
    if (isWeekend(date)) {
        return false;
    }
    const hour = date.getHours();
    return hour >= startHour && hour < endHour;
}
/**
 * Get next business hour
 */
function getNextBusinessHour(date = today(), startHour = 9, endHour = 17) {
    let result = new Date(date);
    while (!isBusinessHours(result, startHour, endHour)) {
        if (isWeekend(result) || result.getHours() >= endHour) {
            result = startOfDay(getNextBusinessDay(result));
            result.setHours(startHour);
        }
        else {
            result.setHours(startHour);
        }
    }
    return result;
}
//# sourceMappingURL=datetime.js.map