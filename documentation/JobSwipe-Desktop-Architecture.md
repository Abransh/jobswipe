# JobSwipe Desktop Application Architecture

This document explains the core components of the JobSwipe desktop automation system and how they work together to provide AI-powered job application automation.

## 🏗️ System Overview

JobSwipe Desktop is an enterprise-grade automation platform that uses AI to automatically apply to jobs on behalf of users. The system combines multiple sophisticated components for intelligent form analysis, browser automation, captcha resolution, and queue management.

## 📁 Core Components

### 1. JobSwipeAutomationEngine.ts
**Location**: `apps/desktop/src/automation/JobSwipeAutomationEngine.ts`

**Purpose**: Central orchestration hub that coordinates all automation components

**Key Features**:
- **Unified Integration**: Combines Strategy Registry, Captcha Handler, Form Analyzer, and Queue Manager
- **Performance Tracking**: Comprehensive metrics collection and analysis
- **Event-Driven**: EventEmitter-based architecture for real-time updates
- **Enterprise-Grade**: Handles failures, retries, and graceful degradation

**What It Does**:
1. Initializes and coordinates all enterprise components
2. Processes job application requests through a unified interface
3. Executes automation strategies with performance monitoring
4. Manages browser contexts and form analysis
5. Handles captcha challenges through multi-tier resolution
6. Tracks detailed metrics and analytics
7. Provides health checks and status monitoring

**Integration Points**:
- Uses `StrategyRegistry` for company-specific automation strategies
- Leverages `AdvancedCaptchaHandler` for captcha resolution
- Employs `FormAnalyzer` for intelligent form field detection
- Coordinates with `EnterpriseQueueManager` for job processing

---

### 2. AdvancedCaptchaHandler.ts
**Location**: `apps/desktop/src/captcha/AdvancedCaptchaHandler.ts`

**Purpose**: Multi-tier captcha detection and resolution system

**Key Features**:
- **AI Vision**: Uses Claude/GPT-4V for intelligent captcha solving
- **OCR Support**: Tesseract and cloud OCR services (AWS Textract, Google Vision)
- **External Services**: Integration with 2captcha, AntiCaptcha services
- **Behavioral Bypass**: Human-like mouse movements and interactions
- **Manual Fallback**: Switches to headful mode for user intervention

**Resolution Tiers** (in priority order):
1. **AI Vision** (Claude/GPT-4V) - Fastest and most intelligent
2. **OCR Recognition** (Tesseract/Cloud) - Good for text captchas
3. **External Services** (2captcha) - High success rate but costs money
4. **Behavioral Bypass** - Human-like patterns to avoid captchas
5. **Manual Intervention** - Switch to headful mode for user solving

**What It Does**:
1. Detects various captcha types (reCAPTCHA, hCaptcha, Cloudflare, etc.)
2. Applies appropriate resolution strategy based on captcha type
3. Caches successful solutions for reuse
4. Tracks performance metrics and costs
5. Handles fallback between headless and headful modes
6. Provides manual resolution interface when needed

---

### 3. ProductionConfig.ts
**Location**: `apps/desktop/src/config/ProductionConfig.ts`

**Purpose**: Centralized configuration management for all system components

**Key Features**:
- **Environment-Based**: Different configs for development/production
- **Validation**: Ensures all required settings are present
- **AI Providers**: Supports multiple AI services (Anthropic, Google, OpenAI)
- **Security Settings**: CSRF protection, rate limiting, encryption
- **Monitoring**: Performance monitoring and alerting configuration

**Configuration Sections**:
1. **AI Services**: API keys, models, and parameters for different providers
2. **Database**: Connection settings and migration configuration
3. **Queue System**: Redis configuration and performance settings
4. **Browser**: Headless/headful settings, viewport, and timeouts
5. **Security**: CSRF, rate limiting, and encryption settings
6. **Monitoring**: Health checks, metrics collection, and alerting
7. **Storage**: File paths for resumes, screenshots, and logs
8. **Integrations**: External service configurations

**What It Does**:
1. Loads environment-specific configuration from .env files
2. Validates required settings and API keys
3. Creates provider configurations for AI vision services
4. Sets up security and monitoring parameters
5. Provides configuration summaries and health status
6. Enables hot-reloading of configuration changes

---

### 4. FormAnalyzer.ts
**Location**: `apps/desktop/src/intelligence/FormAnalyzer.ts`

**Purpose**: AI-powered form field detection and intelligent data mapping

**Key Features**:
- **Semantic Analysis**: Understands field meanings through context
- **Pattern Recognition**: Uses regex patterns and contextual keywords
- **Cache System**: LRU caches for performance optimization
- **Multi-Step Forms**: Handles complex application flows
- **Validation Detection**: Identifies client-side and server-side validation

**Analysis Process**:
1. **Element Discovery**: Finds all interactive form elements
2. **Semantic Analysis**: Determines what each field represents
3. **Schema Creation**: Builds comprehensive form structure
4. **Data Mapping**: Maps user profile data to form fields
5. **Fill Plan**: Creates optimized filling strategy
6. **Execution**: Fills forms with validation and error handling

**Semantic Field Types**:
- Personal info (name, email, phone, address)
- Professional data (title, company, experience)
- Documents (resume, cover letter)
- Preferences (salary, work authorization, start date)

**What It Does**:
1. Analyzes web forms to understand their structure and requirements
2. Identifies field types through multiple analysis techniques
3. Creates intelligent mappings between user data and form fields
4. Generates optimized form-filling plans
5. Executes form filling with natural human-like timing
6. Handles validation errors and form flow navigation

---

### 5. ipcHandlers.ts
**Location**: `apps/desktop/src/main/ipcHandlers.ts`

**Purpose**: Electron IPC communication bridge between renderer and main process

**Key Features**:
- **Job Management**: Handles job retrieval and application processing
- **System Integration**: Provides access to system information and external URLs
- **Event Coordination**: Manages communication between UI and automation engine
- **Error Handling**: Comprehensive error handling and status reporting

**Handler Categories**:
1. **Job Handlers**: 
   - `jobs:get` - Retrieve available jobs
   - `jobs:apply` - Queue job applications
   - `applications:status` - Check application progress
   - `applications:list` - Get application history

2. **System Handlers**:
   - `system:info` - Get system and environment information
   - `system:openUrl` - Open external URLs
   - `system:devtools` - Toggle developer tools

3. **UI Handlers**:
   - `ui:applications` - Navigate to applications view

**What It Does**:
1. Initializes the JobSwipe automation engine on startup
2. Handles job application requests from the UI
3. Manages queue communication and status updates
4. Provides system information to the renderer process
5. Handles external URL opening and developer tool access
6. Coordinates between UI events and automation processes

---

## 🛠️ Services Directory

### BrowserUseService.ts
**Purpose**: Bridge between browser-use AI library and JobSwipe automation

**Key Features**:
- **AI-Powered**: Uses Claude for intelligent browser automation
- **Adaptive Processing**: Handles different job application types
- **Captcha Integration**: Seamless captcha detection and resolution
- **Progress Tracking**: Real-time progress updates and event emission
- **Error Classification**: Intelligent error categorization for retry strategies

**What It Does**:
1. Integrates browser-use library with JobSwipe's automation engine
2. Processes job applications using AI-guided browser automation
3. Handles navigation, form analysis, and submission
4. Manages captcha detection and resolution
5. Provides detailed progress tracking and error reporting
6. Switches between headless and headful modes as needed

### AuthService.ts
**Purpose**: Authentication and session management (currently stubbed)

**Note**: This is currently a stub implementation for compilation purposes. In a full implementation, it would handle:
- User authentication and token management
- Session persistence and refresh
- Integration with external auth providers
- Role-based access control

### QueueService.ts
**Purpose**: Queue communication and job processing coordination

**Key Features**:
- **API Integration**: Communicates with backend queue system
- **WebSocket Support**: Real-time updates and event handling
- **Job Claiming**: Competitive job claiming with other workers
- **Processing Coordination**: Manages multiple concurrent job processing
- **Status Tracking**: Comprehensive job status and progress tracking

**What It Does**:
1. Connects to backend API and WebSocket for real-time updates
2. Polls for available jobs and claims them for processing
3. Coordinates with browser automation service for job processing
4. Updates job status and results back to the server
5. Manages concurrent job processing with configurable limits
6. Handles offline scenarios and reconnection logic

### Other Services (Overview)
- **BrowserAutomationService.ts**: Core browser automation logic
- **GreenhouseService.ts**: Company-specific automation for Greenhouse ATS
- **MonitoringService.ts**: System performance and health monitoring
- **TokenStorageService.ts**: Secure token storage and management
- **VisionServiceManager.ts**: AI vision service coordination
- **WorkflowIntegrationService.ts**: Integration with external workflow systems

## 🔄 System Integration Flow

```
User Interface (Renderer)
         ↓ IPC
    ipcHandlers.ts
         ↓
JobSwipeAutomationEngine
         ↓
┌────────────────┬──────────────────┬─────────────────┐
│  FormAnalyzer  │ CaptchaHandler   │  QueueService   │
└────────────────┴──────────────────┴─────────────────┘
         ↓
  BrowserUseService
         ↓
    Browser Automation
         ↓
    Job Application Complete
```

## 🎯 Key Benefits

1. **Enterprise-Grade**: Built for scale with comprehensive error handling and monitoring
2. **AI-Powered**: Uses advanced AI for intelligent form analysis and browser automation
3. **Modular Design**: Each component can be developed, tested, and deployed independently
4. **Fault Tolerant**: Multiple fallback strategies and graceful degradation
5. **Real-Time**: Event-driven architecture with real-time progress tracking
6. **Configurable**: Extensive configuration options for different environments
7. **Secure**: Built-in security measures and compliance features

## 🚀 Development Guidelines

When working with these components:

1. **Use EventEmitter patterns** for loose coupling and real-time updates
2. **Implement comprehensive error handling** with specific error types
3. **Add performance metrics** to track system health and efficiency
4. **Use caching strategies** to optimize performance
5. **Follow the configuration pattern** established in ProductionConfig
6. **Maintain backward compatibility** when updating interfaces
7. **Add comprehensive logging** for debugging and monitoring

This architecture provides a robust foundation for enterprise-grade job application automation while maintaining flexibility for future enhancements and integrations.