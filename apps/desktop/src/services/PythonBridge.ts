/**
 * @fileoverview Python-TypeScript Bridge Service
 * @description Robust IPC bridge for browser-use Python integration
 * @version 1.0.0
 * @author JobSwipe Team
 * @security Enterprise-grade process management and communication
 */

import { spawn, ChildProcess, SpawnOptions } from 'child_process';
import { EventEmitter } from 'events';
import { randomUUID } from 'crypto';
import path from 'path';
import fs from 'fs/promises';
import Store from 'electron-store';

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

export interface PythonBridgeConfig {
  pythonPath: string;
  browserUsePath: string;
  maxProcesses: number;
  processTimeout: number;
  idleTimeout: number;
  retryAttempts: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enableProcessPool: boolean;
}

export interface PythonProcess {
  id: string;
  process: ChildProcess;
  status: 'idle' | 'busy' | 'error' | 'terminated';
  createdAt: Date;
  lastUsed: Date;
  taskCount: number;
  memoryUsage?: number;
}

export interface PythonTask {
  id: string;
  scriptPath: string;
  args: string[];
  env?: Record<string, string>;
  timeout?: number;
  priority: 'low' | 'normal' | 'high' | 'critical';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  processId?: string;
}

export interface PythonResult {
  success: boolean;
  data?: any;
  error?: string;
  executionTime: number;
  processId: string;
  taskId: string;
  stdout: string;
  stderr: string;
  exitCode?: number;
  memoryPeak?: number;
}

export interface ProcessPoolStats {
  totalProcesses: number;
  idleProcesses: number;
  busyProcesses: number;
  errorProcesses: number;
  totalTasksExecuted: number;
  averageExecutionTime: number;
  memoryUsage: number;
  uptime: number;
}

// =============================================================================
// PYTHON BRIDGE SERVICE
// =============================================================================

export class PythonBridge extends EventEmitter {
  private config: PythonBridgeConfig;
  private store: Store;
  private processPool: Map<string, PythonProcess> = new Map();
  private taskQueue: Map<string, PythonTask> = new Map();
  private activeTasks: Map<string, PythonTask> = new Map();
  private processStats: ProcessPoolStats;
  private isInitialized = false;
  private cleanupInterval?: NodeJS.Timeout;

  constructor(config: Partial<PythonBridgeConfig> = {}) {
    super();

    // Default configuration
    this.config = {
      pythonPath: 'python3',
      browserUsePath: path.join(__dirname, '../../../../browser-use'),
      maxProcesses: 3,
      processTimeout: 300000, // 5 minutes
      idleTimeout: 60000, // 1 minute
      retryAttempts: 2,
      logLevel: 'info',
      enableProcessPool: true,
      ...config
    };

    // Persistent storage
    this.store = new Store({
      name: 'python-bridge',
      defaults: {
        stats: {
          totalProcesses: 0,
          idleProcesses: 0,
          busyProcesses: 0,
          errorProcesses: 0,
          totalTasksExecuted: 0,
          averageExecutionTime: 0,
          memoryUsage: 0,
          uptime: 0
        }
      }
    }) as any;

    this.processStats = this.store.get('stats') as ProcessPoolStats;
    this.processStats.uptime = Date.now();
  }

  // =============================================================================
  // INITIALIZATION & VALIDATION
  // =============================================================================

  /**
   * Initialize the Python bridge
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn('⚠️ Python bridge already initialized');
      return;
    }

    console.log('🌉 Initializing Python-TypeScript bridge...');

    try {
      // Validate Python installation
      await this.validatePython();

      // Validate browser-use installation  
      await this.validateBrowserUse();

      // Setup directories
      await this.setupDirectories();

      // Initialize process pool if enabled
      if (this.config.enableProcessPool) {
        await this.initializeProcessPool();
      }

      // Start cleanup monitoring
      this.startCleanupMonitoring();

      this.isInitialized = true;
      console.log('✅ Python bridge initialized successfully');
      this.emit('initialized');

    } catch (error) {
      console.error('❌ Failed to initialize Python bridge:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Validate Python installation and version
   */
  private async validatePython(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('🐍 Validating Python installation...');
      
      const python = spawn(this.config.pythonPath, ['-c', 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")']);
      
      let output = '';
      python.stdout?.on('data', (data) => {
        output += data.toString();
      });

      python.on('close', (code) => {
        if (code === 0) {
          const version = parseFloat(output.trim());
          if (version >= 3.11) {
            console.log(`✅ Python ${version} validated`);
            resolve();
          } else {
            reject(new Error(`Python 3.11+ required. Found: ${version}`));
          }
        } else {
          reject(new Error(`Python validation failed with code: ${code}`));
        }
      });

      python.on('error', (error) => {
        reject(new Error(`Python not found: ${error.message}`));
      });
    });
  }

  /**
   * Validate browser-use installation
   */
  private async validateBrowserUse(): Promise<void> {
    try {
      console.log('🔍 Validating browser-use installation...');
      
      // Check main module
      const initPath = path.join(this.config.browserUsePath, 'browser_use', '__init__.py');
      await fs.access(initPath);

      // Test import in Python
      await this.testPythonImport('browser_use');

      console.log('✅ browser-use installation validated');
    } catch (error) {
      throw new Error(`browser-use validation failed: ${error}`);
    }
  }

  /**
   * Test Python module import
   */
  private async testPythonImport(moduleName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const python = spawn(this.config.pythonPath, ['-c', `import ${moduleName}; print("OK")`], {
        cwd: this.config.browserUsePath
      });

      python.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Failed to import ${moduleName}`));
        }
      });

      python.on('error', (error) => {
        reject(new Error(`Import test failed: ${error.message}`));
      });
    });
  }

  /**
   * Setup required directories
   */
  private async setupDirectories(): Promise<void> {
    const directories = [
      path.join(__dirname, '../../../data/python-bridge'),
      path.join(__dirname, '../../../data/python-bridge/scripts'),
      path.join(__dirname, '../../../data/python-bridge/logs'),
      path.join(__dirname, '../../../data/python-bridge/temp')
    ];

    for (const dir of directories) {
      await fs.mkdir(dir, { recursive: true });
    }

    console.log('✅ Bridge directories setup completed');
  }

  // =============================================================================
  // PROCESS POOL MANAGEMENT
  // =============================================================================

  /**
   * Initialize process pool
   */
  private async initializeProcessPool(): Promise<void> {
    console.log(`🏊 Initializing process pool (max: ${this.config.maxProcesses})...`);

    // Create initial processes
    const initialProcesses = Math.min(2, this.config.maxProcesses);
    
    for (let i = 0; i < initialProcesses; i++) {
      await this.createPythonProcess();
    }

    console.log(`✅ Process pool initialized with ${this.processPool.size} processes`);
  }

  /**
   * Create a new Python process
   */
  private async createPythonProcess(): Promise<PythonProcess> {
    const processId = randomUUID();
    
    console.log(`🐍 Creating Python process: ${processId}`);

    const spawnOptions: SpawnOptions = {
      cwd: this.config.browserUsePath,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        PYTHONPATH: this.config.browserUsePath,
        PYTHONUNBUFFERED: '1'
      }
    };

    const pythonProcess = spawn(this.config.pythonPath, ['-c', 'import time; print("READY"); time.sleep(3600)'], spawnOptions);

    const processWrapper: PythonProcess = {
      id: processId,
      process: pythonProcess,
      status: 'idle',
      createdAt: new Date(),
      lastUsed: new Date(),
      taskCount: 0
    };

    // Setup process event handlers
    this.setupProcessHandlers(processWrapper);

    // Wait for ready signal
    await this.waitForProcessReady(processWrapper);

    this.processPool.set(processId, processWrapper);
    this.updateProcessStats();

    console.log(`✅ Python process created: ${processId}`);
    this.emit('process-created', processWrapper);

    return processWrapper;
  }

  /**
   * Setup event handlers for a Python process
   */
  private setupProcessHandlers(processWrapper: PythonProcess): void {
    const { process: pythonProcess, id } = processWrapper;

    pythonProcess.on('exit', (code, signal) => {
      console.log(`🔚 Process ${id} exited with code ${code}, signal ${signal}`);
      processWrapper.status = 'terminated';
      this.processPool.delete(id);
      this.updateProcessStats();
      this.emit('process-exited', { processId: id, code, signal });
    });

    pythonProcess.on('error', (error) => {
      console.error(`❌ Process ${id} error:`, error);
      processWrapper.status = 'error';
      this.emit('process-error', { processId: id, error });
    });

    // Monitor memory usage
    this.monitorProcessMemory(processWrapper);
  }

  /**
   * Wait for process ready signal
   */
  private async waitForProcessReady(processWrapper: PythonProcess): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Process ${processWrapper.id} did not become ready within timeout`));
      }, 10000);

      processWrapper.process.stdout?.once('data', (data) => {
        const output = data.toString().trim();
        if (output.includes('READY')) {
          clearTimeout(timeout);
          resolve();
        }
      });

      processWrapper.process.once('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  /**
   * Monitor process memory usage
   */
  private monitorProcessMemory(processWrapper: PythonProcess): void {
    const interval = setInterval(async () => {
      if (processWrapper.status === 'terminated') {
        clearInterval(interval);
        return;
      }

      try {
        // Get memory usage (simplified - would use process monitoring in production)
        processWrapper.memoryUsage = process.memoryUsage().heapUsed ?? undefined;
      } catch (error) {
        // Process might be terminated
        clearInterval(interval);
      }
    }, 30000); // Check every 30 seconds
  }

  // =============================================================================
  // TASK EXECUTION
  // =============================================================================

  /**
   * Execute a Python script
   */
  async executeScript(
    scriptPath: string,
    args: string[] = [],
    options: {
      env?: Record<string, string>;
      timeout?: number;
      priority?: PythonTask['priority'];
    } = {}
  ): Promise<PythonResult> {
    if (!this.isInitialized) {
      throw new Error('Python bridge not initialized');
    }

    const task: PythonTask = {
      id: randomUUID(),
      scriptPath,
      args,
      env: options.env,
      timeout: options.timeout || this.config.processTimeout,
      priority: options.priority || 'normal',
      createdAt: new Date()
    };

    console.log(`📝 Queuing task: ${task.id} (${path.basename(scriptPath)})`);
    this.taskQueue.set(task.id, task);
    this.emit('task-queued', task);

    try {
      const result = await this.executeTask(task);
      console.log(`✅ Task completed: ${task.id} (${result.executionTime}ms)`);
      return result;
    } catch (error) {
      console.error(`❌ Task failed: ${task.id}`, error);
      throw error;
    } finally {
      this.taskQueue.delete(task.id);
      this.activeTasks.delete(task.id);
    }
  }

  /**
   * Execute a task using process pool or dedicated process
   */
  private async executeTask(task: PythonTask): Promise<PythonResult> {
    const startTime = Date.now();
    task.startedAt = new Date();
    this.activeTasks.set(task.id, task);

    let processWrapper: PythonProcess;

    if (this.config.enableProcessPool) {
      processWrapper = await this.getOrCreateProcess();
    } else {
      processWrapper = await this.createDedicatedProcess(task);
    }

    try {
      processWrapper.status = 'busy';
      processWrapper.lastUsed = new Date();
      processWrapper.taskCount++;
      task.processId = processWrapper.id;

      this.updateProcessStats();
      this.emit('task-started', { task, processId: processWrapper.id });

      const result = await this.runScriptInProcess(processWrapper, task);
      
      result.executionTime = Date.now() - startTime;
      result.taskId = task.id;
      result.processId = processWrapper.id;

      this.processStats.totalTasksExecuted++;
      this.updateAverageExecutionTime(result.executionTime);
      this.updateProcessStats();

      task.completedAt = new Date();
      this.emit('task-completed', { task, result });

      return result;

    } catch (error) {
      const errorResult: PythonResult = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        executionTime: Date.now() - startTime,
        processId: processWrapper.id,
        taskId: task.id,
        stdout: '',
        stderr: error instanceof Error ? error.message : String(error)
      };

      this.emit('task-failed', { task, error: errorResult });
      throw error;

    } finally {
      processWrapper.status = 'idle';
      this.updateProcessStats();

      // Clean up dedicated process
      if (!this.config.enableProcessPool) {
        await this.terminateProcess(processWrapper.id);
      }
    }
  }

  /**
   * Get available process or create new one
   */
  private async getOrCreateProcess(): Promise<PythonProcess> {
    // Find idle process
    for (const process of this.processPool.values()) {
      if (process.status === 'idle') {
        return process;
      }
    }

    // Create new process if under limit
    if (this.processPool.size < this.config.maxProcesses) {
      return await this.createPythonProcess();
    }

    // Wait for process to become available
    return await this.waitForAvailableProcess();
  }

  /**
   * Wait for a process to become available
   */
  private async waitForAvailableProcess(): Promise<PythonProcess> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout waiting for available process'));
      }, this.config.processTimeout);

      const checkForAvailable = () => {
        for (const process of this.processPool.values()) {
          if (process.status === 'idle') {
            clearTimeout(timeout);
            resolve(process);
            return;
          }
        }
        
        // Check again in 100ms
        setTimeout(checkForAvailable, 100);
      };

      checkForAvailable();
    });
  }

  /**
   * Create dedicated process for task
   */
  private async createDedicatedProcess(task: PythonTask): Promise<PythonProcess> {
    console.log(`🔧 Creating dedicated process for task: ${task.id}`);
    return await this.createPythonProcess();
  }

  /**
   * Run script in process
   */
  private async runScriptInProcess(processWrapper: PythonProcess, task: PythonTask): Promise<PythonResult> {
    return new Promise((resolve, reject) => {
      const { process: pythonProcess } = processWrapper;
      
      // Kill existing process and create new one for script execution
      pythonProcess.kill();
      
      // Create new process for script execution
      const env = {
        ...process.env,
        PYTHONPATH: this.config.browserUsePath,
        PYTHONUNBUFFERED: '1',
        ...task.env
      };

      const scriptProcess = spawn(this.config.pythonPath, [task.scriptPath, ...task.args], {
        cwd: this.config.browserUsePath,
        env,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      scriptProcess.stdout?.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        this.emit('process-output', { processId: processWrapper.id, taskId: task.id, type: 'stdout', data: output });
      });

      scriptProcess.stderr?.on('data', (data) => {
        const output = data.toString();
        stderr += output;
        this.emit('process-output', { processId: processWrapper.id, taskId: task.id, type: 'stderr', data: output });
      });

      scriptProcess.on('close', (code) => {
        const result: PythonResult = {
          success: code === 0,
          executionTime: 0, // Will be set by caller
          processId: processWrapper.id,
          taskId: task.id,
          stdout,
          stderr,
          exitCode: code
        };

        if (code === 0) {
          // Try to parse JSON result from stdout
          try {
            const lines = stdout.split('\n');
            const jsonLine = lines.find(line => line.trim().startsWith('{'));
            if (jsonLine) {
              result.data = JSON.parse(jsonLine);
            }
          } catch (parseError) {
            // Result might not be JSON, keep as raw text
            result.data = stdout;
          }
          
          resolve(result);
        } else {
          reject(new Error(`Script failed with exit code ${code}: ${stderr}`));
        }
      });

      scriptProcess.on('error', (error) => {
        reject(new Error(`Script execution failed: ${error.message}`));
      });

      // Set timeout
      const timeout = setTimeout(() => {
        scriptProcess.kill('SIGTERM');
        setTimeout(() => {
          if (!scriptProcess.killed) {
            scriptProcess.kill('SIGKILL');
          }
        }, 5000);
        
        reject(new Error(`Script execution timed out after ${task.timeout}ms`));
      }, task.timeout);

      scriptProcess.once('close', () => {
        clearTimeout(timeout);
      });
    });
  }

  // =============================================================================
  // PROCESS MANAGEMENT
  // =============================================================================

  /**
   * Terminate a specific process
   */
  async terminateProcess(processId: string): Promise<boolean> {
    const processWrapper = this.processPool.get(processId);
    if (!processWrapper) {
      return false;
    }

    console.log(`🔚 Terminating process: ${processId}`);
    
    processWrapper.process.kill('SIGTERM');
    
    // Force kill after grace period
    setTimeout(() => {
      if (this.processPool.has(processId)) {
        processWrapper.process.kill('SIGKILL');
      }
    }, 5000);

    this.processPool.delete(processId);
    this.updateProcessStats();
    
    this.emit('process-terminated', { processId });
    return true;
  }

  /**
   * Cleanup idle processes
   */
  private cleanupIdleProcesses(): void {
    const now = Date.now();
    const idleTimeout = this.config.idleTimeout;

    for (const [processId, processWrapper] of this.processPool.entries()) {
      if (processWrapper.status === 'idle') {
        const idleTime = now - processWrapper.lastUsed.getTime();
        
        if (idleTime > idleTimeout) {
          console.log(`🧹 Cleaning up idle process: ${processId} (idle for ${idleTime}ms)`);
          this.terminateProcess(processId);
        }
      }
    }
  }

  /**
   * Start cleanup monitoring
   */
  private startCleanupMonitoring(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupIdleProcesses();
      this.updateProcessStats();
    }, 30000); // Check every 30 seconds
  }

  // =============================================================================
  // STATISTICS & MONITORING
  // =============================================================================

  /**
   * Update process statistics
   */
  private updateProcessStats(): void {
    this.processStats.totalProcesses = this.processPool.size;
    this.processStats.idleProcesses = Array.from(this.processPool.values()).filter(p => p.status === 'idle').length;
    this.processStats.busyProcesses = Array.from(this.processPool.values()).filter(p => p.status === 'busy').length;
    this.processStats.errorProcesses = Array.from(this.processPool.values()).filter(p => p.status === 'error').length;
    
    // Calculate total memory usage
    this.processStats.memoryUsage = Array.from(this.processPool.values())
      .reduce((total, p) => total + (p.memoryUsage || 0), 0);

    // Persist stats
    this.store.set('stats', this.processStats);
  }

  /**
   * Update average execution time
   */
  private updateAverageExecutionTime(executionTime: number): void {
    const totalTasks = this.processStats.totalTasksExecuted;
    const currentAvg = this.processStats.averageExecutionTime;
    
    this.processStats.averageExecutionTime = 
      (currentAvg * (totalTasks - 1) + executionTime) / totalTasks;
  }

  /**
   * Get current statistics
   */
  getStats(): ProcessPoolStats & {
    queuedTasks: number;
    activeTasks: number;
    processes: Array<{
      id: string;
      status: string;
      taskCount: number;
      memoryUsage?: number;
      uptime: number;
    }>;
  } {
    return {
      ...this.processStats,
      queuedTasks: this.taskQueue.size,
      activeTasks: this.activeTasks.size,
      processes: Array.from(this.processPool.values()).map(p => ({
        id: p.id,
        status: p.status,
        taskCount: p.taskCount,
        memoryUsage: p.memoryUsage,
        uptime: Date.now() - p.createdAt.getTime()
      }))
    };
  }

  // =============================================================================
  // CLEANUP & SHUTDOWN
  // =============================================================================

  /**
   * Shutdown the Python bridge
   */
  async shutdown(): Promise<void> {
    console.log('🔌 Shutting down Python bridge...');

    // Clear cleanup interval
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    // Terminate all processes
    const terminationPromises = Array.from(this.processPool.keys()).map(processId => 
      this.terminateProcess(processId)
    );

    await Promise.all(terminationPromises);

    // Clear maps
    this.processPool.clear();
    this.taskQueue.clear();
    this.activeTasks.clear();

    this.isInitialized = false;
    
    console.log('✅ Python bridge shutdown completed');
    this.emit('shutdown');
  }
}