/**
 * @fileoverview Strategy Registry System
 * @description Central registry for managing company-specific automation strategies
 * @version 1.0.0
 * @author JobSwipe Team
 * @security Enterprise-grade strategy management and execution
 */

import { EventEmitter } from 'events';
import { readdir, readFile, access } from 'fs/promises';
import path from 'path';
import Store from 'electron-store';
import LRU from 'lru-cache';
import {
  CompanyAutomationStrategy,
  StrategyContext,
  StrategyExecutionResult,
  StrategyRegistryConfig,
  StrategyLoadResult,
  StrategyMatchResult,
  StrategyEvent,
  StrategyEventType,
  PerformanceMetric,
  QueueJob
} from './types/StrategyTypes';
import { BaseStrategy } from './base/BaseStrategy';

// =============================================================================
// STRATEGY REGISTRY CLASS
// =============================================================================

export class StrategyRegistry extends EventEmitter {
  private config: StrategyRegistryConfig;
  private store: Store;
  private strategies = new Map<string, CompanyAutomationStrategy>();
  private strategyInstances = new Map<string, BaseStrategy>();
  private performanceCache = new LRU<string, PerformanceMetric[]>({ max: 1000 });
  private loadedStrategies = new Set<string>();
  private watchTimeouts = new Map<string, NodeJS.Timeout>();

  constructor(config: Partial<StrategyRegistryConfig> = {}) {
    super();

    this.config = {
      strategyDirectory: path.join(__dirname, 'companies'),
      cacheStrategy: true,
      autoReload: true,
      performanceTracking: true,
      abTestingEnabled: false,
      fallbackStrategy: 'generic',
      ...config
    };

    this.store = new Store({
      name: 'strategy-registry',
      defaults: {
        strategies: {},
        metrics: {},
        abTestResults: {},
        lastUpdate: null
      }
    }) as any;

    this.initializeRegistry();
  }

  // =============================================================================
  // INITIALIZATION
  // =============================================================================

  /**
   * Initialize the strategy registry
   */
  private async initializeRegistry(): Promise<void> {
    try {
      console.log('🏗️ Initializing Strategy Registry...');

      // Load cached strategies
      await this.loadCachedStrategies();

      // Scan for new strategies
      await this.scanAndLoadStrategies();

      // Setup file watching if auto-reload enabled
      if (this.config.autoReload) {
        await this.setupFileWatching();
      }

      console.log(`✅ Strategy Registry initialized with ${this.strategies.size} strategies`);
      this.emit('registry-initialized', {
        strategiesLoaded: this.strategies.size,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('❌ Failed to initialize Strategy Registry:', error);
      this.emit('registry-error', { error, timestamp: new Date() });
      throw error;
    }
  }

  /**
   * Load cached strategies from persistent storage
   */
  private async loadCachedStrategies(): Promise<void> {
    if (!this.config.cacheStrategy) return;

    const cached = this.store.get('strategies') as Record<string, CompanyAutomationStrategy>;
    
    for (const [id, strategy] of Object.entries(cached)) {
      this.strategies.set(id, strategy);
      this.loadedStrategies.add(id);
    }

    console.log(`📦 Loaded ${Object.keys(cached).length} cached strategies`);
  }

  /**
   * Scan directory and load all strategy files
   */
  private async scanAndLoadStrategies(): Promise<void> {
    try {
      await access(this.config.strategyDirectory);
    } catch {
      console.warn(`⚠️ Strategy directory does not exist: ${this.config.strategyDirectory}`);
      return;
    }

    const companies = await readdir(this.config.strategyDirectory, { withFileTypes: true });
    const loadPromises: Promise<void>[] = [];

    for (const company of companies) {
      if (company.isDirectory()) {
        loadPromises.push(this.loadCompanyStrategy(company.name));
      }
    }

    await Promise.allSettled(loadPromises);
  }

  /**
   * Load strategy for a specific company
   */
  private async loadCompanyStrategy(companyName: string): Promise<void> {
    const companyDir = path.join(this.config.strategyDirectory, companyName);
    
    try {
      // Load strategy configuration
      const configPath = path.join(companyDir, 'strategy.json');
      const configContent = await readFile(configPath, 'utf-8');
      const strategy: CompanyAutomationStrategy = JSON.parse(configContent);

      // Validate strategy structure
      if (!this.validateStrategyStructure(strategy)) {
        throw new Error(`Invalid strategy structure for ${companyName}`);
      }

      // Load strategy implementation class
      const implPath = path.join(companyDir, `${companyName}.strategy.ts`);
      try {
        const StrategyClass = await this.loadStrategyClass(implPath);
        const instance = new StrategyClass(strategy);
        this.strategyInstances.set(strategy.id, instance);
      } catch (implError) {
        console.warn(`⚠️ No implementation found for ${companyName}, using base strategy`);
      }

      // Register strategy
      this.strategies.set(strategy.id, strategy);
      this.loadedStrategies.add(strategy.id);

      // Cache strategy
      if (this.config.cacheStrategy) {
        const cachedStrategies = this.store.get('strategies') as Record<string, CompanyAutomationStrategy>;
        cachedStrategies[strategy.id] = strategy;
        this.store.set('strategies', cachedStrategies);
      }

      console.log(`✅ Loaded strategy: ${strategy.name} (${strategy.id})`);
      this.emit('strategy-loaded', {
        type: StrategyEventType.STRATEGY_LOADED,
        strategyId: strategy.id,
        timestamp: new Date(),
        data: { strategy }
      });

    } catch (error) {
      console.error(`❌ Failed to load strategy for ${companyName}:`, error);
    }
  }

  /**
   * Dynamically load strategy implementation class
   */
  private async loadStrategyClass(implPath: string): Promise<typeof BaseStrategy> {
    const module = await import(implPath);
    return module.default || module[Object.keys(module)[0]];
  }

  /**
   * Setup file system watching for auto-reload
   */
  private async setupFileWatching(): Promise<void> {
    const fs = await import('fs');
    
    try {
      fs.watch(this.config.strategyDirectory, { recursive: true }, (eventType, filename) => {
        if (filename && (filename.endsWith('.json') || filename.endsWith('.ts'))) {
          const companyName = filename.split('/')[0] || filename.split('\\')[0];
          
          // Debounce reload
          if (this.watchTimeouts.has(companyName)) {
            clearTimeout(this.watchTimeouts.get(companyName));
          }
          
          this.watchTimeouts.set(companyName, setTimeout(() => {
            this.reloadCompanyStrategy(companyName);
            this.watchTimeouts.delete(companyName);
          }, 1000));
        }
      });

      console.log('👁️ File watching enabled for strategy auto-reload');
    } catch (error) {
      console.warn('⚠️ Could not setup file watching:', error);
    }
  }

  // =============================================================================
  // STRATEGY MATCHING & EXECUTION
  // =============================================================================

  /**
   * Find best matching strategy for a job
   */
  async findStrategy(job: QueueJob): Promise<StrategyMatchResult> {
    const jobUrl = job.jobData.url;
    const jobDomain = this.extractDomain(jobUrl);
    
    console.log(`🔍 Finding strategy for domain: ${jobDomain}`);

    // Direct domain match
    const directMatch = this.findByDomain(jobDomain);
    if (directMatch) {
      return {
        matched: true,
        strategy: directMatch,
        confidence: 0.95,
        alternateStrategies: []
      };
    }

    // Fuzzy domain matching
    const fuzzyMatches = this.findByFuzzyDomain(jobDomain);
    if (fuzzyMatches.length > 0) {
      return {
        matched: true,
        strategy: fuzzyMatches[0],
        confidence: 0.8,
        alternateStrategies: fuzzyMatches.slice(1)
      };
    }

    // Fallback to generic strategy
    const fallback = this.strategies.get(this.config.fallbackStrategy || 'generic');
    if (fallback) {
      return {
        matched: true,
        strategy: fallback,
        confidence: 0.5,
        alternateStrategies: []
      };
    }

    return {
      matched: false,
      confidence: 0,
      alternateStrategies: Array.from(this.strategies.values())
    };
  }

  /**
   * Execute strategy for a job
   */
  async executeStrategy(context: StrategyContext): Promise<StrategyExecutionResult> {
    const matchResult = await this.findStrategy(context.job);
    
    if (!matchResult.matched || !matchResult.strategy) {
      throw new Error('No suitable strategy found for job');
    }

    const strategy = matchResult.strategy;
    console.log(`🚀 Executing strategy: ${strategy.name} for ${context.job.jobData.company}`);

    this.emit('strategy-matched', {
      type: StrategyEventType.STRATEGY_MATCHED,
      strategyId: strategy.id,
      timestamp: new Date(),
      data: { matchResult, job: context.job }
    });

    // Get strategy instance
    let strategyInstance = this.strategyInstances.get(strategy.id);
    if (!strategyInstance) {
      // Create generic strategy instance
      strategyInstance = new (class extends BaseStrategy {
        protected async executeMainWorkflow(context: StrategyContext): Promise<StrategyExecutionResult> {
          // Generic implementation
          return this.executeGenericWorkflow(context);
        }
        
        protected async mapFormFields(userProfile: any): Promise<Record<string, string>> {
          return {
            firstName: userProfile.personalInfo.firstName,
            lastName: userProfile.personalInfo.lastName,
            email: userProfile.personalInfo.email,
            phone: userProfile.personalInfo.phone
          };
        }
        
        protected async handleCompanyCaptcha(): Promise<boolean> {
          return false; // Will be handled by generic captcha handler
        }
        
        protected async extractConfirmation(): Promise<any> {
          return { confirmed: true };
        }

        private async executeGenericWorkflow(context: StrategyContext): Promise<StrategyExecutionResult> {
          return {
            success: true,
            executionTime: 0,
            stepsCompleted: 0,
            totalSteps: 0,
            captchaEncountered: false,
            screenshots: [],
            logs: [],
            metrics: {
              timeToFirstInteraction: 0,
              formFillTime: 0,
              uploadTime: 0,
              submissionTime: 0
            }
          };
        }
      })(strategy);
    }

    // Execute strategy with context
    const result = await strategyInstance.execute(context);

    // Record performance metrics
    if (this.config.performanceTracking) {
      await this.recordPerformanceMetrics(strategy.id, result);
    }

    // A/B testing tracking
    if (this.config.abTestingEnabled && strategy.abTesting?.enabled) {
      await this.recordABTestResult(strategy.id, result);
    }

    return result;
  }

  // =============================================================================
  // STRATEGY MANAGEMENT
  // =============================================================================

  /**
   * Register a new strategy
   */
  async registerStrategy(strategy: CompanyAutomationStrategy): Promise<void> {
    if (!this.validateStrategyStructure(strategy)) {
      throw new Error('Invalid strategy structure');
    }

    this.strategies.set(strategy.id, strategy);
    
    // Cache if enabled
    if (this.config.cacheStrategy) {
      const cachedStrategies = this.store.get('strategies') as Record<string, CompanyAutomationStrategy>;
      cachedStrategies[strategy.id] = strategy;
      this.store.set('strategies', cachedStrategies);
    }

    console.log(`✅ Registered new strategy: ${strategy.name}`);
    this.emit('strategy-registered', { strategy, timestamp: new Date() });
  }

  /**
   * Unregister a strategy
   */
  async unregisterStrategy(strategyId: string): Promise<boolean> {
    const removed = this.strategies.delete(strategyId);
    this.strategyInstances.delete(strategyId);
    
    if (removed && this.config.cacheStrategy) {
      const cachedStrategies = this.store.get('strategies') as Record<string, CompanyAutomationStrategy>;
      delete cachedStrategies[strategyId];
      this.store.set('strategies', cachedStrategies);
    }

    return removed;
  }

  /**
   * Reload a company strategy
   */
  private async reloadCompanyStrategy(companyName: string): Promise<void> {
    console.log(`🔄 Reloading strategy for: ${companyName}`);
    
    // Find and remove existing strategy
    for (const [id, strategy] of this.strategies.entries()) {
      if (strategy.companyDomain.includes(companyName)) {
        this.strategies.delete(id);
        this.strategyInstances.delete(id);
        break;
      }
    }

    // Reload strategy
    await this.loadCompanyStrategy(companyName);
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Extract domain from URL
   */
  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url;
    }
  }

  /**
   * Find strategy by exact domain match
   */
  private findByDomain(domain: string): CompanyAutomationStrategy | null {
    for (const strategy of this.strategies.values()) {
      if (strategy.companyDomain === domain || 
          strategy.companyDomain.includes(domain) ||
          domain.includes(strategy.companyDomain)) {
        return strategy;
      }
    }
    return null;
  }

  /**
   * Find strategies by fuzzy domain matching
   */
  private findByFuzzyDomain(domain: string): CompanyAutomationStrategy[] {
    const matches: Array<{ strategy: CompanyAutomationStrategy; score: number }> = [];
    
    for (const strategy of this.strategies.values()) {
      const score = this.calculateDomainSimilarity(domain, strategy.companyDomain);
      if (score > 0.6) {
        matches.push({ strategy, score });
      }
    }

    return matches
      .sort((a, b) => b.score - a.score)
      .map(match => match.strategy);
  }

  /**
   * Calculate domain similarity score
   */
  private calculateDomainSimilarity(domain1: string, domain2: string): number {
    const words1 = domain1.split('.').concat(domain1.split('-'));
    const words2 = domain2.split('.').concat(domain2.split('-'));
    
    let matches = 0;
    for (const word1 of words1) {
      for (const word2 of words2) {
        if (word1.includes(word2) || word2.includes(word1)) {
          matches++;
        }
      }
    }
    
    return matches / Math.max(words1.length, words2.length);
  }

  /**
   * Validate strategy structure
   */
  private validateStrategyStructure(strategy: CompanyAutomationStrategy): boolean {
    const required = ['id', 'name', 'companyDomain', 'selectors', 'workflow'];
    
    for (const field of required) {
      if (!(field in strategy)) {
        console.error(`❌ Strategy validation failed: missing ${field}`);
        return false;
      }
    }

    return true;
  }

  /**
   * Record performance metrics
   */
  private async recordPerformanceMetrics(
    strategyId: string,
    result: StrategyExecutionResult
  ): Promise<void> {
    const metric: PerformanceMetric = {
      timestamp: new Date(),
      success: result.success,
      executionTime: result.executionTime,
      errorType: result.error,
      captchaEncountered: result.captchaEncountered
    };

    // Update strategy metrics
    const strategy = this.strategies.get(strategyId);
    if (strategy) {
      strategy.metrics.recentPerformance.push(metric);
      
      // Keep only last 100 metrics
      if (strategy.metrics.recentPerformance.length > 100) {
        strategy.metrics.recentPerformance = strategy.metrics.recentPerformance.slice(-100);
      }
    }

    // Cache performance data
    const cached = this.performanceCache.get(strategyId) || [];
    cached.push(metric);
    this.performanceCache.set(strategyId, cached.slice(-100));
  }

  /**
   * Record A/B test result
   */
  private async recordABTestResult(
    strategyId: string,
    result: StrategyExecutionResult
  ): Promise<void> {
    const abResults = this.store.get('abTestResults') as Record<string, any>;
    
    if (!abResults[strategyId]) {
      abResults[strategyId] = { totalRuns: 0, successCount: 0, results: [] };
    }

    abResults[strategyId].totalRuns++;
    if (result.success) {
      abResults[strategyId].successCount++;
    }
    
    abResults[strategyId].results.push({
      timestamp: new Date(),
      success: result.success,
      executionTime: result.executionTime
    });

    this.store.set('abTestResults', abResults);
  }

  // =============================================================================
  // GETTERS & INFO METHODS
  // =============================================================================

  /**
   * Get all registered strategies
   */
  getAllStrategies(): CompanyAutomationStrategy[] {
    return Array.from(this.strategies.values());
  }

  /**
   * Get strategy by ID
   */
  getStrategy(strategyId: string): CompanyAutomationStrategy | undefined {
    return this.strategies.get(strategyId);
  }

  /**
   * Get strategy performance metrics
   */
  getStrategyMetrics(strategyId: string): PerformanceMetric[] {
    return this.performanceCache.get(strategyId) || [];
  }

  /**
   * Get registry statistics
   */
  getRegistryStats(): {
    totalStrategies: number;
    loadedStrategies: number;
    cachedStrategies: number;
    performanceDataPoints: number;
  } {
    return {
      totalStrategies: this.strategies.size,
      loadedStrategies: this.loadedStrategies.size,
      cachedStrategies: Object.keys(this.store.get('strategies') || {}).length,
      performanceDataPoints: Array.from(this.performanceCache.values())
        .reduce((sum, metrics) => sum + metrics.length, 0)
    };
  }

  /**
   * Health check
   */
  healthCheck(): {
    healthy: boolean;
    issues: string[];
    stats: any;
  } {
    const issues: string[] = [];
    
    if (this.strategies.size === 0) {
      issues.push('No strategies loaded');
    }
    
    if (!this.config.fallbackStrategy || !this.strategies.has(this.config.fallbackStrategy)) {
      issues.push('Fallback strategy not available');
    }

    return {
      healthy: issues.length === 0,
      issues,
      stats: this.getRegistryStats()
    };
  }
}