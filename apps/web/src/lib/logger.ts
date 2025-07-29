/**
 * Simple logging utility for the JobSwipe web application
 * Provides structured logging with different levels and context
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private serviceName = 'jobswipe-web';
  private environment = process.env.NODE_ENV || 'development';

  private formatLog(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      service: this.serviceName,
      environment: this.environment,
      message,
      ...(context && { context })
    };

    return logEntry;
  }

  private shouldLog(level: LogLevel): boolean {
    // In production, only log warn and error
    if (this.environment === 'production') {
      return ['warn', 'error'].includes(level);
    }
    
    // In development, log everything except debug unless specifically enabled
    if (this.environment === 'development') {
      return process.env.DEBUG === 'true' || level !== 'debug';
    }

    return true;
  }

  debug(message: string, context?: LogContext) {
    if (this.shouldLog('debug')) {
      console.debug(JSON.stringify(this.formatLog('debug', message, context)));
    }
  }

  info(message: string, context?: LogContext) {
    if (this.shouldLog('info')) {
      console.info(JSON.stringify(this.formatLog('info', message, context)));
    }
  }

  warn(message: string, context?: LogContext) {
    if (this.shouldLog('warn')) {
      console.warn(JSON.stringify(this.formatLog('warn', message, context)));
    }
  }

  error(message: string, context?: LogContext) {
    if (this.shouldLog('error')) {
      console.error(JSON.stringify(this.formatLog('error', message, context)));
    }
  }

  // Utility method for API request logging
  logApiRequest(method: string, path: string, userId?: string, duration?: number) {
    this.info('API Request', {
      method,
      path,
      userId,
      ...(duration && { duration: `${duration}ms` })
    });
  }

  // Utility method for API error logging
  logApiError(method: string, path: string, error: unknown, userId?: string) {
    this.error('API Error', {
      method,
      path,
      userId,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error
    });
  }
}

export const logger = new Logger();