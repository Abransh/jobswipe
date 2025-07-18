"use strict";
/**
 * @fileoverview Common types and interfaces for JobSwipe
 * @description Shared types used across the application
 * @version 1.0.0
 * @author JobSwipe Team
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationChannel = exports.NotificationPriority = exports.HealthStatus = exports.Status = exports.AddressSchema = exports.CoordinatesSchema = exports.DateRangeSchema = exports.SearchParamsSchema = exports.FilterParamSchema = exports.SortParamSchema = exports.PaginationParamsSchema = void 0;
const zod_1 = require("zod");
// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================
/**
 * Pagination parameters schema
 */
exports.PaginationParamsSchema = zod_1.z.object({
    page: zod_1.z.number().min(1).optional(),
    limit: zod_1.z.number().min(1).max(100).optional(),
    offset: zod_1.z.number().min(0).optional(),
    cursor: zod_1.z.string().optional(),
});
/**
 * Sort parameter schema
 */
exports.SortParamSchema = zod_1.z.object({
    field: zod_1.z.string().min(1),
    direction: zod_1.z.enum(['asc', 'desc']),
});
/**
 * Filter parameter schema
 */
exports.FilterParamSchema = zod_1.z.object({
    field: zod_1.z.string().min(1),
    operator: zod_1.z.enum(['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'nin', 'like', 'regex', 'exists', 'null', 'nnull']),
    value: zod_1.z.any(),
});
/**
 * Search parameters schema
 */
exports.SearchParamsSchema = zod_1.z.object({
    query: zod_1.z.string().optional(),
    filters: zod_1.z.array(exports.FilterParamSchema).optional(),
    sort: zod_1.z.array(exports.SortParamSchema).optional(),
    pagination: exports.PaginationParamsSchema.optional(),
});
/**
 * Date range schema
 */
exports.DateRangeSchema = zod_1.z.object({
    from: zod_1.z.date(),
    to: zod_1.z.date(),
});
/**
 * Coordinates schema
 */
exports.CoordinatesSchema = zod_1.z.object({
    latitude: zod_1.z.number().min(-90).max(90),
    longitude: zod_1.z.number().min(-180).max(180),
});
/**
 * Address schema
 */
exports.AddressSchema = zod_1.z.object({
    street: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    state: zod_1.z.string().optional(),
    country: zod_1.z.string().optional(),
    postalCode: zod_1.z.string().optional(),
    coordinates: exports.CoordinatesSchema.optional(),
});
// =============================================================================
// STATUS TYPES
// =============================================================================
/**
 * Generic status enumeration
 */
var Status;
(function (Status) {
    Status["ACTIVE"] = "active";
    Status["INACTIVE"] = "inactive";
    Status["PENDING"] = "pending";
    Status["SUSPENDED"] = "suspended";
    Status["DELETED"] = "deleted";
    Status["ARCHIVED"] = "archived";
})(Status || (exports.Status = Status = {}));
/**
 * Health check status
 */
var HealthStatus;
(function (HealthStatus) {
    HealthStatus["HEALTHY"] = "healthy";
    HealthStatus["DEGRADED"] = "degraded";
    HealthStatus["UNHEALTHY"] = "unhealthy";
    HealthStatus["UNKNOWN"] = "unknown";
})(HealthStatus || (exports.HealthStatus = HealthStatus = {}));
// =============================================================================
// NOTIFICATION TYPES
// =============================================================================
/**
 * Notification priority
 */
var NotificationPriority;
(function (NotificationPriority) {
    NotificationPriority["LOW"] = "low";
    NotificationPriority["NORMAL"] = "normal";
    NotificationPriority["HIGH"] = "high";
    NotificationPriority["URGENT"] = "urgent";
    NotificationPriority["CRITICAL"] = "critical";
})(NotificationPriority || (exports.NotificationPriority = NotificationPriority = {}));
/**
 * Notification channel
 */
var NotificationChannel;
(function (NotificationChannel) {
    NotificationChannel["EMAIL"] = "email";
    NotificationChannel["SMS"] = "sms";
    NotificationChannel["PUSH"] = "push";
    NotificationChannel["IN_APP"] = "in_app";
    NotificationChannel["SLACK"] = "slack";
    NotificationChannel["WEBHOOK"] = "webhook";
})(NotificationChannel || (exports.NotificationChannel = NotificationChannel = {}));
//# sourceMappingURL=common.js.map