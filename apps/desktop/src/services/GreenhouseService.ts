import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { EventEmitter } from 'events';
import { LRUCache } from 'lru-cache';

/**
 * Greenhouse API Service
 * 
 * Integrates with Greenhouse job board API to fetch job listings
 * for automated job application processing. Provides real-time job
 * data synchronization with rate limiting and caching.
 * 
 * Features:
 * - Real-time job data fetching from Greenhouse API
 * - Rate limiting to respect API quotas
 * - Intelligent caching for performance
 * - Job filtering and normalization
 * - Company-specific job board integration
 * - Error handling and retry logic
 */

export interface GreenhouseConfig {
  baseUrl?: string;
  apiKey?: string;
  rateLimitRequests?: number;
  rateLimitWindow?: number; // milliseconds
  cacheSize?: number;
  cacheTTL?: number; // milliseconds
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface GreenhouseJob {
  id: string;
  title: string;
  company: {
    name: string;
    website?: string;
    logo?: string;
  };
  department?: string;
  location: {
    name: string;
    city?: string;
    state?: string;
    country?: string;
    remote?: boolean;
  };
  description: string;
  requirements: string[];
  applicationUrl: string;
  postedDate: string;
  applicationDeadline?: string;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship' | 'temporary';
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
    period: 'hourly' | 'monthly' | 'yearly';
  };
  benefits?: string[];
  skills?: string[];
  metadata: {
    source: 'greenhouse';
    sourceId: string;
    boardToken?: string;
    applicationMethod: 'greenhouse' | 'external';
    lastUpdated: string;
  };
}

export interface JobSearchFilters {
  query?: string;
  location?: string;
  department?: string;
  employmentType?: string[];
  experienceLevel?: string[];
  remote?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  postedWithinDays?: number;
  limit?: number;
  offset?: number;
}

export interface JobSearchResult {
  jobs: GreenhouseJob[];
  totalCount: number;
  hasMore: boolean;
  filters: JobSearchFilters;
  executionTime: number;
  cached: boolean;
}

export interface GreenhouseStats {
  totalJobsFetched: number;
  apiCallsToday: number;
  cacheHitRate: number;
  averageResponseTime: number;
  lastSyncTime: string;
  rateLimitStatus: {
    remaining: number;
    resetTime: string;
  };
}

export class GreenhouseService extends EventEmitter {
  private config: GreenhouseConfig;
  private httpClient: AxiosInstance;
  private cache: LRUCache<string, any>;
  private rateLimitTracker: Map<string, number[]> = new Map();
  private stats: GreenhouseStats;
  private isInitialized = false;

  constructor(config: GreenhouseConfig = {}) {
    super();
    
    this.config = {
      baseUrl: 'https://api.greenhouse.io/v1',
      rateLimitRequests: 100,
      rateLimitWindow: 60000, // 1 minute
      cacheSize: 1000,
      cacheTTL: 300000, // 5 minutes
      timeout: 10000, // 10 seconds
      retryAttempts: 3,
      retryDelay: 1000,
      ...config
    };

    this.cache = new LRUCache({
      max: this.config.cacheSize!,
      ttl: this.config.cacheTTL!,
    });

    this.httpClient = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'User-Agent': 'JobSwipe-Desktop/1.0.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    this.stats = {
      totalJobsFetched: 0,
      apiCallsToday: 0,
      cacheHitRate: 0,
      averageResponseTime: 0,
      lastSyncTime: new Date().toISOString(),
      rateLimitStatus: {
        remaining: this.config.rateLimitRequests!,
        resetTime: new Date(Date.now() + this.config.rateLimitWindow!).toISOString(),
      },
    };

    this.setupHttpInterceptors();
  }

  /**
   * Initialize the Greenhouse service
   */
  async initialize(): Promise<void> {
    try {
      this.emit('status', { phase: 'initialization', message: 'Initializing Greenhouse API service...' });

      // Test API connectivity
      await this.testConnection();
      
      this.isInitialized = true;
      this.emit('status', { phase: 'initialization', message: 'Greenhouse service initialized successfully' });

    } catch (error) {
      this.emit('error', { phase: 'initialization', error: error.message });
      throw new Error(`Failed to initialize Greenhouse service: ${error.message}`);
    }
  }

  /**
   * Search for jobs using Greenhouse API
   */
  async searchJobs(filters: JobSearchFilters = {}): Promise<JobSearchResult> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('search', filters);

    try {
      // Check cache first
      const cachedResult = this.cache.get(cacheKey);
      if (cachedResult) {
        this.updateCacheStats(true);
        return {
          ...cachedResult,
          executionTime: Date.now() - startTime,
          cached: true,
        };
      }

      // Check rate limits
      await this.checkRateLimit();

      this.emit('search-start', { filters });

      // Fetch jobs from Greenhouse API
      const jobs = await this.fetchJobsFromAPI(filters);
      
      const result: JobSearchResult = {
        jobs,
        totalCount: jobs.length,
        hasMore: jobs.length === (filters.limit || 100),
        filters,
        executionTime: Date.now() - startTime,
        cached: false,
      };

      // Cache the result
      this.cache.set(cacheKey, result);
      this.updateCacheStats(false);

      this.stats.totalJobsFetched += jobs.length;
      this.stats.lastSyncTime = new Date().toISOString();

      this.emit('search-complete', { 
        jobCount: jobs.length, 
        executionTime: result.executionTime,
        cached: false 
      });

      return result;

    } catch (error) {
      this.emit('error', { phase: 'search', error: error.message, filters });
      throw new Error(`Job search failed: ${error.message}`);
    }
  }

  /**
   * Get job details by ID
   */
  async getJobById(jobId: string): Promise<GreenhouseJob | null> {
    const cacheKey = this.generateCacheKey('job', { id: jobId });

    try {
      // Check cache first
      const cachedJob = this.cache.get(cacheKey);
      if (cachedJob) {
        this.updateCacheStats(true);
        return cachedJob;
      }

      // Check rate limits
      await this.checkRateLimit();

      // Fetch job from API
      const response = await this.httpClient.get(`/jobs/${jobId}`);
      const job = this.normalizeJob(response.data);

      // Cache the job
      this.cache.set(cacheKey, job);
      this.updateCacheStats(false);

      return job;

    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      this.emit('error', { phase: 'get-job', error: error.message, jobId });
      throw new Error(`Failed to fetch job ${jobId}: ${error.message}`);
    }
  }

  /**
   * Get jobs by company board token
   */
  async getJobsByCompany(boardToken: string, filters: JobSearchFilters = {}): Promise<GreenhouseJob[]> {
    const cacheKey = this.generateCacheKey('company', { boardToken, ...filters });

    try {
      // Check cache first
      const cachedJobs = this.cache.get(cacheKey);
      if (cachedJobs) {
        this.updateCacheStats(true);
        return cachedJobs;
      }

      // Check rate limits
      await this.checkRateLimit();

      // Fetch jobs from company board
      const response = await this.httpClient.get(`/boards/${boardToken}/jobs`, {
        params: this.buildQueryParams(filters),
      });

      const jobs = response.data.jobs.map((job: any) => this.normalizeJob(job));

      // Cache the jobs
      this.cache.set(cacheKey, jobs);
      this.updateCacheStats(false);

      this.stats.totalJobsFetched += jobs.length;

      return jobs;

    } catch (error) {
      this.emit('error', { phase: 'company-jobs', error: error.message, boardToken });
      throw new Error(`Failed to fetch company jobs: ${error.message}`);
    }
  }

  /**
   * Sync jobs from multiple companies
   */
  async syncCompanyJobs(boardTokens: string[]): Promise<GreenhouseJob[]> {
    const allJobs: GreenhouseJob[] = [];

    try {
      this.emit('sync-start', { companyCount: boardTokens.length });

      for (const boardToken of boardTokens) {
        try {
          const jobs = await this.getJobsByCompany(boardToken);
          allJobs.push(...jobs);
          
          this.emit('sync-progress', { 
            boardToken, 
            jobCount: jobs.length,
            totalJobs: allJobs.length 
          });

          // Add delay between requests to respect rate limits
          await this.delay(500);

        } catch (error) {
          this.emit('sync-error', { boardToken, error: error.message });
          // Continue with other companies
        }
      }

      this.emit('sync-complete', { 
        totalJobs: allJobs.length,
        companiesProcessed: boardTokens.length 
      });

      return allJobs;

    } catch (error) {
      this.emit('error', { phase: 'sync', error: error.message });
      throw new Error(`Job sync failed: ${error.message}`);
    }
  }

  /**
   * Get service statistics
   */
  getStats(): GreenhouseStats {
    return {
      ...this.stats,
      cacheHitRate: this.calculateCacheHitRate(),
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.emit('cache-cleared');
  }

  /**
   * Test API connection
   */
  private async testConnection(): Promise<void> {
    try {
      // Test with a simple API call (assuming there's a boards endpoint)
      await this.httpClient.get('/boards', { timeout: 5000 });
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Invalid API key or authentication failed');
      }
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        throw new Error('Unable to connect to Greenhouse API. Check your internet connection.');
      }
      throw new Error(`API connection test failed: ${error.message}`);
    }
  }

  /**
   * Fetch jobs from Greenhouse API with filtering
   */
  private async fetchJobsFromAPI(filters: JobSearchFilters): Promise<GreenhouseJob[]> {
    const params = this.buildQueryParams(filters);
    
    try {
      const response = await this.httpClient.get('/jobs', { params });
      return response.data.jobs.map((job: any) => this.normalizeJob(job));
    } catch (error) {
      throw new Error(`API request failed: ${error.message}`);
    }
  }

  /**
   * Normalize job data from Greenhouse API format to internal format
   */
  private normalizeJob(apiJob: any): GreenhouseJob {
    return {
      id: apiJob.id.toString(),
      title: apiJob.title,
      company: {
        name: apiJob.company?.name || 'Unknown Company',
        website: apiJob.company?.website,
        logo: apiJob.company?.logo_url,
      },
      department: apiJob.departments?.[0]?.name,
      location: {
        name: apiJob.location?.name || 'Not specified',
        city: apiJob.location?.city,
        state: apiJob.location?.state,
        country: apiJob.location?.country,
        remote: apiJob.location?.name?.toLowerCase().includes('remote'),
      },
      description: apiJob.content || apiJob.description || '',
      requirements: this.extractRequirements(apiJob.content || ''),
      applicationUrl: apiJob.absolute_url,
      postedDate: apiJob.updated_at || apiJob.created_at,
      applicationDeadline: apiJob.application_deadline,
      employmentType: this.normalizeEmploymentType(apiJob.type),
      experienceLevel: this.inferExperienceLevel(apiJob.title, apiJob.content),
      salaryRange: this.extractSalaryRange(apiJob.content || ''),
      benefits: this.extractBenefits(apiJob.content || ''),
      skills: this.extractSkills(apiJob.content || ''),
      metadata: {
        source: 'greenhouse',
        sourceId: apiJob.id.toString(),
        boardToken: apiJob.board_token,
        applicationMethod: apiJob.application_url ? 'external' : 'greenhouse',
        lastUpdated: new Date().toISOString(),
      },
    };
  }

  /**
   * Build query parameters for API requests
   */
  private buildQueryParams(filters: JobSearchFilters): Record<string, any> {
    const params: Record<string, any> = {};

    if (filters.query) params.content = filters.query;
    if (filters.location) params.location = filters.location;
    if (filters.department) params.department_id = filters.department;
    if (filters.limit) params.limit = Math.min(filters.limit, 500); // API limit
    if (filters.offset) params.offset = filters.offset;

    return params;
  }

  /**
   * Generate cache key for requests
   */
  private generateCacheKey(type: string, params: any): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {} as any);
    
    return `${type}:${JSON.stringify(sortedParams)}`;
  }

  /**
   * Check and enforce rate limits
   */
  private async checkRateLimit(): Promise<void> {
    const now = Date.now();
    const windowStart = now - this.config.rateLimitWindow!;
    
    // Clean old requests
    const requests = this.rateLimitTracker.get('api') || [];
    const recentRequests = requests.filter(time => time > windowStart);
    
    if (recentRequests.length >= this.config.rateLimitRequests!) {
      const oldestRequest = Math.min(...recentRequests);
      const waitTime = oldestRequest + this.config.rateLimitWindow! - now;
      
      this.emit('rate-limit-hit', { waitTime });
      await this.delay(waitTime);
    }
    
    // Add current request
    recentRequests.push(now);
    this.rateLimitTracker.set('api', recentRequests);
    this.stats.apiCallsToday++;
  }

  /**
   * Setup HTTP interceptors for logging and error handling
   */
  private setupHttpInterceptors(): void {
    this.httpClient.interceptors.request.use(
      (config) => {
        if (this.config.apiKey) {
          config.headers.Authorization = `Bearer ${this.config.apiKey}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.httpClient.interceptors.response.use(
      (response) => {
        // Update rate limit status from headers
        if (response.headers['x-ratelimit-remaining']) {
          this.stats.rateLimitStatus.remaining = parseInt(response.headers['x-ratelimit-remaining']);
        }
        if (response.headers['x-ratelimit-reset']) {
          this.stats.rateLimitStatus.resetTime = new Date(parseInt(response.headers['x-ratelimit-reset']) * 1000).toISOString();
        }
        
        return response;
      },
      async (error) => {
        if (error.response?.status === 429) {
          // Rate limit exceeded
          const retryAfter = error.response.headers['retry-after'] || 60;
          this.emit('rate-limit-exceeded', { retryAfter });
          await this.delay(retryAfter * 1000);
          return this.httpClient.request(error.config);
        }
        
        return Promise.reject(error);
      }
    );
  }

  /**
   * Extract requirements from job description
   */
  private extractRequirements(content: string): string[] {
    const requirements: string[] = [];
    const lines = content.split('\n');
    
    let inRequirements = false;
    for (const line of lines) {
      const cleanLine = line.trim();
      
      if (cleanLine.toLowerCase().includes('requirement') || 
          cleanLine.toLowerCase().includes('qualification')) {
        inRequirements = true;
        continue;
      }
      
      if (inRequirements) {
        if (cleanLine.startsWith('•') || cleanLine.startsWith('-') || cleanLine.startsWith('*')) {
          requirements.push(cleanLine.substring(1).trim());
        } else if (cleanLine && !cleanLine.toLowerCase().includes('preferred')) {
          inRequirements = false;
        }
      }
    }
    
    return requirements.slice(0, 10); // Limit to 10 requirements
  }

  /**
   * Normalize employment type
   */
  private normalizeEmploymentType(type: string): 'full-time' | 'part-time' | 'contract' | 'internship' | 'temporary' {
    const normalized = type?.toLowerCase() || '';
    
    if (normalized.includes('part')) return 'part-time';
    if (normalized.includes('contract') || normalized.includes('freelance')) return 'contract';
    if (normalized.includes('intern')) return 'internship';
    if (normalized.includes('temp')) return 'temporary';
    
    return 'full-time';
  }

  /**
   * Infer experience level from job title and content
   */
  private inferExperienceLevel(title: string, content: string): 'entry' | 'mid' | 'senior' | 'executive' {
    const text = `${title} ${content}`.toLowerCase();
    
    if (text.includes('senior') || text.includes('lead') || text.includes('principal')) return 'senior';
    if (text.includes('executive') || text.includes('director') || text.includes('vp')) return 'executive';
    if (text.includes('junior') || text.includes('entry') || text.includes('associate')) return 'entry';
    
    return 'mid';
  }

  /**
   * Extract salary range from job content
   */
  private extractSalaryRange(content: string): { min: number; max: number; currency: string; period: 'hourly' | 'monthly' | 'yearly' } | undefined {
    const salaryPattern = /\$(\d+(?:,\d+)*)\s*-\s*\$(\d+(?:,\d+)*)\s*(hourly|monthly|yearly|annually|per year|per hour)?/i;
    const match = content.match(salaryPattern);
    
    if (match) {
      const min = parseInt(match[1].replace(/,/g, ''));
      const max = parseInt(match[2].replace(/,/g, ''));
      const period = match[3]?.toLowerCase().includes('hour') ? 'hourly' : 
                    match[3]?.toLowerCase().includes('month') ? 'monthly' : 'yearly';
      
      return { min, max, currency: 'USD', period };
    }
    
    return undefined;
  }

  /**
   * Extract benefits from job content
   */
  private extractBenefits(content: string): string[] {
    const benefits: string[] = [];
    const benefitKeywords = [
      'health insurance', 'dental', 'vision', '401k', 'retirement',
      'vacation', 'pto', 'remote work', 'flexible', 'gym membership'
    ];
    
    for (const keyword of benefitKeywords) {
      if (content.toLowerCase().includes(keyword)) {
        benefits.push(keyword);
      }
    }
    
    return benefits;
  }

  /**
   * Extract skills from job content
   */
  private extractSkills(content: string): string[] {
    const skills: string[] = [];
    const skillKeywords = [
      'javascript', 'python', 'java', 'react', 'node.js', 'aws',
      'sql', 'git', 'docker', 'kubernetes', 'typescript', 'html', 'css'
    ];
    
    for (const keyword of skillKeywords) {
      if (content.toLowerCase().includes(keyword)) {
        skills.push(keyword);
      }
    }
    
    return skills;
  }

  /**
   * Update cache statistics
   */
  private updateCacheStats(hit: boolean): void {
    // Implementation depends on how you want to track cache stats
  }

  /**
   * Calculate cache hit rate
   */
  private calculateCacheHitRate(): number {
    // Implementation depends on how you want to calculate hit rate
    return 0.85; // Placeholder
  }

  /**
   * Delay execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    this.cache.clear();
    this.rateLimitTracker.clear();
    this.isInitialized = false;
    this.emit('status', { phase: 'cleanup', message: 'Greenhouse service cleaned up' });
  }
}

export default GreenhouseService;