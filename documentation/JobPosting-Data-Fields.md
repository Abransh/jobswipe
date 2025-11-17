# JobSwipe Job Posting Data Fields

This document outlines all available data fields for job postings in the JobSwipe platform, based on the database schema and TypeScript interfaces.

## 🏗️ Core Job Information

### Basic Details
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | String | ✅ | Unique identifier (UUID) |
| `title` | String | ✅ | Job title (e.g., "Senior Software Engineer") |
| `description` | String | ✅ | Full job description |
| `requirements` | String | ❌ | Job requirements and qualifications |
| `benefits` | String | ❌ | Benefits and perks offered |

## 📊 Job Classification

### Employment Type & Level
| Field | Type | Required | Values | Description |
|-------|------|----------|---------|-------------|
| `type` | JobType | ✅ | `FULL_TIME`, `PART_TIME`, `CONTRACT`, `FREELANCE`, `INTERNSHIP`, `TEMPORARY`, `VOLUNTEER`, `APPRENTICESHIP` | Employment type |
| `level` | JobLevel | ✅ | `ENTRY`, `JUNIOR`, `MID`, `SENIOR`, `LEAD`, `PRINCIPAL`, `STAFF`, `MANAGER`, `SENIOR_MANAGER`, `DIRECTOR`, `SENIOR_DIRECTOR`, `VP`, `SVP`, `C_LEVEL`, `FOUNDER` | Experience level |
| `department` | String | ❌ | - | Department (e.g., "Engineering", "Marketing") |
| `category` | JobCategory | ✅ | `TECHNOLOGY`, `ENGINEERING`, `DESIGN`, `PRODUCT`, `MARKETING`, `SALES`, `FINANCE`, `OPERATIONS`, `HUMAN_RESOURCES`, `LEGAL`, `CUSTOMER_SUCCESS`, `DATA_SCIENCE`, `HEALTHCARE`, `EDUCATION`, `CONSULTING`, `MANUFACTURING`, `RETAIL`, `HOSPITALITY`, `MEDIA`, `NON_PROFIT` | Job category |

## 🌍 Work Arrangement & Location

### Remote Work Options
| Field | Type | Required | Values | Description |
|-------|------|----------|---------|-------------|
| `remote` | Boolean | ✅ | `true`, `false` | Whether remote work is available |
| `remoteType` | RemoteType | ✅ | `ONSITE`, `REMOTE`, `HYBRID`, `FLEXIBLE` | Type of remote arrangement |
| `timeZone` | String | ❌ | - | Required/preferred timezone |

### Location Details
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `location` | String | ❌ | General location description |
| `city` | String | ❌ | City name |
| `state` | String | ❌ | State/province |
| `country` | String | ❌ | Country |
| `coordinates` | JSON | ❌ | Lat/lng coordinates for mapping |

## 💰 Compensation

### Salary Information
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `salaryMin` | Number | ❌ | Minimum salary offered |
| `salaryMax` | Number | ❌ | Maximum salary offered |
| `currency` | String | ❌ | Currency code (default: "USD") |
| `salaryType` | SalaryType | ❌ | `HOURLY`, `DAILY`, `WEEKLY`, `MONTHLY`, `ANNUAL`, `CONTRACT` |
| `equity` | String | ❌ | Equity/stock options details |
| `bonus` | String | ❌ | Bonus structure information |

## 🎯 Requirements & Skills

### Experience & Skills
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `experienceYears` | Number | ❌ | Required years of experience |
| `skills` | String[] | ✅ | Array of required skills |
| `education` | String | ❌ | Required education level |
| `languages` | String[] | ✅ | Required programming/spoken languages |

## 🏢 Company Information

### Company Context
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `companyId` | String | ✅ | Reference to company record |
| `company` | CompanyData/String | ✅ | Company object or name string |

### Company Data Fields
| Field | Type | Description |
|-------|------|-------------|
| `company.id` | String | Company unique identifier |
| `company.name` | String | Company name |
| `company.slug` | String | URL-friendly company identifier |
| `company.description` | String | Company description |
| `company.website` | String | Company website URL |
| `company.logo` | String | Company logo URL |
| `company.industry` | String | Industry sector |
| `company.size` | CompanySize | `STARTUP`, `SMALL`, `MEDIUM`, `LARGE`, `ENTERPRISE`, `UNKNOWN` |
| `company.headquarters` | String | Company headquarters location |
| `company.country` | String | Company country |
| `company.foundedYear` | Number | Year company was founded |
| `company.employeeCount` | Number | Number of employees |
| `company.isVerified` | Boolean | Whether company is verified |
| `company.qualityScore` | Number | Algorithm-calculated quality score |

## 🔗 External Integration

### Source & Application URLs
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `externalId` | String | ❌ | ID from external job board |
| `source` | JobSource | ✅ | `MANUAL`, `LINKEDIN`, `INDEED`, `GLASSDOOR`, `ANGELLIST`, `STACKOVERFLOW`, `DICE`, `MONSTER`, `ZIPRECRUITER`, `BUILTIN`, `FLEXJOBS`, `REMOTE_CO`, `WEWORKREMOTELY`, `COMPANY_WEBSITE`, `RECRUITER_OUTREACH`, `REFERRAL`, `OTHER` |
| `sourceUrl` | String | ❌ | Original job posting URL |
| `applyUrl` | String | ❌ | Direct application URL |

## 🔍 SEO & Search

### Search Optimization
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `keywords` | String[] | ❌ | Keywords for search optimization |
| `tags` | String[] | ❌ | Internal categorization tags |

## ⭐ Quality & Verification

### Quality Metrics
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `qualityScore` | Number | ❌ | Algorithm-calculated quality score (0-100) |
| `isVerified` | Boolean | ✅ | Whether job posting is verified |
| `verifiedAt` | DateTime | ❌ | When verification was completed |

## 📈 Status & Lifecycle

### Job Status
| Field | Type | Required | Values | Description |
|-------|------|----------|---------|-------------|
| `status` | JobStatus | ✅ | `ACTIVE`, `INACTIVE`, `EXPIRED`, `FILLED`, `ON_HOLD`, `CANCELLED`, `DRAFT` | Current job status |
| `isActive` | Boolean | ✅ | Whether job is currently active |
| `isFeatured` | Boolean | ✅ | Whether job is featured/promoted |
| `isUrgent` | Boolean | ✅ | Whether job has urgent hiring needs |

## 📅 Dates & Timestamps

### Important Dates
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `postedAt` | DateTime | ❌ | When job was originally posted |
| `expiresAt` | DateTime | ❌ | When job posting expires |
| `lastScrapedAt` | DateTime | ❌ | When job was last updated from source |
| `createdAt` | DateTime | ✅ | When record was created in database |
| `updatedAt` | DateTime | ✅ | When record was last updated |

## 📊 Analytics & Metrics

### Engagement Metrics
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `viewCount` | Number | ✅ | Number of times job was viewed |
| `applicationCount` | Number | ✅ | Number of applications submitted |
| `rightSwipeCount` | Number | ✅ | Number of positive swipes (interested) |
| `leftSwipeCount` | Number | ✅ | Number of negative swipes (not interested) |

## 🔄 Related Data

### Relationship Fields
The job posting also relates to several other entities:
- **Applications**: `JobApplication[]` - All applications for this job
- **Saved Jobs**: `SavedJob[]` - Users who saved this job
- **User Swipes**: `UserJobSwipe[]` - All swipe interactions
- **Queue Items**: `ApplicationQueue[]` - Automation queue entries
- **Snapshots**: `JobSnapshot[]` - Historical snapshots
- **Resume Enhancements**: `ResumeEnhancement[]` - AI-enhanced resumes for this job

## 💡 Usage Examples

### Complete Job Data Structure
```typescript
interface JobData {
  // Core Information
  id: "uuid-string";
  title: "Senior Full Stack Engineer";
  description: "We are looking for...";
  requirements: "5+ years experience with...";
  benefits: "Health insurance, 401k, unlimited PTO...";
  
  // Classification
  type: "FULL_TIME";
  level: "SENIOR";
  department: "Engineering";
  category: "TECHNOLOGY";
  
  // Work Arrangement
  remote: true;
  remoteType: "HYBRID";
  location: "San Francisco, CA (Remote OK)";
  timeZone: "America/Los_Angeles";
  
  // Location
  city: "San Francisco";
  state: "California";
  country: "United States";
  
  // Compensation
  salaryMin: 150000;
  salaryMax: 220000;
  currency: "USD";
  salaryType: "ANNUAL";
  equity: "0.1-0.5%";
  bonus: "Performance-based bonus up to 20%";
  
  // Requirements
  experienceYears: 5;
  skills: ["React", "Node.js", "TypeScript", "PostgreSQL"];
  education: "Bachelor's degree or equivalent";
  languages: ["English"];
  
  // Company
  companyId: "company-uuid";
  company: {
    id: "company-uuid";
    name: "TechCorp Inc";
    logo: "https://example.com/logo.png";
    size: "LARGE";
    industry: "Technology";
    isVerified: true;
  };
  
  // External
  source: "COMPANY_WEBSITE";
  sourceUrl: "https://techcorp.com/careers/senior-engineer";
  applyUrl: "https://techcorp.com/apply/12345";
  
  // Quality
  qualityScore: 92.5;
  isVerified: true;
  
  // Status
  status: "ACTIVE";
  isActive: true;
  isFeatured: false;
  isUrgent: false;
  
  // Dates
  postedAt: new Date("2024-01-15");
  expiresAt: new Date("2024-02-15");
  createdAt: new Date("2024-01-15");
  updatedAt: new Date("2024-01-15");
  
  // Analytics
  viewCount: 245;
  applicationCount: 12;
  rightSwipeCount: 18;
  leftSwipeCount: 8;
}
```

This comprehensive data structure enables JobSwipe to provide rich job recommendations, detailed filtering, accurate matching, and intelligent automation for job applications.