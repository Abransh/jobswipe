"use strict";
/**
 * @fileoverview Main entry point for JobSwipe shared package
 * @description Exports all shared types, utilities, and constants
 * @version 1.0.0
 * @author JobSwipe Team
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenExchangeService = exports.defaultRedisSessionService = exports.RedisSessionService = exports.needsRehash = exports.generateSecurePassword = exports.validatePassword = exports.verifyPassword = exports.hashPassword = exports.isNotEmptyValue = exports.isEmptyValue = exports.isNotEmptyString = exports.isEmptyString = exports.HASH_ALGORITHMS = exports.ENCRYPTION_ALGORITHMS = exports.SECURITY_HEADERS = exports.SUPPORTED_LANGUAGES = exports.TIME_CONSTANTS = exports.FEATURE_FLAGS = exports.SUCCESS_MESSAGES = exports.ERROR_MESSAGES = exports.REGEX_PATTERNS = exports.THEME_COLORS = exports.VALIDATION_RULES = exports.SUBSCRIPTION_PLANS = exports.APPLICATION_STATUSES = exports.JOB_TYPES = exports.NOTIFICATION_TYPES = exports.FILE_SIZE_LIMITS = exports.PAGINATION = exports.HTTP_STATUS = exports.RATE_LIMITS = exports.PASSWORD_CONFIG = exports.SESSION_CONFIG = exports.JWT_CONFIG = exports.APP_VERSION = exports.APP_NAME = void 0;
// Constants (export explicitly to avoid conflicts)
var constants_1 = require("./constants");
Object.defineProperty(exports, "APP_NAME", { enumerable: true, get: function () { return constants_1.APP_NAME; } });
Object.defineProperty(exports, "APP_VERSION", { enumerable: true, get: function () { return constants_1.APP_VERSION; } });
Object.defineProperty(exports, "JWT_CONFIG", { enumerable: true, get: function () { return constants_1.JWT_CONFIG; } });
Object.defineProperty(exports, "SESSION_CONFIG", { enumerable: true, get: function () { return constants_1.SESSION_CONFIG; } });
Object.defineProperty(exports, "PASSWORD_CONFIG", { enumerable: true, get: function () { return constants_1.PASSWORD_CONFIG; } });
Object.defineProperty(exports, "RATE_LIMITS", { enumerable: true, get: function () { return constants_1.RATE_LIMITS; } });
Object.defineProperty(exports, "HTTP_STATUS", { enumerable: true, get: function () { return constants_1.HTTP_STATUS; } });
Object.defineProperty(exports, "PAGINATION", { enumerable: true, get: function () { return constants_1.PAGINATION; } });
Object.defineProperty(exports, "FILE_SIZE_LIMITS", { enumerable: true, get: function () { return constants_1.FILE_SIZE_LIMITS; } });
Object.defineProperty(exports, "NOTIFICATION_TYPES", { enumerable: true, get: function () { return constants_1.NOTIFICATION_TYPES; } });
Object.defineProperty(exports, "JOB_TYPES", { enumerable: true, get: function () { return constants_1.JOB_TYPES; } });
Object.defineProperty(exports, "APPLICATION_STATUSES", { enumerable: true, get: function () { return constants_1.APPLICATION_STATUSES; } });
Object.defineProperty(exports, "SUBSCRIPTION_PLANS", { enumerable: true, get: function () { return constants_1.SUBSCRIPTION_PLANS; } });
Object.defineProperty(exports, "VALIDATION_RULES", { enumerable: true, get: function () { return constants_1.VALIDATION_RULES; } });
Object.defineProperty(exports, "THEME_COLORS", { enumerable: true, get: function () { return constants_1.THEME_COLORS; } });
Object.defineProperty(exports, "REGEX_PATTERNS", { enumerable: true, get: function () { return constants_1.REGEX_PATTERNS; } });
Object.defineProperty(exports, "ERROR_MESSAGES", { enumerable: true, get: function () { return constants_1.ERROR_MESSAGES; } });
Object.defineProperty(exports, "SUCCESS_MESSAGES", { enumerable: true, get: function () { return constants_1.SUCCESS_MESSAGES; } });
Object.defineProperty(exports, "FEATURE_FLAGS", { enumerable: true, get: function () { return constants_1.FEATURE_FLAGS; } });
Object.defineProperty(exports, "TIME_CONSTANTS", { enumerable: true, get: function () { return constants_1.TIME_CONSTANTS; } });
Object.defineProperty(exports, "SUPPORTED_LANGUAGES", { enumerable: true, get: function () { return constants_1.SUPPORTED_LANGUAGES; } });
Object.defineProperty(exports, "SECURITY_HEADERS", { enumerable: true, get: function () { return constants_1.SECURITY_HEADERS; } });
Object.defineProperty(exports, "ENCRYPTION_ALGORITHMS", { enumerable: true, get: function () { return constants_1.ENCRYPTION_ALGORITHMS; } });
Object.defineProperty(exports, "HASH_ALGORITHMS", { enumerable: true, get: function () { return constants_1.HASH_ALGORITHMS; } });
// Authentication types and utilities
__exportStar(require("./types/auth"), exports);
// Common types and utilities  
__exportStar(require("./types/common"), exports);
// Error handling utilities
__exportStar(require("./utils/errors"), exports);
// Date and time utilities
__exportStar(require("./utils/datetime"), exports);
// Services
__exportStar(require("./services/jwt-token.service"), exports);
__exportStar(require("./services/redis-session-stub.service"), exports);
__exportStar(require("./services/token-exchange.service"), exports);
// Security utilities
__exportStar(require("./utils/security"), exports);
// Re-export specific functions to avoid conflicts
var string_1 = require("./utils/string");
Object.defineProperty(exports, "isEmptyString", { enumerable: true, get: function () { return string_1.isEmpty; } });
Object.defineProperty(exports, "isNotEmptyString", { enumerable: true, get: function () { return string_1.isNotEmpty; } });
var validation_1 = require("./utils/validation");
Object.defineProperty(exports, "isEmptyValue", { enumerable: true, get: function () { return validation_1.isEmpty; } });
Object.defineProperty(exports, "isNotEmptyValue", { enumerable: true, get: function () { return validation_1.isNotEmpty; } });
// Password utilities (export specific functions to avoid conflicts)
var password_1 = require("./utils/password");
Object.defineProperty(exports, "hashPassword", { enumerable: true, get: function () { return password_1.hashPassword; } });
Object.defineProperty(exports, "verifyPassword", { enumerable: true, get: function () { return password_1.verifyPassword; } });
Object.defineProperty(exports, "validatePassword", { enumerable: true, get: function () { return password_1.validatePassword; } });
Object.defineProperty(exports, "generateSecurePassword", { enumerable: true, get: function () { return password_1.generateSecurePassword; } });
Object.defineProperty(exports, "needsRehash", { enumerable: true, get: function () { return password_1.needsRehash; } });
// Create explicit exports for commonly imported services
var redis_session_stub_service_1 = require("./services/redis-session-stub.service");
Object.defineProperty(exports, "RedisSessionService", { enumerable: true, get: function () { return redis_session_stub_service_1.RedisSessionService; } });
Object.defineProperty(exports, "defaultRedisSessionService", { enumerable: true, get: function () { return redis_session_stub_service_1.defaultRedisSessionService; } });
var token_exchange_service_1 = require("./services/token-exchange.service");
Object.defineProperty(exports, "TokenExchangeService", { enumerable: true, get: function () { return token_exchange_service_1.TokenExchangeService; } });
//# sourceMappingURL=index.js.map