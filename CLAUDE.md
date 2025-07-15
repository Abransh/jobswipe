# CLAUDE.md - JobSwipe Enterprise Platform Instructions

## 🎯 Project Overview

**Instructions** 
- **This is an important app for which you are the best developer, whenever you code before that you will plan first check for code security and code, you will always update the documentation or make one, the code should be well commented and easy to debug, the main goal is for the best performance, The is a big application you will always make everything work in sync, you will always work with the knowledge, using cache tokes and memory to store things compute thinj logic, oyu haveto always be logical and implement the best backend and code ever. 

**JobSwipe** is an enterprise-grade job application automation platform that combines:
- **Web/Mobile Interface**: Users swipe right on jobs (Tinder-like UX)
- **Desktop Automation**: AI-powered browser automation using browser-use library
- **Shared Database**: PostgreSQL with user profiles, resumes, and application tracking
- **Security-First**: Enterprise compliance, encryption, GDPR-ready

## 🏛️ System Architecture

### **Core Components**
```typescript
const systemComponents = {
  webApp: "Next.js 15 - Job browsing & user dashboard",
  desktopApp: "Electron - Browser automation with browser-use",
  api: "Fastify + TypeScript - Backend services",
  database: "PostgreSQL + Prisma - User data & job tracking",
  automation: "browser-use library - AI job application",
  queue: "BullMQ + Redis - Application processing"
};
```

### **Data Flow**
1. **User Action**: Swipe right on job → Web app
2. **Data Storage**: User + job data → PostgreSQL database
3. **Queue Creation**: Application task → BullMQ queue
4. **Desktop Automation**: Electron app + browser-use → Apply to job
5. **Captcha Handling**: Switch to headful mode for user interaction
6. **Status Update**: Application result → Database → User dashboard

## 🔧 Technology Stack (Enterprise Standards)

### **Backend**
- **Runtime**: Node.js 20 LTS
- **Language**: TypeScript 5.3
- **Framework**: Fastify 4.x (performance + type safety)
- **Database**: PostgreSQL 16 + Prisma ORM
- **Authentication**: JWT + refresh tokens
- **Queue**: BullMQ + Redis
- **File Storage**: AWS S3 SDK
- **Validation**: Zod schemas

### **Frontend**
- **Web**: Next.js 15 (App Router) + TypeScript
- **Desktop**: Electron 28+ + React + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand + React Query
- **Forms**: React Hook Form + Zod

### **Browser Automation**
- **Library**: browser-use (AI-powered automation)
- **Engine**: Playwright (cross-browser support)
- **Modes**: Headless (automation) + Headful (captcha solving)
- **Integration**: Wrapper service in desktop app

## 📁 Project Structure

```bash
jobswipe/
├── apps/                        # Applications
│   ├── web/                     # Next.js web application
│   ├── desktop/                 # Electron desktop app
│   ├── api/                     # Fastify backend API
│   └── mobile/                  # React Native (future)
├── packages/                    # Shared packages
│   ├── types/                   # Shared TypeScript types
│   ├── utils/                   # Shared utilities
│   ├── config/                  # Shared configuration
│   ├── database/                # Prisma schema & migrations
│   └── ui/                      # Shared UI components
├── browser-use/                 # AI browser automation library
├── docs/                        # Technical documentation
├── scripts/                     # Development & deployment
├── infrastructure/              # AWS CDK infrastructure
├── .github/workflows/           # CI/CD pipelines
├── docker-compose.yml           # Local development
├── package.json                 # Workspace configuration
└── CLAUDE.md                    # This file
```

## 🔒 Security Requirements (CRITICAL)

### **Authentication & Authorization**
```typescript
const securityRequirements = {
  authentication: "JWT with HTTP-only cookies + refresh tokens",
  authorization: "Role-based access control (RBAC)",
  sessionManagement: "Secure session handling with Redis",
  passwordSecurity: "bcrypt hashing + salt rounds"
};
```

### **Data Protection**
```typescript
const dataProtection = {
  encryption: "AES-256 for sensitive data at rest",
  transmission: "TLS 1.3 for all communications",
  database: "PostgreSQL row-level security (RLS)",
  fileStorage: "S3 bucket encryption with KMS keys",
  piiHandling: "GDPR-compliant data processing"
};
```

### **API Security**
```typescript
const apiSecurity = {
  rateLimiting: "Redis-based sliding window",
  validation: "Zod schema validation on all inputs",
  cors: "Strict CORS policy configuration",
  headers: "Security headers (HSTS, CSP, X-Frame-Options)",
  sanitization: "Input sanitization for XSS prevention"
};
```

## 📊 Database Schema

### **Core Tables**
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  profile_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Resumes table
CREATE TABLE resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  file_url VARCHAR(500) NOT NULL,
  parsed_content JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Jobs table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  job_url VARCHAR(500) NOT NULL,
  scraped_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User job swipes
CREATE TABLE user_job_swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  swiped_right BOOLEAN NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Applications
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending',
  automation_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Application queue
CREATE TABLE application_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  priority INTEGER DEFAULT 1,
  status VARCHAR(50) DEFAULT 'queued',
  scheduled_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🤖 Browser Automation Integration

### **browser-use Library Usage**
```typescript
// Desktop app integration with browser-use
import { Agent } from 'browser-use';

class JobApplicationAutomation {
  private agent: Agent;
  
  async applyToJob(jobData: JobData, userData: UserData) {
    try {
      // Initialize browser in headless mode
      this.agent = new Agent({
        task: `Apply to ${jobData.title} at ${jobData.company}`,
        llm: anthropicLLM,
        headless: true
      });
      
      // Navigate to job application page
      await this.agent.run(jobData.applicationUrl);
      
      // Fill application form
      await this.fillApplicationForm(userData);
      
      // Submit application
      await this.submitApplication();
      
    } catch (error) {
      if (this.isCaptchaError(error)) {
        // Switch to headful mode for captcha solving
        await this.handleCaptchaInHeadfulMode(jobData, userData);
      } else {
        throw error;
      }
    }
  }
  
  private async handleCaptchaInHeadfulMode(jobData: JobData, userData: UserData) {
    // Switch to headful browser
    this.agent = new Agent({
      task: `Apply to ${jobData.title} - solve captcha`,
      llm: anthropicLLM,
      headless: false
    });
    
    // Let user solve captcha manually
    await this.waitForUserCaptchaSolution();
    
    // Continue with automation
    await this.submitApplication();
  }
}
```

### **Captcha Detection & Handling**
```typescript
const captchaHandling = {
  detection: "Monitor for captcha elements in DOM",
  fallback: "Switch to headful mode when detected",
  userInteraction: "Pause automation for manual solving",
  continuation: "Resume automation after captcha solved"
};
```

## 🚀 Development Workflow

### **Getting Started**
```bash
# 1. Install dependencies
npm install

# 2. Setup environment variables
cp .env.example .env.local
# Fill in database, Redis, AWS credentials

# 3. Start local development environment
docker-compose up -d

# 4. Run database migrations
npm run db:migrate

# 5. Start all applications in development mode
npm run dev
```

### **Development Commands**
```bash
# Start all apps in development
npm run dev

# Start specific apps
npm run dev:web      # Next.js web app
npm run dev:desktop  # Electron desktop app
npm run dev:api      # Fastify API server

# Database operations
npm run db:migrate   # Run migrations
npm run db:seed      # Seed development data
npm run db:studio    # Open Prisma Studio

# Testing
npm run test         # Run all tests
npm run test:unit    # Unit tests only
npm run test:e2e     # End-to-end tests

# Building
npm run build        # Build all apps
npm run build:web    # Build web app only
npm run build:desktop # Build desktop app
```

## 🔍 Code Standards & Best Practices

### **TypeScript Standards**
```typescript
// Always use strict typing
interface JobData {
  id: string;
  title: string;
  company: string;
  applicationUrl: string;
  requirements: string[];
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
}

// Use Zod for runtime validation
const JobDataSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(255),
  company: z.string().min(1).max(255),
  applicationUrl: z.string().url(),
  requirements: z.array(z.string()),
  salary: z.object({
    min: z.number().positive(),
    max: z.number().positive(),
    currency: z.string().length(3)
  }).optional()
});
```

### **Security Coding Standards**
```typescript
// Input validation on all endpoints
app.post('/api/applications', {
  schema: {
    body: JobApplicationSchema
  }
}, async (request, reply) => {
  // Sanitize inputs
  const sanitized = sanitizeInput(request.body);
  
  // Validate user authorization
  const user = await validateUserToken(request.headers.authorization);
  
  // Process request
  const result = await createApplication(sanitized, user.id);
  
  // Return sanitized response
  reply.send(sanitizeOutput(result));
});
```

## 📋 Development Guidelines

### **When Working on Features**
1. **Security First**: Always validate inputs, sanitize outputs
2. **Type Safety**: Use TypeScript strictly, no `any` types
3. **Error Handling**: Comprehensive error handling and logging
4. **Testing**: Write tests for all business logic
5. **Documentation**: Update docs for significant changes

### **Browser Automation Guidelines**
1. **Headless by Default**: Start automation in headless mode
2. **Captcha Detection**: Monitor for captcha elements
3. **Graceful Fallback**: Switch to headful when needed
4. **User Feedback**: Provide clear status updates
5. **Rate Limiting**: Respect job site rate limits

### **Database Guidelines**
1. **Migrations**: Always use Prisma migrations
2. **Indexing**: Add indexes for query performance
3. **Security**: Use row-level security (RLS)
4. **Backup**: Automated backups in production
5. **Monitoring**: Track query performance

## 🎯 Important Decisions to Always Ask About

### **Critical Decisions Requiring User Approval**
1. **Security Changes**: Authentication, authorization, data handling
2. **Architecture Changes**: Major structural modifications
3. **Third-party Integrations**: New external services or APIs
4. **Database Schema Changes**: Major schema modifications
5. **Performance Optimizations**: Caching strategies, CDN setup
6. **Compliance Requirements**: GDPR, privacy policy changes

### **Technical Decisions to Discuss**
1. **API Design**: New endpoints or breaking changes
2. **UI/UX Changes**: Major interface modifications
3. **Automation Logic**: Job site specific automation
4. **Error Handling**: How to handle specific error scenarios
5. **Scaling Decisions**: Infrastructure and performance
6. **Testing Strategy**: Test coverage and CI/CD pipeline

---

## 🔑 Key Reminders

- **Enterprise Security**: Every feature must meet enterprise security standards
- **User Privacy**: GDPR compliance is non-negotiable
- **Performance**: System must handle millions of users and jobs
- **Reliability**: 99.9% uptime requirement for production
- **Maintainability**: Code must be maintainable by 20+ developers
- **Browser Automation**: Respect job site terms of service and rate limits

*This is a sophisticated, enterprise-grade platform. Always prioritize security, scalability, and user privacy in every decision.*