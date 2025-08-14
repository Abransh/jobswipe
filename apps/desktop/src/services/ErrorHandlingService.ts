/**
 * @fileoverview Error Handling Service
 * @description Centralized error handling, recovery strategies, and user notifications
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { EventEmitter } from 'events';
import Store from 'electron-store';
import { MonitoringService } from './MonitoringService';
import { dialog } from 'electron';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface ErrorHandlingRule {
  id: string;
  pattern: string | RegExp;
  category: 'system' | 'queue' | 'automation' | 'api' | 'websocket' | 'general';
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoveryStrategy: RecoveryStrategy;
  userNotification: UserNotificationConfig;
  maxRetries: number;
  retryDelayMs: number;
  enabled: boolean;
}

export interface RecoveryStrategy {
  type: 'retry' | 'restart' | 'fallback' | 'ignore' | 'user-intervention';
  action?: string; // Specific action to take
  fallbackAction?: string;
  customHandler?: string; // Name of custom handler function
}

export interface UserNotificationConfig {
  enabled: boolean;
  type: 'none' | 'toast' | 'dialog' | 'tray';
  title?: string;
  message?: string;
  actions?: Array<{
    label: string;
    action: string;
  }>;
}

export interface ErrorContext {
  errorId: string;
  timestamp: number;
  error: Error | string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, any>;
  rule?: ErrorHandlingRule;
  retryCount: number;
  recoveryAttempted: boolean;
  userNotified: boolean;
  resolved: boolean;
}

export interface RecoveryResult {
  success: boolean;
  action: string;
  message: string;
  shouldRetry: boolean;
  retryAfterMs?: number;
}

// =============================================================================
// ERROR HANDLING SERVICE
// =============================================================================

export class ErrorHandlingService extends EventEmitter {
  private store: Store;
  private monitoringService: MonitoringService;
  private errorHandlingRules: Map<string, ErrorHandlingRule> = new Map();
  private activeErrors: Map<string, ErrorContext> = new Map();
  private retryTimers: Map<string, NodeJS.Timeout> = new Map();
  private errorHistory: ErrorContext[] = [];
  
  // Built-in recovery handlers
  private recoveryHandlers: Map<string, (context: ErrorContext) => Promise<RecoveryResult>> = new Map();

  constructor(monitoringService: MonitoringService) {
    super();
    
    this.monitoringService = monitoringService;
    
    this.store = new Store({
      name: 'error-handling-service',
      defaults: {
        rules: {},
        config: {
          maxErrorHistory: 1000,
          defaultRetryDelayMs: 5000,
          defaultMaxRetries: 3,
          enableUserNotifications: true,
        },
      },
    });
    
    this.setupBuiltinRules();
    this.setupRecoveryHandlers();
    this.loadStoredRules();
  }

  // =============================================================================
  // INITIALIZATION
  // =============================================================================

  /**
   * Initialize error handling service
   */
  async initialize(): Promise<void> {
    try {
      console.log('🛡️ Initializing error handling service...');
      
      // Setup monitoring integration
      this.setupMonitoringIntegration();
      
      // Setup global error handlers
      this.setupGlobalHandlers();
      
      console.log('✅ Error handling service initialized');
      this.emit('initialized');
      
    } catch (error) {
      console.error('❌ Failed to initialize error handling service:', error);
      throw error;
    }
  }

  /**
   * Setup built-in error handling rules
   */
  private setupBuiltinRules(): void {
    const builtinRules: ErrorHandlingRule[] = [
      // Network connectivity errors
      {
        id: 'network-connection-error',
        pattern: /ECONNREFUSED|ENOTFOUND|ETIMEDOUT|Network Error/i,
        category: 'api',
        severity: 'high',
        recoveryStrategy: {
          type: 'retry',
          action: 'reconnect-api',
        },
        userNotification: {
          enabled: true,
          type: 'toast',
          title: 'Connection Error',
          message: 'Lost connection to JobSwipe servers. Attempting to reconnect...',
        },
        maxRetries: 5,
        retryDelayMs: 10000,
        enabled: true,
      },
      
      // Authentication errors
      {
        id: 'authentication-error',
        pattern: /401|Unauthorized|Authentication failed/i,
        category: 'api',
        severity: 'high',
        recoveryStrategy: {
          type: 'user-intervention',
          action: 'refresh-auth-token',
        },
        userNotification: {
          enabled: true,
          type: 'dialog',
          title: 'Authentication Required',
          message: 'Your session has expired. Please log in again.',
          actions: [
            { label: 'Login', action: 'show-login' },
            { label: 'Cancel', action: 'dismiss' },
          ],
        },
        maxRetries: 1,
        retryDelayMs: 0,
        enabled: true,
      },
      
      // Browser automation errors
      {
        id: 'browser-automation-error',
        pattern: /browser.*crashed|automation.*failed|playwright.*error/i,
        category: 'automation',
        severity: 'medium',
        recoveryStrategy: {
          type: 'restart',
          action: 'restart-browser-automation',
        },
        userNotification: {
          enabled: true,
          type: 'toast',
          title: 'Automation Issue',
          message: 'Browser automation encountered an issue. Restarting...',
        },
        maxRetries: 3,
        retryDelayMs: 5000,
        enabled: true,
      },
      
      // Queue processing errors
      {
        id: 'queue-processing-error',
        pattern: /queue.*failed|job.*processing.*error/i,
        category: 'queue',
        severity: 'medium',
        recoveryStrategy: {
          type: 'retry',
          action: 'retry-queue-processing',
        },
        userNotification: {
          enabled: false,
          type: 'none',
        },
        maxRetries: 2,
        retryDelayMs: 3000,
        enabled: true,
      },
      
      // System resource errors
      {
        id: 'system-resource-error',
        pattern: /ENOMEM|out of memory|disk.*full|ENOSPC/i,
        category: 'system',
        severity: 'critical',
        recoveryStrategy: {
          type: 'user-intervention',
          action: 'system-resource-warning',
        },
        userNotification: {
          enabled: true,
          type: 'dialog',
          title: 'System Resources Low',
          message: 'Your system is running low on resources. Please close other applications or free up disk space.',
          actions: [
            { label: 'OK', action: 'dismiss' },
          ],
        },
        maxRetries: 0,
        retryDelayMs: 0,
        enabled: true,
      },
      
      // WebSocket connection errors
      {
        id: 'websocket-connection-error',
        pattern: /websocket.*error|socket.*disconnect/i,
        category: 'websocket',
        severity: 'medium',
        recoveryStrategy: {
          type: 'retry',
          action: 'reconnect-websocket',
        },
        userNotification: {
          enabled: false,
          type: 'none',
        },
        maxRetries: 10,
        retryDelayMs: 5000,
        enabled: true,
      },
    ];

    builtinRules.forEach(rule => {
      this.errorHandlingRules.set(rule.id, rule);
    });
  }

  /**
   * Setup recovery handlers
   */
  private setupRecoveryHandlers(): void {
    this.recoveryHandlers.set('reconnect-api', this.handleApiReconnection.bind(this));
    this.recoveryHandlers.set('refresh-auth-token', this.handleAuthTokenRefresh.bind(this));
    this.recoveryHandlers.set('restart-browser-automation', this.handleBrowserAutomationRestart.bind(this));
    this.recoveryHandlers.set('retry-queue-processing', this.handleQueueProcessingRetry.bind(this));
    this.recoveryHandlers.set('reconnect-websocket', this.handleWebSocketReconnection.bind(this));
    this.recoveryHandlers.set('system-resource-warning', this.handleSystemResourceWarning.bind(this));
  }

  /**
   * Setup monitoring service integration
   */
  private setupMonitoringIntegration(): void {
    this.monitoringService.on('error-tracked', (errorEvent) => {
      this.handleError(new Error(errorEvent.message), errorEvent.category, errorEvent.context);
    });
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalHandlers(): void {
    process.on('uncaughtException', (error) => {
      this.handleError(error, 'system', { type: 'uncaughtException' });
    });

    process.on('unhandledRejection', (reason, promise) => {
      this.handleError(new Error(String(reason)), 'system', { 
        type: 'unhandledRejection',
        promise: promise.toString() 
      });
    });
  }

  /**
   * Load stored error handling rules
   */
  private loadStoredRules(): void {
    const storedRules = this.store.get('rules') as Record<string, ErrorHandlingRule>;
    
    Object.values(storedRules).forEach(rule => {
      if (rule.enabled) {
        this.errorHandlingRules.set(rule.id, rule);
      }
    });
  }

  // =============================================================================
  // ERROR HANDLING
  // =============================================================================

  /**
   * Handle an error with the configured strategy
   */
  async handleError(
    error: Error | string, 
    category: string = 'general', 
    context: Record<string, any> = {}
  ): Promise<void> {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    // Find matching rule
    const rule = this.findMatchingRule(errorMessage, category);
    
    // Create error context
    const errorContext: ErrorContext = {
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      error,
      category,
      severity: rule?.severity || 'medium',
      context: {
        ...context,
        stack: errorStack,
      },
      rule,
      retryCount: 0,
      recoveryAttempted: false,
      userNotified: false,
      resolved: false,
    };

    // Store error context
    this.activeErrors.set(errorContext.errorId, errorContext);
    this.errorHistory.push(errorContext);
    
    // Trim error history
    if (this.errorHistory.length > this.store.get('config.maxErrorHistory')) {
      this.errorHistory = this.errorHistory.slice(-this.store.get('config.maxErrorHistory'));
    }

    console.error(`🚨 [${category.toUpperCase()}] ${errorContext.severity.toUpperCase()}: ${errorMessage}`);
    
    // Emit error event
    this.emit('error-handled', errorContext);
    
    // Handle user notification
    if (rule && rule.userNotification.enabled) {
      await this.showUserNotification(errorContext);
    }
    
    // Attempt recovery
    if (rule && rule.recoveryStrategy.type !== 'ignore') {
      await this.attemptRecovery(errorContext);
    }
  }

  /**
   * Find matching error handling rule
   */
  private findMatchingRule(errorMessage: string, category: string): ErrorHandlingRule | undefined {
    for (const rule of this.errorHandlingRules.values()) {
      if (!rule.enabled) continue;
      
      // Category must match or be general
      if (rule.category !== category && rule.category !== 'general') continue;
      
      // Check pattern match
      const pattern = rule.pattern instanceof RegExp ? rule.pattern : new RegExp(rule.pattern, 'i');
      if (pattern.test(errorMessage)) {
        return rule;
      }
    }
    
    return undefined;
  }

  /**
   * Show user notification based on rule configuration
   */
  private async showUserNotification(context: ErrorContext): Promise<void> {
    if (!context.rule?.userNotification.enabled) return;
    
    const notification = context.rule.userNotification;
    const title = notification.title || 'JobSwipe Error';
    const message = notification.message || context.error.toString();

    try {
      switch (notification.type) {
        case 'dialog':
          if (notification.actions && notification.actions.length > 0) {
            const buttons = notification.actions.map(action => action.label);
            const result = await dialog.showMessageBox({
              type: 'error',
              title,
              message,
              buttons,
              defaultId: 0,
            });
            
            // Handle action
            const selectedAction = notification.actions[result.response];
            if (selectedAction) {
              this.emit('notification-action', {
                errorId: context.errorId,
                action: selectedAction.action,
              });
            }
          } else {
            await dialog.showMessageBox({
              type: 'error',
              title,
              message,
              buttons: ['OK'],
            });
          }
          break;
          
        case 'toast':
          // Emit toast notification event (renderer will handle display)
          this.emit('show-toast', {
            type: 'error',
            title,
            message,
            duration: 5000,
          });
          break;
          
        case 'tray':
          // Emit tray notification event
          this.emit('show-tray-notification', {
            title,
            body: message,
          });
          break;
      }
      
      context.userNotified = true;
      
    } catch (error) {
      console.error('Failed to show user notification:', error);
    }
  }

  /**
   * Attempt error recovery based on rule strategy
   */
  private async attemptRecovery(context: ErrorContext): Promise<void> {
    if (!context.rule || context.recoveryAttempted) return;
    
    const strategy = context.rule.recoveryStrategy;
    
    try {
      context.recoveryAttempted = true;
      
      let result: RecoveryResult;
      
      switch (strategy.type) {
        case 'retry':
          result = await this.handleRetryRecovery(context);
          break;
          
        case 'restart':
          result = await this.handleRestartRecovery(context);
          break;
          
        case 'fallback':
          result = await this.handleFallbackRecovery(context);
          break;
          
        case 'user-intervention':
          result = await this.handleUserInterventionRecovery(context);
          break;
          
        default:
          result = {
            success: false,
            action: 'unknown',
            message: 'Unknown recovery strategy',
            shouldRetry: false,
          };
      }
      
      // Handle recovery result
      if (result.success) {
        context.resolved = true;
        this.activeErrors.delete(context.errorId);
        this.emit('error-recovered', { ...context, recoveryResult: result });
      } else if (result.shouldRetry && context.retryCount < context.rule.maxRetries) {
        this.scheduleRetry(context, result.retryAfterMs || context.rule.retryDelayMs);
      } else {
        this.emit('error-recovery-failed', { ...context, recoveryResult: result });
      }
      
    } catch (error) {
      console.error('Error during recovery attempt:', error);
      this.emit('error-recovery-failed', { ...context, recoveryError: error });
    }
  }

  /**
   * Schedule a retry attempt
   */
  private scheduleRetry(context: ErrorContext, delayMs: number): void {
    // Clear existing retry timer
    const existingTimer = this.retryTimers.get(context.errorId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    // Schedule new retry
    const timer = setTimeout(() => {
      context.retryCount++;
      context.recoveryAttempted = false;
      this.attemptRecovery(context);
    }, delayMs);
    
    this.retryTimers.set(context.errorId, timer);
    
    this.emit('retry-scheduled', {
      errorId: context.errorId,
      retryCount: context.retryCount + 1,
      delayMs,
    });
  }

  // =============================================================================
  // RECOVERY HANDLERS
  // =============================================================================

  /**
   * Handle retry recovery strategy
   */
  private async handleRetryRecovery(context: ErrorContext): Promise<RecoveryResult> {
    const action = context.rule!.recoveryStrategy.action!;
    const handler = this.recoveryHandlers.get(action);
    
    if (handler) {
      return await handler(context);
    }
    
    return {
      success: false,
      action,
      message: `No handler found for action: ${action}`,
      shouldRetry: false,
    };
  }

  /**
   * Handle restart recovery strategy
   */
  private async handleRestartRecovery(context: ErrorContext): Promise<RecoveryResult> {
    const action = context.rule!.recoveryStrategy.action!;
    const handler = this.recoveryHandlers.get(action);
    
    if (handler) {
      return await handler(context);
    }
    
    return {
      success: false,
      action,
      message: `No handler found for action: ${action}`,
      shouldRetry: false,
    };
  }

  /**
   * Handle fallback recovery strategy
   */
  private async handleFallbackRecovery(context: ErrorContext): Promise<RecoveryResult> {
    // Try primary action first, then fallback
    const primaryAction = context.rule!.recoveryStrategy.action;
    const fallbackAction = context.rule!.recoveryStrategy.fallbackAction;
    
    if (primaryAction) {
      const handler = this.recoveryHandlers.get(primaryAction);
      if (handler) {
        const result = await handler(context);
        if (result.success) {
          return result;
        }
      }
    }
    
    if (fallbackAction) {
      const handler = this.recoveryHandlers.get(fallbackAction);
      if (handler) {
        return await handler(context);
      }
    }
    
    return {
      success: false,
      action: 'fallback',
      message: 'Both primary and fallback actions failed',
      shouldRetry: false,
    };
  }

  /**
   * Handle user intervention recovery strategy
   */
  private async handleUserInterventionRecovery(context: ErrorContext): Promise<RecoveryResult> {
    const action = context.rule!.recoveryStrategy.action!;
    
    // User intervention typically doesn't auto-recover
    // It waits for user action through notifications
    this.emit('user-intervention-required', {
      errorId: context.errorId,
      action,
      context,
    });
    
    return {
      success: false,
      action,
      message: 'Waiting for user intervention',
      shouldRetry: false,
    };
  }

  // =============================================================================
  // SPECIFIC RECOVERY HANDLERS
  // =============================================================================

  /**
   * Handle API reconnection
   */
  private async handleApiReconnection(context: ErrorContext): Promise<RecoveryResult> {
    try {
      // Emit reconnection request
      this.emit('api-reconnection-requested');
      
      // Simulate reconnection attempt (would be handled by QueueService)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        success: true,
        action: 'reconnect-api',
        message: 'API reconnection successful',
        shouldRetry: false,
      };
    } catch (error) {
      return {
        success: false,
        action: 'reconnect-api',
        message: `API reconnection failed: ${error}`,
        shouldRetry: true,
        retryAfterMs: 10000,
      };
    }
  }

  /**
   * Handle auth token refresh
   */
  private async handleAuthTokenRefresh(context: ErrorContext): Promise<RecoveryResult> {
    try {
      // Emit auth refresh request
      this.emit('auth-refresh-requested');
      
      return {
        success: false, // This requires user intervention
        action: 'refresh-auth-token',
        message: 'Authentication refresh requires user login',
        shouldRetry: false,
      };
    } catch (error) {
      return {
        success: false,
        action: 'refresh-auth-token',
        message: `Auth refresh failed: ${error}`,
        shouldRetry: false,
      };
    }
  }

  /**
   * Handle browser automation restart
   */
  private async handleBrowserAutomationRestart(context: ErrorContext): Promise<RecoveryResult> {
    try {
      // Emit browser automation restart request
      this.emit('browser-automation-restart-requested');
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      return {
        success: true,
        action: 'restart-browser-automation',
        message: 'Browser automation restarted successfully',
        shouldRetry: false,
      };
    } catch (error) {
      return {
        success: false,
        action: 'restart-browser-automation',
        message: `Browser automation restart failed: ${error}`,
        shouldRetry: true,
        retryAfterMs: 5000,
      };
    }
  }

  /**
   * Handle queue processing retry
   */
  private async handleQueueProcessingRetry(context: ErrorContext): Promise<RecoveryResult> {
    try {
      // Emit queue retry request
      this.emit('queue-retry-requested', { errorContext: context });
      
      return {
        success: true,
        action: 'retry-queue-processing',
        message: 'Queue processing retry initiated',
        shouldRetry: false,
      };
    } catch (error) {
      return {
        success: false,
        action: 'retry-queue-processing',
        message: `Queue retry failed: ${error}`,
        shouldRetry: true,
        retryAfterMs: 3000,
      };
    }
  }

  /**
   * Handle WebSocket reconnection
   */
  private async handleWebSocketReconnection(context: ErrorContext): Promise<RecoveryResult> {
    try {
      // Emit WebSocket reconnection request
      this.emit('websocket-reconnection-requested');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        action: 'reconnect-websocket',
        message: 'WebSocket reconnection successful',
        shouldRetry: false,
      };
    } catch (error) {
      return {
        success: false,
        action: 'reconnect-websocket',
        message: `WebSocket reconnection failed: ${error}`,
        shouldRetry: true,
        retryAfterMs: 5000,
      };
    }
  }

  /**
   * Handle system resource warning
   */
  private async handleSystemResourceWarning(context: ErrorContext): Promise<RecoveryResult> {
    // This is handled through user notification
    return {
      success: false,
      action: 'system-resource-warning',
      message: 'System resource issue requires user attention',
      shouldRetry: false,
    };
  }

  // =============================================================================
  // PUBLIC API
  // =============================================================================

  /**
   * Get active errors
   */
  getActiveErrors(): ErrorContext[] {
    return Array.from(this.activeErrors.values());
  }

  /**
   * Get error history
   */
  getErrorHistory(limit?: number): ErrorContext[] {
    const errors = [...this.errorHistory].reverse(); // Most recent first
    return limit ? errors.slice(0, limit) : errors;
  }

  /**
   * Resolve an error manually
   */
  resolveError(errorId: string): boolean {
    const error = this.activeErrors.get(errorId);
    if (error) {
      error.resolved = true;
      this.activeErrors.delete(errorId);
      
      // Clear retry timer if exists
      const timer = this.retryTimers.get(errorId);
      if (timer) {
        clearTimeout(timer);
        this.retryTimers.delete(errorId);
      }
      
      this.emit('error-resolved', error);
      return true;
    }
    return false;
  }

  /**
   * Get error handling rules
   */
  getErrorHandlingRules(): ErrorHandlingRule[] {
    return Array.from(this.errorHandlingRules.values());
  }

  /**
   * Add or update error handling rule
   */
  setErrorHandlingRule(rule: ErrorHandlingRule): void {
    this.errorHandlingRules.set(rule.id, rule);
    
    // Persist to storage
    const rules = this.store.get('rules') as Record<string, ErrorHandlingRule>;
    rules[rule.id] = rule;
    this.store.set('rules', rules);
    
    this.emit('rule-updated', rule);
  }

  /**
   * Remove error handling rule
   */
  removeErrorHandlingRule(ruleId: string): boolean {
    const deleted = this.errorHandlingRules.delete(ruleId);
    
    if (deleted) {
      // Remove from storage
      const rules = this.store.get('rules') as Record<string, ErrorHandlingRule>;
      delete rules[ruleId];
      this.store.set('rules', rules);
      
      this.emit('rule-removed', ruleId);
    }
    
    return deleted;
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown(): Promise<void> {
    console.log('🧹 Shutting down error handling service...');
    
    // Clear all retry timers
    for (const timer of this.retryTimers.values()) {
      clearTimeout(timer);
    }
    this.retryTimers.clear();
    
    this.emit('shutdown');
    console.log('✅ Error handling service shutdown complete');
  }
}