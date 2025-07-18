/**
 * @fileoverview Redis session service stub for JobSwipe
 * @description Placeholder implementation for Redis session management
 * @version 1.0.0
 * @author JobSwipe Team
 */
import { AuthSource, AuthProvider, UserId, SessionId } from '../types/auth';
export interface CreateSessionInput {
    userId: UserId;
    source: AuthSource;
    provider: AuthProvider;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
}
export interface UpdateSessionInput {
    lastUsedAt?: Date;
    metadata?: Record<string, any>;
}
/**
 * Placeholder Redis session service
 * TODO: Implement actual Redis session management
 */
export declare class RedisSessionService {
    createSession(input: CreateSessionInput): Promise<SessionId>;
    updateSession(sessionId: SessionId, input: UpdateSessionInput): Promise<void>;
    revokeSession(sessionId: SessionId): Promise<void>;
    getSession(sessionId: SessionId): Promise<any>;
}
export declare const defaultRedisSessionService: RedisSessionService;
//# sourceMappingURL=redis-session-stub.service.d.ts.map