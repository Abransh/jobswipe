
Object.defineProperty(exports, "__esModule", { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  NotFoundError,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  skip,
  Decimal,
  Debug,
  objectEnumValues,
  makeStrictEnum,
  Extensions,
  warnOnce,
  defineDmmfProperty,
  Public,
  getRuntime
} = require('./runtime/edge.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError
Prisma.PrismaClientInitializationError = PrismaClientInitializationError
Prisma.PrismaClientValidationError = PrismaClientValidationError
Prisma.NotFoundError = NotFoundError
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = sqltag
Prisma.empty = empty
Prisma.join = join
Prisma.raw = raw
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = Extensions.getExtensionContext
Prisma.defineExtension = Extensions.defineExtension

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}





/**
 * Enums
 */
exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  passwordHash: 'passwordHash',
  name: 'name',
  avatar: 'avatar',
  emailVerified: 'emailVerified',
  role: 'role',
  status: 'status',
  lastLoginAt: 'lastLoginAt',
  loginAttempts: 'loginAttempts',
  lockedUntil: 'lockedUntil',
  dataConsent: 'dataConsent',
  consentDate: 'consentDate',
  dataRetentionUntil: 'dataRetentionUntil',
  isDeleted: 'isDeleted',
  deletedAt: 'deletedAt',
  onboardingCompleted: 'onboardingCompleted',
  onboardingProgress: 'onboardingProgress',
  onboardingStep: 'onboardingStep',
  onboardingStartedAt: 'onboardingStartedAt',
  onboardingCompletedAt: 'onboardingCompletedAt',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  timezone: 'timezone',
  locale: 'locale',
  oauthProviders: 'oauthProviders',
  primaryAuthProvider: 'primaryAuthProvider',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RelationLoadStrategy = {
  query: 'query',
  join: 'join'
};

exports.Prisma.UserProfileScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  firstName: 'firstName',
  lastName: 'lastName',
  displayName: 'displayName',
  phone: 'phone',
  dateOfBirth: 'dateOfBirth',
  gender: 'gender',
  address: 'address',
  city: 'city',
  state: 'state',
  country: 'country',
  postalCode: 'postalCode',
  location: 'location',
  website: 'website',
  linkedin: 'linkedin',
  github: 'github',
  portfolio: 'portfolio',
  blog: 'blog',
  bio: 'bio',
  headline: 'headline',
  summary: 'summary',
  currentTitle: 'currentTitle',
  currentCompany: 'currentCompany',
  experienceLevel: 'experienceLevel',
  yearsOfExperience: 'yearsOfExperience',
  skills: 'skills',
  certifications: 'certifications',
  languages: 'languages',
  education: 'education',
  desiredJobTypes: 'desiredJobTypes',
  desiredSalaryMin: 'desiredSalaryMin',
  desiredSalaryMax: 'desiredSalaryMax',
  preferredCurrency: 'preferredCurrency',
  willingToRelocate: 'willingToRelocate',
  needsVisaSponsorship: 'needsVisaSponsorship',
  profileVisibility: 'profileVisibility',
  showEmail: 'showEmail',
  showPhone: 'showPhone',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  automationPreferences: 'automationPreferences',
  coverLetterTemplate: 'coverLetterTemplate',
  workAuthorization: 'workAuthorization'
};

exports.Prisma.UserPreferencesScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  jobSearchRadius: 'jobSearchRadius',
  jobTypes: 'jobTypes',
  experienceLevels: 'experienceLevels',
  industries: 'industries',
  companyTypes: 'companyTypes',
  remotePref: 'remotePref',
  emailNotifications: 'emailNotifications',
  pushNotifications: 'pushNotifications',
  smsNotifications: 'smsNotifications',
  newJobMatches: 'newJobMatches',
  applicationUpdates: 'applicationUpdates',
  interviewReminders: 'interviewReminders',
  weeklyDigest: 'weeklyDigest',
  promotionalEmails: 'promotionalEmails',
  autoApplyEnabled: 'autoApplyEnabled',
  autoApplyJobTypes: 'autoApplyJobTypes',
  autoApplyMaxPerDay: 'autoApplyMaxPerDay',
  autoApplyRequireMatch: 'autoApplyRequireMatch',
  dataProcessingConsent: 'dataProcessingConsent',
  marketingConsent: 'marketingConsent',
  analyticsConsent: 'analyticsConsent',
  thirdPartySharing: 'thirdPartySharing',
  theme: 'theme',
  language: 'language',
  timezone: 'timezone',
  dateFormat: 'dateFormat',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AccountScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  provider: 'provider',
  providerAccountId: 'providerAccountId',
  refresh_token: 'refresh_token',
  access_token: 'access_token',
  expires_at: 'expires_at',
  token_type: 'token_type',
  scope: 'scope',
  id_token: 'id_token',
  session_state: 'session_state'
};

exports.Prisma.SessionScalarFieldEnum = {
  id: 'id',
  sessionToken: 'sessionToken',
  userId: 'userId',
  expires: 'expires'
};

exports.Prisma.VerificationTokenScalarFieldEnum = {
  identifier: 'identifier',
  token: 'token',
  expires: 'expires'
};

exports.Prisma.OAuthStateScalarFieldEnum = {
  id: 'id',
  state: 'state',
  codeVerifier: 'codeVerifier',
  provider: 'provider',
  redirectUri: 'redirectUri',
  source: 'source',
  metadata: 'metadata',
  createdAt: 'createdAt',
  expiresAt: 'expiresAt'
};

exports.Prisma.UserJobSwipeScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  jobPostingId: 'jobPostingId',
  direction: 'direction',
  confidence: 'confidence',
  deviceType: 'deviceType',
  sessionId: 'sessionId',
  position: 'position',
  timeSpent: 'timeSpent',
  matchScore: 'matchScore',
  matchFactors: 'matchFactors',
  userFeedback: 'userFeedback',
  isCorrectMatch: 'isCorrectMatch',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  location: 'location',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ApplicationQueueScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  jobPostingId: 'jobPostingId',
  applicationId: 'applicationId',
  status: 'status',
  priority: 'priority',
  attempts: 'attempts',
  maxAttempts: 'maxAttempts',
  scheduledAt: 'scheduledAt',
  startedAt: 'startedAt',
  completedAt: 'completedAt',
  failedAt: 'failedAt',
  nextRetryAt: 'nextRetryAt',
  useCustomResume: 'useCustomResume',
  resumeId: 'resumeId',
  coverLetter: 'coverLetter',
  customFields: 'customFields',
  automationConfig: 'automationConfig',
  requiresCaptcha: 'requiresCaptcha',
  captchaSolved: 'captchaSolved',
  success: 'success',
  errorMessage: 'errorMessage',
  errorType: 'errorType',
  responseData: 'responseData',
  desktopSessionId: 'desktopSessionId',
  claimedBy: 'claimedBy',
  claimedAt: 'claimedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AutomationLogScalarFieldEnum = {
  id: 'id',
  queueId: 'queueId',
  level: 'level',
  message: 'message',
  details: 'details',
  step: 'step',
  elementSelector: 'elementSelector',
  action: 'action',
  errorType: 'errorType',
  stackTrace: 'stackTrace',
  screenshot: 'screenshot',
  executionTime: 'executionTime',
  memoryUsage: 'memoryUsage',
  browserInfo: 'browserInfo',
  pageUrl: 'pageUrl',
  createdAt: 'createdAt'
};

exports.Prisma.AutomationProxyScalarFieldEnum = {
  id: 'id',
  host: 'host',
  port: 'port',
  username: 'username',
  password: 'password',
  proxyType: 'proxyType',
  provider: 'provider',
  country: 'country',
  region: 'region',
  isActive: 'isActive',
  failureCount: 'failureCount',
  successRate: 'successRate',
  lastUsedAt: 'lastUsedAt',
  lastCheckedAt: 'lastCheckedAt',
  requestsPerHour: 'requestsPerHour',
  dailyLimit: 'dailyLimit',
  currentHourlyUsage: 'currentHourlyUsage',
  currentDailyUsage: 'currentDailyUsage',
  avgResponseTime: 'avgResponseTime',
  uptime: 'uptime',
  costPerRequest: 'costPerRequest',
  monthlyLimit: 'monthlyLimit',
  notes: 'notes',
  tags: 'tags',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AuditLogScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  actorType: 'actorType',
  actorId: 'actorId',
  action: 'action',
  resource: 'resource',
  resourceId: 'resourceId',
  method: 'method',
  endpoint: 'endpoint',
  statusCode: 'statusCode',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  sessionId: 'sessionId',
  oldValues: 'oldValues',
  newValues: 'newValues',
  riskLevel: 'riskLevel',
  riskFactors: 'riskFactors',
  dataCategory: 'dataCategory',
  legalBasis: 'legalBasis',
  metadata: 'metadata',
  tags: 'tags',
  createdAt: 'createdAt'
};

exports.Prisma.AnalyticsEventScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  eventType: 'eventType',
  eventCategory: 'eventCategory',
  eventName: 'eventName',
  properties: 'properties',
  traits: 'traits',
  sessionId: 'sessionId',
  deviceType: 'deviceType',
  platform: 'platform',
  ipAddress: 'ipAddress',
  country: 'country',
  region: 'region',
  city: 'city',
  userAgent: 'userAgent',
  referrer: 'referrer',
  pageUrl: 'pageUrl',
  revenue: 'revenue',
  currency: 'currency',
  timestamp: 'timestamp',
  processingTime: 'processingTime',
  createdAt: 'createdAt'
};

exports.Prisma.UserNotificationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  title: 'title',
  message: 'message',
  actionUrl: 'actionUrl',
  channel: 'channel',
  priority: 'priority',
  status: 'status',
  readAt: 'readAt',
  clickedAt: 'clickedAt',
  sentAt: 'sentAt',
  deliveredAt: 'deliveredAt',
  failedAt: 'failedAt',
  errorMessage: 'errorMessage',
  metadata: 'metadata',
  templateId: 'templateId',
  scheduledFor: 'scheduledFor',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SystemSettingScalarFieldEnum = {
  id: 'id',
  key: 'key',
  value: 'value',
  type: 'type',
  category: 'category',
  description: 'description',
  isPublic: 'isPublic',
  isEncrypted: 'isEncrypted',
  validationRule: 'validationRule',
  defaultValue: 'defaultValue',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  updatedBy: 'updatedBy'
};

exports.Prisma.NotificationTemplateScalarFieldEnum = {
  id: 'id',
  name: 'name',
  type: 'type',
  subject: 'subject',
  title: 'title',
  body: 'body',
  htmlBody: 'htmlBody',
  channel: 'channel',
  isActive: 'isActive',
  variables: 'variables',
  conditions: 'conditions',
  category: 'category',
  tags: 'tags',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CompanyScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  description: 'description',
  website: 'website',
  logo: 'logo',
  industry: 'industry',
  size: 'size',
  headquarters: 'headquarters',
  locations: 'locations',
  country: 'country',
  foundedYear: 'foundedYear',
  employeeCount: 'employeeCount',
  revenue: 'revenue',
  fundingStage: 'fundingStage',
  linkedinUrl: 'linkedinUrl',
  glassdoorUrl: 'glassdoorUrl',
  crunchbaseUrl: 'crunchbaseUrl',
  twitterUrl: 'twitterUrl',
  facebookUrl: 'facebookUrl',
  benefits: 'benefits',
  cultureValues: 'cultureValues',
  workEnvironment: 'workEnvironment',
  isVerified: 'isVerified',
  verifiedAt: 'verifiedAt',
  verificationSource: 'verificationSource',
  qualityScore: 'qualityScore',
  keywords: 'keywords',
  tags: 'tags',
  status: 'status',
  isBlacklisted: 'isBlacklisted',
  blacklistReason: 'blacklistReason',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CompanyReviewScalarFieldEnum = {
  id: 'id',
  companyId: 'companyId',
  userId: 'userId',
  title: 'title',
  content: 'content',
  rating: 'rating',
  workLifeBalance: 'workLifeBalance',
  compensation: 'compensation',
  culture: 'culture',
  management: 'management',
  careerGrowth: 'careerGrowth',
  jobTitle: 'jobTitle',
  department: 'department',
  employmentType: 'employmentType',
  workDuration: 'workDuration',
  isApproved: 'isApproved',
  isAnonymous: 'isAnonymous',
  isVerified: 'isVerified',
  helpfulVotes: 'helpfulVotes',
  reportCount: 'reportCount',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.JobPostingScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  requirements: 'requirements',
  benefits: 'benefits',
  type: 'type',
  level: 'level',
  department: 'department',
  category: 'category',
  remote: 'remote',
  remoteType: 'remoteType',
  location: 'location',
  timeZone: 'timeZone',
  city: 'city',
  state: 'state',
  country: 'country',
  coordinates: 'coordinates',
  salaryMin: 'salaryMin',
  salaryMax: 'salaryMax',
  currency: 'currency',
  salaryType: 'salaryType',
  equity: 'equity',
  bonus: 'bonus',
  experienceYears: 'experienceYears',
  skills: 'skills',
  education: 'education',
  languages: 'languages',
  companyId: 'companyId',
  externalId: 'externalId',
  source: 'source',
  sourceUrl: 'sourceUrl',
  applyUrl: 'applyUrl',
  keywords: 'keywords',
  tags: 'tags',
  qualityScore: 'qualityScore',
  isVerified: 'isVerified',
  verifiedAt: 'verifiedAt',
  status: 'status',
  isActive: 'isActive',
  isFeatured: 'isFeatured',
  isUrgent: 'isUrgent',
  postedAt: 'postedAt',
  expiresAt: 'expiresAt',
  lastScrapedAt: 'lastScrapedAt',
  viewCount: 'viewCount',
  applicationCount: 'applicationCount',
  rightSwipeCount: 'rightSwipeCount',
  leftSwipeCount: 'leftSwipeCount',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  greenhouseCompanyId: 'greenhouseCompanyId',
  greenhouseJobId: 'greenhouseJobId',
  applicationSchema: 'applicationSchema',
  formMetadata: 'formMetadata',
  automationFeasibility: 'automationFeasibility',
  estimatedSuccessRate: 'estimatedSuccessRate',
  prefilledFieldCount: 'prefilledFieldCount',
  aiRequiredFieldCount: 'aiRequiredFieldCount',
  totalRequiredFields: 'totalRequiredFields',
  lastSchemaUpdate: 'lastSchemaUpdate',
  schemaVersion: 'schemaVersion'
};

exports.Prisma.JobSnapshotScalarFieldEnum = {
  id: 'id',
  originalJobId: 'originalJobId',
  applicationQueueId: 'applicationQueueId',
  title: 'title',
  description: 'description',
  requirements: 'requirements',
  benefits: 'benefits',
  type: 'type',
  level: 'level',
  department: 'department',
  category: 'category',
  remote: 'remote',
  remoteType: 'remoteType',
  location: 'location',
  timeZone: 'timeZone',
  city: 'city',
  state: 'state',
  country: 'country',
  coordinates: 'coordinates',
  salaryMin: 'salaryMin',
  salaryMax: 'salaryMax',
  currency: 'currency',
  salaryType: 'salaryType',
  equity: 'equity',
  bonus: 'bonus',
  experienceYears: 'experienceYears',
  skills: 'skills',
  education: 'education',
  languages: 'languages',
  companyName: 'companyName',
  companyLogo: 'companyLogo',
  companyWebsite: 'companyWebsite',
  companyIndustry: 'companyIndustry',
  companySize: 'companySize',
  companyDescription: 'companyDescription',
  externalId: 'externalId',
  source: 'source',
  sourceUrl: 'sourceUrl',
  applyUrl: 'applyUrl',
  qualityScore: 'qualityScore',
  isVerified: 'isVerified',
  originalStatus: 'originalStatus',
  isActive: 'isActive',
  isFeatured: 'isFeatured',
  isUrgent: 'isUrgent',
  originalPostedAt: 'originalPostedAt',
  originalExpiresAt: 'originalExpiresAt',
  viewCount: 'viewCount',
  applicationCount: 'applicationCount',
  rightSwipeCount: 'rightSwipeCount',
  leftSwipeCount: 'leftSwipeCount',
  snapshotVersion: 'snapshotVersion',
  snapshotReason: 'snapshotReason',
  createdAt: 'createdAt'
};

exports.Prisma.ResumeTemplateScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  category: 'category',
  content: 'content',
  sections: 'sections',
  styling: 'styling',
  preview: 'preview',
  thumbnails: 'thumbnails',
  industry: 'industry',
  experience: 'experience',
  jobTypes: 'jobTypes',
  qualityScore: 'qualityScore',
  downloads: 'downloads',
  ratings: 'ratings',
  ratingCount: 'ratingCount',
  isActive: 'isActive',
  isPremium: 'isPremium',
  isPublic: 'isPublic',
  tags: 'tags',
  keywords: 'keywords',
  usageCount: 'usageCount',
  successRate: 'successRate',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  createdBy: 'createdBy'
};

exports.Prisma.ResumeScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  templateId: 'templateId',
  name: 'name',
  title: 'title',
  content: 'content',
  sections: 'sections',
  metadata: 'metadata',
  pdfUrl: 'pdfUrl',
  docxUrl: 'docxUrl',
  htmlUrl: 'htmlUrl',
  fileSize: 'fileSize',
  pageCount: 'pageCount',
  lastGenerated: 'lastGenerated',
  version: 'version',
  parentResumeId: 'parentResumeId',
  isDefault: 'isDefault',
  visibility: 'visibility',
  shareToken: 'shareToken',
  viewCount: 'viewCount',
  downloadCount: 'downloadCount',
  applicationCount: 'applicationCount',
  aiEnhanced: 'aiEnhanced',
  enhancementData: 'enhancementData',
  completeness: 'completeness',
  readabilityScore: 'readabilityScore',
  keywordMatch: 'keywordMatch',
  s3Key: 's3Key',
  s3Bucket: 's3Bucket',
  s3Region: 's3Region',
  originalFileName: 'originalFileName',
  processingStatus: 'processingStatus',
  processingError: 'processingError',
  lastParsedAt: 'lastParsedAt',
  rawText: 'rawText',
  markdownContent: 'markdownContent',
  hasRMSMetadata: 'hasRMSMetadata',
  rmsVersion: 'rmsVersion',
  rmsSchemaUrl: 'rmsSchemaUrl',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ResumeEnhancementScalarFieldEnum = {
  id: 'id',
  resumeId: 'resumeId',
  templateId: 'templateId',
  jobPostingId: 'jobPostingId',
  type: 'type',
  description: 'description',
  originalContent: 'originalContent',
  enhancedContent: 'enhancedContent',
  changes: 'changes',
  aiModel: 'aiModel',
  prompt: 'prompt',
  confidence: 'confidence',
  isApplied: 'isApplied',
  appliedAt: 'appliedAt',
  improvedMatch: 'improvedMatch',
  successRate: 'successRate',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.JobApplicationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  jobPostingId: 'jobPostingId',
  resumeId: 'resumeId',
  status: 'status',
  priority: 'priority',
  source: 'source',
  coverLetter: 'coverLetter',
  customFields: 'customFields',
  notes: 'notes',
  customResume: 'customResume',
  resumeVersion: 'resumeVersion',
  appliedAt: 'appliedAt',
  viewedAt: 'viewedAt',
  responseAt: 'responseAt',
  interviewAt: 'interviewAt',
  followUpAt: 'followUpAt',
  rejectedAt: 'rejectedAt',
  acceptedAt: 'acceptedAt',
  externalId: 'externalId',
  atsUrl: 'atsUrl',
  confirmationNumber: 'confirmationNumber',
  automationStatus: 'automationStatus',
  automationAttempts: 'automationAttempts',
  automationData: 'automationData',
  lastAutomationAt: 'lastAutomationAt',
  lastContactAt: 'lastContactAt',
  contactMethod: 'contactMethod',
  recruiterName: 'recruiterName',
  recruiterEmail: 'recruiterEmail',
  recruiterPhone: 'recruiterPhone',
  responseTime: 'responseTime',
  interviewCount: 'interviewCount',
  matchScore: 'matchScore',
  appliedVia: 'appliedVia',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  automationLogs: 'automationLogs',
  executionMode: 'executionMode',
  proxyUsed: 'proxyUsed',
  serverIpAddress: 'serverIpAddress'
};

exports.Prisma.ApplicationInteractionScalarFieldEnum = {
  id: 'id',
  applicationId: 'applicationId',
  type: 'type',
  title: 'title',
  description: 'description',
  outcome: 'outcome',
  contactPerson: 'contactPerson',
  contactEmail: 'contactEmail',
  contactPhone: 'contactPhone',
  contactRole: 'contactRole',
  medium: 'medium',
  location: 'location',
  duration: 'duration',
  scheduledAt: 'scheduledAt',
  startedAt: 'startedAt',
  completedAt: 'completedAt',
  rescheduledFrom: 'rescheduledFrom',
  agenda: 'agenda',
  notes: 'notes',
  feedback: 'feedback',
  nextSteps: 'nextSteps',
  attachments: 'attachments',
  requiresFollowUp: 'requiresFollowUp',
  followUpDate: 'followUpDate',
  followUpCompleted: 'followUpCompleted',
  metadata: 'metadata',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SavedJobScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  jobPostingId: 'jobPostingId',
  folder: 'folder',
  notes: 'notes',
  tags: 'tags',
  priority: 'priority',
  alertOnUpdate: 'alertOnUpdate',
  alertOnDeadline: 'alertOnDeadline',
  reminderDate: 'reminderDate',
  savedReason: 'savedReason',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SubscriptionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  plan: 'plan',
  status: 'status',
  stripeCustomerId: 'stripeCustomerId',
  stripeSubscriptionId: 'stripeSubscriptionId',
  stripePriceId: 'stripePriceId',
  stripeProductId: 'stripeProductId',
  currentPeriodStart: 'currentPeriodStart',
  currentPeriodEnd: 'currentPeriodEnd',
  cancelAtPeriodEnd: 'cancelAtPeriodEnd',
  canceledAt: 'canceledAt',
  cancelReason: 'cancelReason',
  trialStart: 'trialStart',
  trialEnd: 'trialEnd',
  trialUsed: 'trialUsed',
  monthlyApplications: 'monthlyApplications',
  resumeTemplates: 'resumeTemplates',
  prioritySupport: 'prioritySupport',
  lastPaymentAt: 'lastPaymentAt',
  lastPaymentAmount: 'lastPaymentAmount',
  nextBillingDate: 'nextBillingDate',
  promoCode: 'promoCode',
  discountPercent: 'discountPercent',
  discountEndsAt: 'discountEndsAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BillingHistoryScalarFieldEnum = {
  id: 'id',
  subscriptionId: 'subscriptionId',
  amount: 'amount',
  currency: 'currency',
  status: 'status',
  stripeInvoiceId: 'stripeInvoiceId',
  stripePaymentIntentId: 'stripePaymentIntentId',
  description: 'description',
  invoiceUrl: 'invoiceUrl',
  periodStart: 'periodStart',
  periodEnd: 'periodEnd',
  metadata: 'metadata',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UsageRecordScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  subscriptionId: 'subscriptionId',
  feature: 'feature',
  count: 'count',
  metadata: 'metadata',
  sessionId: 'sessionId',
  deviceType: 'deviceType',
  ipAddress: 'ipAddress',
  date: 'date',
  hour: 'hour',
  createdAt: 'createdAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.UserOrderByRelevanceFieldEnum = {
  id: 'id',
  email: 'email',
  passwordHash: 'passwordHash',
  name: 'name',
  avatar: 'avatar',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  timezone: 'timezone',
  locale: 'locale',
  oauthProviders: 'oauthProviders',
  primaryAuthProvider: 'primaryAuthProvider'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};

exports.Prisma.UserProfileOrderByRelevanceFieldEnum = {
  id: 'id',
  userId: 'userId',
  firstName: 'firstName',
  lastName: 'lastName',
  displayName: 'displayName',
  phone: 'phone',
  gender: 'gender',
  address: 'address',
  city: 'city',
  state: 'state',
  country: 'country',
  postalCode: 'postalCode',
  location: 'location',
  website: 'website',
  linkedin: 'linkedin',
  github: 'github',
  portfolio: 'portfolio',
  blog: 'blog',
  bio: 'bio',
  headline: 'headline',
  summary: 'summary',
  currentTitle: 'currentTitle',
  currentCompany: 'currentCompany',
  experienceLevel: 'experienceLevel',
  skills: 'skills',
  desiredJobTypes: 'desiredJobTypes',
  preferredCurrency: 'preferredCurrency',
  coverLetterTemplate: 'coverLetterTemplate',
  workAuthorization: 'workAuthorization'
};

exports.Prisma.UserPreferencesOrderByRelevanceFieldEnum = {
  id: 'id',
  userId: 'userId',
  jobTypes: 'jobTypes',
  experienceLevels: 'experienceLevels',
  industries: 'industries',
  companyTypes: 'companyTypes',
  autoApplyJobTypes: 'autoApplyJobTypes',
  theme: 'theme',
  language: 'language',
  timezone: 'timezone',
  dateFormat: 'dateFormat'
};

exports.Prisma.AccountOrderByRelevanceFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  provider: 'provider',
  providerAccountId: 'providerAccountId',
  refresh_token: 'refresh_token',
  access_token: 'access_token',
  token_type: 'token_type',
  scope: 'scope',
  id_token: 'id_token',
  session_state: 'session_state'
};

exports.Prisma.SessionOrderByRelevanceFieldEnum = {
  id: 'id',
  sessionToken: 'sessionToken',
  userId: 'userId'
};

exports.Prisma.VerificationTokenOrderByRelevanceFieldEnum = {
  identifier: 'identifier',
  token: 'token'
};

exports.Prisma.OAuthStateOrderByRelevanceFieldEnum = {
  id: 'id',
  state: 'state',
  codeVerifier: 'codeVerifier',
  provider: 'provider',
  redirectUri: 'redirectUri',
  source: 'source'
};

exports.Prisma.UserJobSwipeOrderByRelevanceFieldEnum = {
  id: 'id',
  userId: 'userId',
  jobPostingId: 'jobPostingId',
  deviceType: 'deviceType',
  sessionId: 'sessionId',
  userFeedback: 'userFeedback',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  location: 'location'
};

exports.Prisma.ApplicationQueueOrderByRelevanceFieldEnum = {
  id: 'id',
  userId: 'userId',
  jobPostingId: 'jobPostingId',
  applicationId: 'applicationId',
  resumeId: 'resumeId',
  coverLetter: 'coverLetter',
  errorMessage: 'errorMessage',
  errorType: 'errorType',
  desktopSessionId: 'desktopSessionId',
  claimedBy: 'claimedBy'
};

exports.Prisma.AutomationLogOrderByRelevanceFieldEnum = {
  id: 'id',
  queueId: 'queueId',
  message: 'message',
  step: 'step',
  elementSelector: 'elementSelector',
  action: 'action',
  errorType: 'errorType',
  stackTrace: 'stackTrace',
  screenshot: 'screenshot',
  pageUrl: 'pageUrl'
};

exports.Prisma.AutomationProxyOrderByRelevanceFieldEnum = {
  id: 'id',
  host: 'host',
  username: 'username',
  password: 'password',
  provider: 'provider',
  country: 'country',
  region: 'region',
  notes: 'notes',
  tags: 'tags'
};

exports.Prisma.AuditLogOrderByRelevanceFieldEnum = {
  id: 'id',
  userId: 'userId',
  actorId: 'actorId',
  action: 'action',
  resource: 'resource',
  resourceId: 'resourceId',
  method: 'method',
  endpoint: 'endpoint',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  sessionId: 'sessionId',
  riskFactors: 'riskFactors',
  dataCategory: 'dataCategory',
  legalBasis: 'legalBasis',
  tags: 'tags'
};

exports.Prisma.AnalyticsEventOrderByRelevanceFieldEnum = {
  id: 'id',
  userId: 'userId',
  eventType: 'eventType',
  eventCategory: 'eventCategory',
  eventName: 'eventName',
  sessionId: 'sessionId',
  deviceType: 'deviceType',
  platform: 'platform',
  ipAddress: 'ipAddress',
  country: 'country',
  region: 'region',
  city: 'city',
  userAgent: 'userAgent',
  referrer: 'referrer',
  pageUrl: 'pageUrl',
  currency: 'currency'
};

exports.Prisma.UserNotificationOrderByRelevanceFieldEnum = {
  id: 'id',
  userId: 'userId',
  title: 'title',
  message: 'message',
  actionUrl: 'actionUrl',
  errorMessage: 'errorMessage',
  templateId: 'templateId'
};

exports.Prisma.SystemSettingOrderByRelevanceFieldEnum = {
  id: 'id',
  key: 'key',
  value: 'value',
  category: 'category',
  description: 'description',
  validationRule: 'validationRule',
  defaultValue: 'defaultValue',
  updatedBy: 'updatedBy'
};

exports.Prisma.NotificationTemplateOrderByRelevanceFieldEnum = {
  id: 'id',
  name: 'name',
  subject: 'subject',
  title: 'title',
  body: 'body',
  htmlBody: 'htmlBody',
  category: 'category',
  tags: 'tags'
};

exports.Prisma.CompanyOrderByRelevanceFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  description: 'description',
  website: 'website',
  logo: 'logo',
  industry: 'industry',
  headquarters: 'headquarters',
  country: 'country',
  revenue: 'revenue',
  fundingStage: 'fundingStage',
  linkedinUrl: 'linkedinUrl',
  glassdoorUrl: 'glassdoorUrl',
  crunchbaseUrl: 'crunchbaseUrl',
  twitterUrl: 'twitterUrl',
  facebookUrl: 'facebookUrl',
  cultureValues: 'cultureValues',
  verificationSource: 'verificationSource',
  keywords: 'keywords',
  tags: 'tags',
  blacklistReason: 'blacklistReason'
};

exports.Prisma.CompanyReviewOrderByRelevanceFieldEnum = {
  id: 'id',
  companyId: 'companyId',
  userId: 'userId',
  title: 'title',
  content: 'content',
  jobTitle: 'jobTitle',
  department: 'department',
  workDuration: 'workDuration'
};

exports.Prisma.JobPostingOrderByRelevanceFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  requirements: 'requirements',
  benefits: 'benefits',
  department: 'department',
  location: 'location',
  timeZone: 'timeZone',
  city: 'city',
  state: 'state',
  country: 'country',
  currency: 'currency',
  equity: 'equity',
  bonus: 'bonus',
  skills: 'skills',
  education: 'education',
  languages: 'languages',
  companyId: 'companyId',
  externalId: 'externalId',
  sourceUrl: 'sourceUrl',
  applyUrl: 'applyUrl',
  keywords: 'keywords',
  tags: 'tags',
  greenhouseCompanyId: 'greenhouseCompanyId',
  greenhouseJobId: 'greenhouseJobId',
  automationFeasibility: 'automationFeasibility',
  schemaVersion: 'schemaVersion'
};

exports.Prisma.JobSnapshotOrderByRelevanceFieldEnum = {
  id: 'id',
  originalJobId: 'originalJobId',
  applicationQueueId: 'applicationQueueId',
  title: 'title',
  description: 'description',
  requirements: 'requirements',
  benefits: 'benefits',
  type: 'type',
  level: 'level',
  department: 'department',
  category: 'category',
  remoteType: 'remoteType',
  location: 'location',
  timeZone: 'timeZone',
  city: 'city',
  state: 'state',
  country: 'country',
  currency: 'currency',
  salaryType: 'salaryType',
  equity: 'equity',
  bonus: 'bonus',
  skills: 'skills',
  education: 'education',
  languages: 'languages',
  companyName: 'companyName',
  companyLogo: 'companyLogo',
  companyWebsite: 'companyWebsite',
  companyIndustry: 'companyIndustry',
  companySize: 'companySize',
  companyDescription: 'companyDescription',
  externalId: 'externalId',
  source: 'source',
  sourceUrl: 'sourceUrl',
  applyUrl: 'applyUrl',
  originalStatus: 'originalStatus',
  snapshotVersion: 'snapshotVersion',
  snapshotReason: 'snapshotReason'
};

exports.Prisma.ResumeTemplateOrderByRelevanceFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  preview: 'preview',
  industry: 'industry',
  experience: 'experience',
  jobTypes: 'jobTypes',
  tags: 'tags',
  keywords: 'keywords',
  createdBy: 'createdBy'
};

exports.Prisma.ResumeOrderByRelevanceFieldEnum = {
  id: 'id',
  userId: 'userId',
  templateId: 'templateId',
  name: 'name',
  title: 'title',
  pdfUrl: 'pdfUrl',
  docxUrl: 'docxUrl',
  htmlUrl: 'htmlUrl',
  parentResumeId: 'parentResumeId',
  shareToken: 'shareToken',
  s3Key: 's3Key',
  s3Bucket: 's3Bucket',
  s3Region: 's3Region',
  originalFileName: 'originalFileName',
  processingError: 'processingError',
  rawText: 'rawText',
  markdownContent: 'markdownContent',
  rmsVersion: 'rmsVersion',
  rmsSchemaUrl: 'rmsSchemaUrl'
};

exports.Prisma.ResumeEnhancementOrderByRelevanceFieldEnum = {
  id: 'id',
  resumeId: 'resumeId',
  templateId: 'templateId',
  jobPostingId: 'jobPostingId',
  description: 'description',
  aiModel: 'aiModel',
  prompt: 'prompt'
};

exports.Prisma.JobApplicationOrderByRelevanceFieldEnum = {
  id: 'id',
  userId: 'userId',
  jobPostingId: 'jobPostingId',
  resumeId: 'resumeId',
  coverLetter: 'coverLetter',
  notes: 'notes',
  resumeVersion: 'resumeVersion',
  externalId: 'externalId',
  atsUrl: 'atsUrl',
  confirmationNumber: 'confirmationNumber',
  contactMethod: 'contactMethod',
  recruiterName: 'recruiterName',
  recruiterEmail: 'recruiterEmail',
  recruiterPhone: 'recruiterPhone',
  appliedVia: 'appliedVia',
  proxyUsed: 'proxyUsed',
  serverIpAddress: 'serverIpAddress'
};

exports.Prisma.ApplicationInteractionOrderByRelevanceFieldEnum = {
  id: 'id',
  applicationId: 'applicationId',
  title: 'title',
  description: 'description',
  contactPerson: 'contactPerson',
  contactEmail: 'contactEmail',
  contactPhone: 'contactPhone',
  contactRole: 'contactRole',
  medium: 'medium',
  location: 'location',
  agenda: 'agenda',
  notes: 'notes',
  feedback: 'feedback',
  nextSteps: 'nextSteps'
};

exports.Prisma.SavedJobOrderByRelevanceFieldEnum = {
  id: 'id',
  userId: 'userId',
  jobPostingId: 'jobPostingId',
  folder: 'folder',
  notes: 'notes',
  tags: 'tags',
  savedReason: 'savedReason'
};

exports.Prisma.SubscriptionOrderByRelevanceFieldEnum = {
  id: 'id',
  userId: 'userId',
  stripeCustomerId: 'stripeCustomerId',
  stripeSubscriptionId: 'stripeSubscriptionId',
  stripePriceId: 'stripePriceId',
  stripeProductId: 'stripeProductId',
  cancelReason: 'cancelReason',
  promoCode: 'promoCode'
};

exports.Prisma.BillingHistoryOrderByRelevanceFieldEnum = {
  id: 'id',
  subscriptionId: 'subscriptionId',
  currency: 'currency',
  stripeInvoiceId: 'stripeInvoiceId',
  stripePaymentIntentId: 'stripePaymentIntentId',
  description: 'description',
  invoiceUrl: 'invoiceUrl'
};

exports.Prisma.UsageRecordOrderByRelevanceFieldEnum = {
  id: 'id',
  userId: 'userId',
  subscriptionId: 'subscriptionId',
  sessionId: 'sessionId',
  deviceType: 'deviceType',
  ipAddress: 'ipAddress'
};
exports.UserRole = exports.$Enums.UserRole = {
  USER: 'USER',
  PREMIUM_USER: 'PREMIUM_USER',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
  MODERATOR: 'MODERATOR'
};

exports.UserStatus = exports.$Enums.UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  BANNED: 'BANNED',
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
  DELETED: 'DELETED'
};

exports.ProfileVisibility = exports.$Enums.ProfileVisibility = {
  PRIVATE: 'PRIVATE',
  PUBLIC: 'PUBLIC',
  CONNECTIONS_ONLY: 'CONNECTIONS_ONLY',
  RECRUITERS_ONLY: 'RECRUITERS_ONLY'
};

exports.RemotePreference = exports.$Enums.RemotePreference = {
  REMOTE_ONLY: 'REMOTE_ONLY',
  HYBRID: 'HYBRID',
  ONSITE_ONLY: 'ONSITE_ONLY',
  NO_PREFERENCE: 'NO_PREFERENCE'
};

exports.SwipeDirection = exports.$Enums.SwipeDirection = {
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  SUPER_LIKE: 'SUPER_LIKE'
};

exports.QueueStatus = exports.$Enums.QueueStatus = {
  PENDING: 'PENDING',
  QUEUED: 'QUEUED',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  RETRYING: 'RETRYING',
  PAUSED: 'PAUSED',
  REQUIRES_CAPTCHA: 'REQUIRES_CAPTCHA'
};

exports.QueuePriority = exports.$Enums.QueuePriority = {
  LOW: 'LOW',
  NORMAL: 'NORMAL',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
  IMMEDIATE: 'IMMEDIATE'
};

exports.LogLevel = exports.$Enums.LogLevel = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  CRITICAL: 'CRITICAL'
};

exports.ProxyType = exports.$Enums.ProxyType = {
  RESIDENTIAL: 'RESIDENTIAL',
  DATACENTER: 'DATACENTER',
  MOBILE: 'MOBILE',
  STATIC: 'STATIC',
  ROTATING: 'ROTATING'
};

exports.ActorType = exports.$Enums.ActorType = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  SYSTEM: 'SYSTEM',
  API_KEY: 'API_KEY',
  SERVICE_ACCOUNT: 'SERVICE_ACCOUNT',
  AUTOMATION: 'AUTOMATION',
  WEBHOOK: 'WEBHOOK'
};

exports.RiskLevel = exports.$Enums.RiskLevel = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

exports.NotificationType = exports.$Enums.NotificationType = {
  JOB_MATCH: 'JOB_MATCH',
  APPLICATION_UPDATE: 'APPLICATION_UPDATE',
  INTERVIEW_REMINDER: 'INTERVIEW_REMINDER',
  DEADLINE_REMINDER: 'DEADLINE_REMINDER',
  NEW_MESSAGE: 'NEW_MESSAGE',
  SYSTEM_NOTIFICATION: 'SYSTEM_NOTIFICATION',
  BILLING_NOTIFICATION: 'BILLING_NOTIFICATION',
  SECURITY_ALERT: 'SECURITY_ALERT',
  FEATURE_ANNOUNCEMENT: 'FEATURE_ANNOUNCEMENT',
  WEEKLY_DIGEST: 'WEEKLY_DIGEST',
  REFERRAL_BONUS: 'REFERRAL_BONUS',
  ACHIEVEMENT_UNLOCKED: 'ACHIEVEMENT_UNLOCKED',
  SUBSCRIPTION_EXPIRING: 'SUBSCRIPTION_EXPIRING',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
  DATA_EXPORT_READY: 'DATA_EXPORT_READY',
  PROFILE_INCOMPLETE: 'PROFILE_INCOMPLETE',
  RESUME_FEEDBACK: 'RESUME_FEEDBACK',
  JOB_RECOMMENDATION: 'JOB_RECOMMENDATION',
  COMPANY_UPDATE: 'COMPANY_UPDATE'
};

exports.NotificationChannel = exports.$Enums.NotificationChannel = {
  IN_APP: 'IN_APP',
  EMAIL: 'EMAIL',
  SMS: 'SMS',
  PUSH: 'PUSH',
  SLACK: 'SLACK',
  WEBHOOK: 'WEBHOOK'
};

exports.NotificationPriority = exports.$Enums.NotificationPriority = {
  LOW: 'LOW',
  NORMAL: 'NORMAL',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
  CRITICAL: 'CRITICAL'
};

exports.NotificationStatus = exports.$Enums.NotificationStatus = {
  UNREAD: 'UNREAD',
  READ: 'READ',
  CLICKED: 'CLICKED',
  DISMISSED: 'DISMISSED',
  EXPIRED: 'EXPIRED',
  FAILED: 'FAILED'
};

exports.SettingType = exports.$Enums.SettingType = {
  STRING: 'STRING',
  NUMBER: 'NUMBER',
  BOOLEAN: 'BOOLEAN',
  JSON: 'JSON',
  ARRAY: 'ARRAY',
  URL: 'URL',
  EMAIL: 'EMAIL',
  PASSWORD: 'PASSWORD',
  ENCRYPTED: 'ENCRYPTED'
};

exports.CompanySize = exports.$Enums.CompanySize = {
  STARTUP: 'STARTUP',
  SMALL: 'SMALL',
  MEDIUM: 'MEDIUM',
  LARGE: 'LARGE',
  ENTERPRISE: 'ENTERPRISE',
  UNKNOWN: 'UNKNOWN'
};

exports.CompanyStatus = exports.$Enums.CompanyStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  ACQUIRED: 'ACQUIRED',
  CLOSED: 'CLOSED',
  SUSPENDED: 'SUSPENDED'
};

exports.EmploymentType = exports.$Enums.EmploymentType = {
  FULL_TIME: 'FULL_TIME',
  PART_TIME: 'PART_TIME',
  CONTRACT: 'CONTRACT',
  FREELANCE: 'FREELANCE',
  INTERNSHIP: 'INTERNSHIP',
  TEMPORARY: 'TEMPORARY'
};

exports.JobType = exports.$Enums.JobType = {
  FULL_TIME: 'FULL_TIME',
  PART_TIME: 'PART_TIME',
  CONTRACT: 'CONTRACT',
  FREELANCE: 'FREELANCE',
  INTERNSHIP: 'INTERNSHIP',
  TEMPORARY: 'TEMPORARY',
  VOLUNTEER: 'VOLUNTEER',
  APPRENTICESHIP: 'APPRENTICESHIP'
};

exports.JobLevel = exports.$Enums.JobLevel = {
  ENTRY: 'ENTRY',
  JUNIOR: 'JUNIOR',
  MID: 'MID',
  SENIOR: 'SENIOR',
  LEAD: 'LEAD',
  PRINCIPAL: 'PRINCIPAL',
  STAFF: 'STAFF',
  MANAGER: 'MANAGER',
  SENIOR_MANAGER: 'SENIOR_MANAGER',
  DIRECTOR: 'DIRECTOR',
  SENIOR_DIRECTOR: 'SENIOR_DIRECTOR',
  VP: 'VP',
  SVP: 'SVP',
  C_LEVEL: 'C_LEVEL',
  FOUNDER: 'FOUNDER'
};

exports.JobCategory = exports.$Enums.JobCategory = {
  TECHNOLOGY: 'TECHNOLOGY',
  ENGINEERING: 'ENGINEERING',
  DESIGN: 'DESIGN',
  PRODUCT: 'PRODUCT',
  MARKETING: 'MARKETING',
  SALES: 'SALES',
  FINANCE: 'FINANCE',
  OPERATIONS: 'OPERATIONS',
  HUMAN_RESOURCES: 'HUMAN_RESOURCES',
  LEGAL: 'LEGAL',
  CUSTOMER_SUCCESS: 'CUSTOMER_SUCCESS',
  DATA_SCIENCE: 'DATA_SCIENCE',
  HEALTHCARE: 'HEALTHCARE',
  EDUCATION: 'EDUCATION',
  CONSULTING: 'CONSULTING',
  MANUFACTURING: 'MANUFACTURING',
  RETAIL: 'RETAIL',
  HOSPITALITY: 'HOSPITALITY',
  MEDIA: 'MEDIA',
  NON_PROFIT: 'NON_PROFIT',
  GOVERNMENT: 'GOVERNMENT',
  OTHER: 'OTHER'
};

exports.RemoteType = exports.$Enums.RemoteType = {
  ONSITE: 'ONSITE',
  REMOTE: 'REMOTE',
  HYBRID: 'HYBRID',
  FLEXIBLE: 'FLEXIBLE'
};

exports.SalaryType = exports.$Enums.SalaryType = {
  HOURLY: 'HOURLY',
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
  ANNUAL: 'ANNUAL',
  CONTRACT: 'CONTRACT',
  COMMISSION: 'COMMISSION'
};

exports.JobSource = exports.$Enums.JobSource = {
  MANUAL: 'MANUAL',
  LINKEDIN: 'LINKEDIN',
  INDEED: 'INDEED',
  GLASSDOOR: 'GLASSDOOR',
  ANGELLIST: 'ANGELLIST',
  STACKOVERFLOW: 'STACKOVERFLOW',
  DICE: 'DICE',
  MONSTER: 'MONSTER',
  ZIPRECRUITER: 'ZIPRECRUITER',
  BUILTIN: 'BUILTIN',
  FLEXJOBS: 'FLEXJOBS',
  REMOTE_CO: 'REMOTE_CO',
  WEWORKREMOTELY: 'WEWORKREMOTELY',
  COMPANY_WEBSITE: 'COMPANY_WEBSITE',
  RECRUITER_OUTREACH: 'RECRUITER_OUTREACH',
  REFERRAL: 'REFERRAL',
  OTHER: 'OTHER'
};

exports.JobStatus = exports.$Enums.JobStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  EXPIRED: 'EXPIRED',
  FILLED: 'FILLED',
  ON_HOLD: 'ON_HOLD',
  CANCELLED: 'CANCELLED',
  DRAFT: 'DRAFT'
};

exports.TemplateCategory = exports.$Enums.TemplateCategory = {
  GENERAL: 'GENERAL',
  TECHNOLOGY: 'TECHNOLOGY',
  BUSINESS: 'BUSINESS',
  CREATIVE: 'CREATIVE',
  ACADEMIC: 'ACADEMIC',
  HEALTHCARE: 'HEALTHCARE',
  ENGINEERING: 'ENGINEERING',
  SALES: 'SALES',
  MARKETING: 'MARKETING',
  FINANCE: 'FINANCE',
  LEGAL: 'LEGAL',
  EDUCATION: 'EDUCATION',
  NON_PROFIT: 'NON_PROFIT',
  EXECUTIVE: 'EXECUTIVE',
  ENTRY_LEVEL: 'ENTRY_LEVEL',
  CAREER_CHANGE: 'CAREER_CHANGE'
};

exports.ResumeVisibility = exports.$Enums.ResumeVisibility = {
  PRIVATE: 'PRIVATE',
  PUBLIC: 'PUBLIC',
  RECRUITERS_ONLY: 'RECRUITERS_ONLY',
  SHARED_LINK: 'SHARED_LINK'
};

exports.ProcessingStatus = exports.$Enums.ProcessingStatus = {
  PENDING: 'PENDING',
  PARSING: 'PARSING',
  PARSED: 'PARSED',
  ENHANCING: 'ENHANCING',
  ENHANCED: 'ENHANCED',
  FAILED: 'FAILED',
  ERROR: 'ERROR'
};

exports.EnhancementType = exports.$Enums.EnhancementType = {
  KEYWORD_OPTIMIZATION: 'KEYWORD_OPTIMIZATION',
  ATS_OPTIMIZATION: 'ATS_OPTIMIZATION',
  JOB_SPECIFIC_TAILORING: 'JOB_SPECIFIC_TAILORING',
  SKILL_HIGHLIGHTING: 'SKILL_HIGHLIGHTING',
  EXPERIENCE_ENHANCEMENT: 'EXPERIENCE_ENHANCEMENT',
  SUMMARY_IMPROVEMENT: 'SUMMARY_IMPROVEMENT',
  GRAMMAR_CHECK: 'GRAMMAR_CHECK',
  FORMAT_OPTIMIZATION: 'FORMAT_OPTIMIZATION',
  LENGTH_OPTIMIZATION: 'LENGTH_OPTIMIZATION',
  IMPACT_ENHANCEMENT: 'IMPACT_ENHANCEMENT'
};

exports.ApplicationStatus = exports.$Enums.ApplicationStatus = {
  DRAFT: 'DRAFT',
  QUEUED: 'QUEUED',
  APPLYING: 'APPLYING',
  APPLIED: 'APPLIED',
  APPLICATION_ERROR: 'APPLICATION_ERROR',
  VIEWED: 'VIEWED',
  SCREENING: 'SCREENING',
  PHONE_SCREEN: 'PHONE_SCREEN',
  INTERVIEW_SCHEDULED: 'INTERVIEW_SCHEDULED',
  FIRST_INTERVIEW: 'FIRST_INTERVIEW',
  SECOND_INTERVIEW: 'SECOND_INTERVIEW',
  FINAL_INTERVIEW: 'FINAL_INTERVIEW',
  TECHNICAL_ASSESSMENT: 'TECHNICAL_ASSESSMENT',
  TAKE_HOME_PROJECT: 'TAKE_HOME_PROJECT',
  REFERENCE_CHECK: 'REFERENCE_CHECK',
  BACKGROUND_CHECK: 'BACKGROUND_CHECK',
  OFFER_PENDING: 'OFFER_PENDING',
  OFFER_RECEIVED: 'OFFER_RECEIVED',
  OFFER_ACCEPTED: 'OFFER_ACCEPTED',
  OFFER_DECLINED: 'OFFER_DECLINED',
  REJECTED: 'REJECTED',
  WITHDRAWN: 'WITHDRAWN',
  GHOSTED: 'GHOSTED',
  ARCHIVED: 'ARCHIVED'
};

exports.ApplicationPriority = exports.$Enums.ApplicationPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
  CRITICAL: 'CRITICAL'
};

exports.ApplicationSource = exports.$Enums.ApplicationSource = {
  MANUAL: 'MANUAL',
  AUTOMATION: 'AUTOMATION',
  BULK_APPLY: 'BULK_APPLY',
  REFERRAL: 'REFERRAL',
  RECRUITER: 'RECRUITER',
  COMPANY_OUTREACH: 'COMPANY_OUTREACH'
};

exports.AutomationStatus = exports.$Enums.AutomationStatus = {
  NOT_AUTOMATED: 'NOT_AUTOMATED',
  QUEUED: 'QUEUED',
  IN_PROGRESS: 'IN_PROGRESS',
  WAITING_CAPTCHA: 'WAITING_CAPTCHA',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REQUIRES_MANUAL: 'REQUIRES_MANUAL',
  CANCELLED: 'CANCELLED'
};

exports.ExecutionMode = exports.$Enums.ExecutionMode = {
  SERVER: 'SERVER',
  DESKTOP: 'DESKTOP'
};

exports.InteractionType = exports.$Enums.InteractionType = {
  APPLICATION_SUBMITTED: 'APPLICATION_SUBMITTED',
  EMAIL_RECEIVED: 'EMAIL_RECEIVED',
  EMAIL_SENT: 'EMAIL_SENT',
  PHONE_CALL_INCOMING: 'PHONE_CALL_INCOMING',
  PHONE_CALL_OUTGOING: 'PHONE_CALL_OUTGOING',
  VIDEO_CALL: 'VIDEO_CALL',
  IN_PERSON_MEETING: 'IN_PERSON_MEETING',
  LINKEDIN_MESSAGE: 'LINKEDIN_MESSAGE',
  TEXT_MESSAGE: 'TEXT_MESSAGE',
  RECRUITER_CONTACT: 'RECRUITER_CONTACT',
  INTERVIEW_SCHEDULED: 'INTERVIEW_SCHEDULED',
  INTERVIEW_COMPLETED: 'INTERVIEW_COMPLETED',
  ASSESSMENT_SENT: 'ASSESSMENT_SENT',
  ASSESSMENT_COMPLETED: 'ASSESSMENT_COMPLETED',
  REFERENCE_REQUEST: 'REFERENCE_REQUEST',
  BACKGROUND_CHECK: 'BACKGROUND_CHECK',
  OFFER_RECEIVED: 'OFFER_RECEIVED',
  OFFER_NEGOTIATION: 'OFFER_NEGOTIATION',
  REJECTION_RECEIVED: 'REJECTION_RECEIVED',
  FOLLOW_UP_SENT: 'FOLLOW_UP_SENT',
  THANK_YOU_SENT: 'THANK_YOU_SENT',
  WITHDRAWAL_SENT: 'WITHDRAWAL_SENT',
  STATUS_UPDATE: 'STATUS_UPDATE',
  OTHER: 'OTHER'
};

exports.InteractionOutcome = exports.$Enums.InteractionOutcome = {
  POSITIVE: 'POSITIVE',
  NEUTRAL: 'NEUTRAL',
  NEGATIVE: 'NEGATIVE',
  NO_RESPONSE: 'NO_RESPONSE',
  NEEDS_FOLLOW_UP: 'NEEDS_FOLLOW_UP',
  SCHEDULED_NEXT_STEP: 'SCHEDULED_NEXT_STEP',
  OFFER_DISCUSSION: 'OFFER_DISCUSSION',
  REJECTION: 'REJECTION',
  INTERVIEW_SCHEDULED: 'INTERVIEW_SCHEDULED',
  ASSESSMENT_REQUIRED: 'ASSESSMENT_REQUIRED',
  REFERENCES_REQUESTED: 'REFERENCES_REQUESTED',
  WITHDRAWN: 'WITHDRAWN'
};

exports.SavedJobPriority = exports.$Enums.SavedJobPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
};

exports.SubscriptionPlan = exports.$Enums.SubscriptionPlan = {
  FREE: 'FREE',
  BASIC: 'BASIC',
  PRO: 'PRO',
  PREMIUM: 'PREMIUM',
  ENTERPRISE: 'ENTERPRISE',
  CUSTOM: 'CUSTOM'
};

exports.SubscriptionStatus = exports.$Enums.SubscriptionStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PAST_DUE: 'PAST_DUE',
  CANCELLED: 'CANCELLED',
  UNPAID: 'UNPAID',
  TRIALING: 'TRIALING',
  INCOMPLETE: 'INCOMPLETE',
  INCOMPLETE_EXPIRED: 'INCOMPLETE_EXPIRED',
  PAUSED: 'PAUSED'
};

exports.PaymentStatus = exports.$Enums.PaymentStatus = {
  PENDING: 'PENDING',
  SUCCEEDED: 'SUCCEEDED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
  DISPUTED: 'DISPUTED',
  REQUIRES_ACTION: 'REQUIRES_ACTION'
};

exports.UsageFeature = exports.$Enums.UsageFeature = {
  JOB_SEARCH: 'JOB_SEARCH',
  JOB_VIEW: 'JOB_VIEW',
  JOB_SWIPE: 'JOB_SWIPE',
  JOB_SAVE: 'JOB_SAVE',
  APPLICATION_MANUAL: 'APPLICATION_MANUAL',
  APPLICATION_AUTOMATION: 'APPLICATION_AUTOMATION',
  RESUME_CREATION: 'RESUME_CREATION',
  RESUME_EDIT: 'RESUME_EDIT',
  RESUME_DOWNLOAD: 'RESUME_DOWNLOAD',
  RESUME_ENHANCEMENT: 'RESUME_ENHANCEMENT',
  COVER_LETTER_GENERATION: 'COVER_LETTER_GENERATION',
  TEMPLATE_USAGE: 'TEMPLATE_USAGE',
  PROFILE_UPDATE: 'PROFILE_UPDATE',
  SEARCH_FILTER: 'SEARCH_FILTER',
  NOTIFICATION_SENT: 'NOTIFICATION_SENT',
  EMAIL_SENT: 'EMAIL_SENT',
  FILE_UPLOAD: 'FILE_UPLOAD',
  FILE_DOWNLOAD: 'FILE_DOWNLOAD',
  API_CALL: 'API_CALL',
  DESKTOP_APP_USAGE: 'DESKTOP_APP_USAGE',
  MOBILE_APP_USAGE: 'MOBILE_APP_USAGE',
  WEB_APP_USAGE: 'WEB_APP_USAGE',
  ANALYTICS_EVENT: 'ANALYTICS_EVENT',
  AUDIT_LOG_ENTRY: 'AUDIT_LOG_ENTRY'
};

exports.Prisma.ModelName = {
  User: 'User',
  UserProfile: 'UserProfile',
  UserPreferences: 'UserPreferences',
  Account: 'Account',
  Session: 'Session',
  VerificationToken: 'VerificationToken',
  OAuthState: 'OAuthState',
  UserJobSwipe: 'UserJobSwipe',
  ApplicationQueue: 'ApplicationQueue',
  AutomationLog: 'AutomationLog',
  AutomationProxy: 'AutomationProxy',
  AuditLog: 'AuditLog',
  AnalyticsEvent: 'AnalyticsEvent',
  UserNotification: 'UserNotification',
  SystemSetting: 'SystemSetting',
  NotificationTemplate: 'NotificationTemplate',
  Company: 'Company',
  CompanyReview: 'CompanyReview',
  JobPosting: 'JobPosting',
  JobSnapshot: 'JobSnapshot',
  ResumeTemplate: 'ResumeTemplate',
  Resume: 'Resume',
  ResumeEnhancement: 'ResumeEnhancement',
  JobApplication: 'JobApplication',
  ApplicationInteraction: 'ApplicationInteraction',
  SavedJob: 'SavedJob',
  Subscription: 'Subscription',
  BillingHistory: 'BillingHistory',
  UsageRecord: 'UsageRecord'
};
/**
 * Create the Client
 */
const config = {
  "generator": {
    "name": "client",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client-js"
    },
    "output": {
      "value": "/home/user/jobswipe/packages/database/src/generated",
      "fromEnvVar": null
    },
    "config": {
      "engineType": "library"
    },
    "binaryTargets": [
      {
        "fromEnvVar": null,
        "value": "debian-openssl-3.0.x",
        "native": true
      }
    ],
    "previewFeatures": [
      "fullTextSearch",
      "postgresqlExtensions",
      "views",
      "relationJoins"
    ],
    "sourceFilePath": "/home/user/jobswipe/packages/database/prisma/schema.prisma",
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": null
  },
  "relativePath": "../../prisma",
  "clientVersion": "5.22.0",
  "engineVersion": "605197351a3c8bdd595af2d2a9bc3025bca48ea2",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "postgresql",
  "postinstall": false,
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "DATABASE_URL",
        "value": null
      }
    }
  },
  "inlineSchema": "generator client {\n  provider        = \"prisma-client-js\"\n  output          = \"../src/generated\"\n  previewFeatures = [\"fullTextSearch\", \"postgresqlExtensions\", \"views\", \"relationJoins\"]\n}\n\ndatasource db {\n  provider = \"postgresql\"\n  url      = env(\"DATABASE_URL\")\n}\n\nmodel User {\n  id                    String             @id @default(uuid())\n  email                 String             @unique\n  passwordHash          String?\n  name                  String?\n  avatar                String?\n  emailVerified         DateTime?\n  role                  UserRole           @default(USER)\n  status                UserStatus         @default(ACTIVE)\n  lastLoginAt           DateTime?\n  loginAttempts         Int                @default(0)\n  lockedUntil           DateTime?\n  dataConsent           Boolean            @default(false)\n  consentDate           DateTime?\n  dataRetentionUntil    DateTime?\n  isDeleted             Boolean            @default(false)\n  deletedAt             DateTime?\n  onboardingCompleted   Boolean            @default(false)\n  onboardingProgress    Int                @default(0)\n  onboardingStep        Int                @default(1)\n  onboardingStartedAt   DateTime?\n  onboardingCompletedAt DateTime?\n  ipAddress             String?\n  userAgent             String?\n  timezone              String?\n  locale                String?            @default(\"en\")\n  oauthProviders        String[]           @default([]) // Track linked OAuth providers\n  primaryAuthProvider   String? // 'email' | 'google' | 'github' | 'linkedin'\n  createdAt             DateTime           @default(now())\n  updatedAt             DateTime           @updatedAt\n  accounts              Account[]\n  analyticsEvents       AnalyticsEvent[]\n  applicationQueue      ApplicationQueue[]\n  auditLogs             AuditLog[]\n  companyReviews        CompanyReview[]\n  applications          JobApplication[]\n  resumes               Resume[]\n  savedJobs             SavedJob[]\n  sessions              Session[]\n  subscription          Subscription?\n  usageRecords          UsageRecord[]\n  jobSwipes             UserJobSwipe[]\n  notifications         UserNotification[]\n  preferences           UserPreferences?\n  profile               UserProfile?\n\n  @@index([email])\n  @@index([status])\n  @@index([createdAt])\n  @@index([lastLoginAt])\n  @@map(\"users\")\n}\n\nmodel UserProfile {\n  id                    String            @id @default(uuid())\n  userId                String            @unique\n  firstName             String?\n  lastName              String?\n  displayName           String?\n  phone                 String?\n  dateOfBirth           DateTime?\n  gender                String?\n  address               String?\n  city                  String?\n  state                 String?\n  country               String?\n  postalCode            String?\n  location              String?\n  website               String?\n  linkedin              String?\n  github                String?\n  portfolio             String?\n  blog                  String?\n  bio                   String?\n  headline              String?\n  summary               String?\n  currentTitle          String?\n  currentCompany        String?\n  experienceLevel       String?\n  yearsOfExperience     Int?\n  skills                String[]\n  certifications        Json?\n  languages             Json?\n  education             Json?\n  desiredJobTypes       String[]\n  desiredSalaryMin      Int?\n  desiredSalaryMax      Int?\n  preferredCurrency     String?\n  willingToRelocate     Boolean?          @default(false)\n  needsVisaSponsorship  Boolean?          @default(false)\n  profileVisibility     ProfileVisibility @default(PRIVATE)\n  showEmail             Boolean           @default(false)\n  showPhone             Boolean           @default(false)\n  createdAt             DateTime          @default(now())\n  updatedAt             DateTime          @updatedAt\n  automationPreferences Json?\n  coverLetterTemplate   String?\n  workAuthorization     String?\n  user                  User              @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([userId])\n  @@index([city, state, country])\n  @@map(\"user_profiles\")\n}\n\nmodel UserPreferences {\n  id                    String           @id @default(uuid())\n  userId                String           @unique\n  jobSearchRadius       Int?             @default(50)\n  jobTypes              String[]\n  experienceLevels      String[]\n  industries            String[]\n  companyTypes          String[]\n  remotePref            RemotePreference @default(NO_PREFERENCE)\n  emailNotifications    Boolean          @default(true)\n  pushNotifications     Boolean          @default(true)\n  smsNotifications      Boolean          @default(false)\n  newJobMatches         Boolean          @default(true)\n  applicationUpdates    Boolean          @default(true)\n  interviewReminders    Boolean          @default(true)\n  weeklyDigest          Boolean          @default(true)\n  promotionalEmails     Boolean          @default(false)\n  autoApplyEnabled      Boolean          @default(false)\n  autoApplyJobTypes     String[]\n  autoApplyMaxPerDay    Int?             @default(5)\n  autoApplyRequireMatch Boolean          @default(true)\n  dataProcessingConsent Boolean          @default(false)\n  marketingConsent      Boolean          @default(false)\n  analyticsConsent      Boolean          @default(false)\n  thirdPartySharing     Boolean          @default(false)\n  theme                 String?          @default(\"light\")\n  language              String?          @default(\"en\")\n  timezone              String?\n  dateFormat            String?          @default(\"MM/DD/YYYY\")\n  createdAt             DateTime         @default(now())\n  updatedAt             DateTime         @updatedAt\n  user                  User             @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([userId])\n  @@map(\"user_preferences\")\n}\n\nmodel Account {\n  id                String  @id @default(cuid())\n  userId            String\n  type              String\n  provider          String\n  providerAccountId String\n  refresh_token     String?\n  access_token      String?\n  expires_at        Int?\n  token_type        String?\n  scope             String?\n  id_token          String?\n  session_state     String?\n  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([provider, providerAccountId])\n  @@map(\"accounts\")\n}\n\nmodel Session {\n  id           String   @id @default(cuid())\n  sessionToken String   @unique\n  userId       String\n  expires      DateTime\n  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@map(\"sessions\")\n}\n\nmodel VerificationToken {\n  identifier String\n  token      String   @unique\n  expires    DateTime\n\n  @@unique([identifier, token])\n  @@map(\"verification_tokens\")\n}\n\nmodel OAuthState {\n  id           String   @id @default(uuid())\n  state        String   @unique\n  codeVerifier String? // PKCE code verifier for enhanced security\n  provider     String // 'google' | 'github' | 'linkedin'\n  redirectUri  String // Where to redirect after OAuth\n  source       String // 'web' | 'desktop' | 'mobile'\n  metadata     Json? // Additional data (deviceId, etc.)\n  createdAt    DateTime @default(now())\n  expiresAt    DateTime // State expires after 10 minutes\n\n  @@index([state])\n  @@index([expiresAt])\n  @@index([provider])\n  @@map(\"oauth_states\")\n}\n\nmodel UserJobSwipe {\n  id             String         @id @default(uuid())\n  userId         String\n  jobPostingId   String\n  direction      SwipeDirection\n  confidence     Float?\n  deviceType     String?\n  sessionId      String?\n  position       Int?\n  timeSpent      Int?\n  matchScore     Float?\n  matchFactors   Json?\n  userFeedback   String?\n  isCorrectMatch Boolean?\n  ipAddress      String?\n  userAgent      String?\n  location       String?\n  createdAt      DateTime       @default(now())\n  updatedAt      DateTime       @updatedAt\n  jobPosting     JobPosting     @relation(fields: [jobPostingId], references: [id], onDelete: Cascade)\n  user           User           @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([userId, jobPostingId])\n  @@index([userId, direction])\n  @@index([jobPostingId, direction])\n  @@index([createdAt])\n  @@index([matchScore])\n  @@map(\"user_job_swipes\")\n}\n\nmodel ApplicationQueue {\n  id               String          @id @default(uuid())\n  userId           String\n  jobPostingId     String\n  applicationId    String?\n  status           QueueStatus     @default(PENDING)\n  priority         QueuePriority   @default(NORMAL)\n  attempts         Int             @default(0)\n  maxAttempts      Int             @default(3)\n  scheduledAt      DateTime?\n  startedAt        DateTime?\n  completedAt      DateTime?\n  failedAt         DateTime?\n  nextRetryAt      DateTime?\n  useCustomResume  Boolean         @default(false)\n  resumeId         String?\n  coverLetter      String?\n  customFields     Json?\n  automationConfig Json?\n  requiresCaptcha  Boolean         @default(false)\n  captchaSolved    Boolean         @default(false)\n  success          Boolean?\n  errorMessage     String?\n  errorType        String?\n  responseData     Json?\n  desktopSessionId String?\n  claimedBy        String? // 'SERVER' or 'DESKTOP' - prevents duplicate processing\n  claimedAt        DateTime? // When the job was claimed for processing\n  createdAt        DateTime        @default(now())\n  updatedAt        DateTime        @updatedAt\n  application      JobApplication? @relation(fields: [applicationId], references: [id])\n  jobPosting       JobPosting      @relation(fields: [jobPostingId], references: [id], onDelete: Cascade)\n  user             User            @relation(fields: [userId], references: [id], onDelete: Cascade)\n  automationLogs   AutomationLog[]\n  jobSnapshot      JobSnapshot?\n\n  @@index([userId, status])\n  @@index([status, scheduledAt])\n  @@index([priority, scheduledAt])\n  @@index([createdAt])\n  @@map(\"application_queue\")\n}\n\nmodel AutomationLog {\n  id              String           @id @default(uuid())\n  queueId         String\n  level           LogLevel         @default(INFO)\n  message         String\n  details         Json?\n  step            String?\n  elementSelector String?\n  action          String?\n  errorType       String?\n  stackTrace      String?\n  screenshot      String?\n  executionTime   Int?\n  memoryUsage     Int?\n  browserInfo     Json?\n  pageUrl         String?\n  createdAt       DateTime         @default(now())\n  queue           ApplicationQueue @relation(fields: [queueId], references: [id], onDelete: Cascade)\n\n  @@index([queueId, level])\n  @@index([createdAt])\n  @@index([level, createdAt])\n  @@map(\"automation_logs\")\n}\n\nmodel AutomationProxy {\n  id                 String    @id @default(uuid())\n  host               String\n  port               Int\n  username           String?\n  password           String?\n  proxyType          ProxyType @default(RESIDENTIAL)\n  provider           String?\n  country            String?\n  region             String?\n  isActive           Boolean   @default(true)\n  failureCount       Int       @default(0)\n  successRate        Float     @default(100.0)\n  lastUsedAt         DateTime?\n  lastCheckedAt      DateTime?\n  requestsPerHour    Int?      @default(100)\n  dailyLimit         Int?      @default(1000)\n  currentHourlyUsage Int       @default(0)\n  currentDailyUsage  Int       @default(0)\n  avgResponseTime    Int?\n  uptime             Float?\n  costPerRequest     Decimal?\n  monthlyLimit       Decimal?\n  notes              String?\n  tags               String[]\n  createdAt          DateTime  @default(now())\n  updatedAt          DateTime  @updatedAt\n\n  @@index([isActive, proxyType])\n  @@index([provider, isActive])\n  @@index([successRate])\n  @@index([lastUsedAt])\n  @@index([failureCount])\n  @@map(\"automation_proxies\")\n}\n\nmodel AuditLog {\n  id           String    @id @default(uuid())\n  userId       String?\n  actorType    ActorType @default(USER)\n  actorId      String?\n  action       String\n  resource     String\n  resourceId   String?\n  method       String?\n  endpoint     String?\n  statusCode   Int?\n  ipAddress    String?\n  userAgent    String?\n  sessionId    String?\n  oldValues    Json?\n  newValues    Json?\n  riskLevel    RiskLevel @default(LOW)\n  riskFactors  String[]\n  dataCategory String?\n  legalBasis   String?\n  metadata     Json?\n  tags         String[]\n  createdAt    DateTime  @default(now())\n  user         User?     @relation(fields: [userId], references: [id])\n\n  @@index([userId, createdAt])\n  @@index([action, createdAt])\n  @@index([resource, resourceId])\n  @@index([riskLevel, createdAt])\n  @@index([ipAddress, createdAt])\n  @@index([createdAt])\n  @@map(\"audit_logs\")\n}\n\nmodel AnalyticsEvent {\n  id             String   @id @default(uuid())\n  userId         String?\n  eventType      String\n  eventCategory  String\n  eventName      String\n  properties     Json?\n  traits         Json?\n  sessionId      String?\n  deviceType     String?\n  platform       String?\n  ipAddress      String?\n  country        String?\n  region         String?\n  city           String?\n  userAgent      String?\n  referrer       String?\n  pageUrl        String?\n  revenue        Decimal?\n  currency       String?\n  timestamp      DateTime @default(now())\n  processingTime Int?\n  createdAt      DateTime @default(now())\n  user           User?    @relation(fields: [userId], references: [id])\n\n  @@index([userId, eventType])\n  @@index([eventType, timestamp])\n  @@index([sessionId, timestamp])\n  @@index([timestamp])\n  @@map(\"analytics_events\")\n}\n\nmodel UserNotification {\n  id           String               @id @default(uuid())\n  userId       String\n  type         NotificationType\n  title        String\n  message      String\n  actionUrl    String?\n  channel      NotificationChannel  @default(IN_APP)\n  priority     NotificationPriority @default(NORMAL)\n  status       NotificationStatus   @default(UNREAD)\n  readAt       DateTime?\n  clickedAt    DateTime?\n  sentAt       DateTime?\n  deliveredAt  DateTime?\n  failedAt     DateTime?\n  errorMessage String?\n  metadata     Json?\n  templateId   String?\n  scheduledFor DateTime?\n  expiresAt    DateTime?\n  createdAt    DateTime             @default(now())\n  updatedAt    DateTime             @updatedAt\n  user         User                 @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([userId, status])\n  @@index([type, createdAt])\n  @@index([scheduledFor])\n  @@index([createdAt])\n  @@map(\"user_notifications\")\n}\n\nmodel SystemSetting {\n  id             String      @id @default(uuid())\n  key            String      @unique\n  value          String\n  type           SettingType @default(STRING)\n  category       String      @default(\"general\")\n  description    String?\n  isPublic       Boolean     @default(false)\n  isEncrypted    Boolean     @default(false)\n  validationRule String?\n  defaultValue   String?\n  createdAt      DateTime    @default(now())\n  updatedAt      DateTime    @updatedAt\n  updatedBy      String?\n\n  @@index([category])\n  @@index([isPublic])\n  @@map(\"system_settings\")\n}\n\nmodel NotificationTemplate {\n  id         String              @id @default(uuid())\n  name       String              @unique\n  type       NotificationType\n  subject    String?\n  title      String\n  body       String\n  htmlBody   String?\n  channel    NotificationChannel @default(IN_APP)\n  isActive   Boolean             @default(true)\n  variables  Json?\n  conditions Json?\n  category   String?\n  tags       String[]\n  createdAt  DateTime            @default(now())\n  updatedAt  DateTime            @updatedAt\n\n  @@index([type, isActive])\n  @@index([channel, isActive])\n  @@map(\"notification_templates\")\n}\n\nmodel Company {\n  id                 String          @id @default(uuid())\n  name               String\n  slug               String          @unique\n  description        String?\n  website            String?\n  logo               String?\n  industry           String?\n  size               CompanySize?\n  headquarters       String?\n  locations          Json?\n  country            String?\n  foundedYear        Int?\n  employeeCount      Int?\n  revenue            String?\n  fundingStage       String?\n  linkedinUrl        String?\n  glassdoorUrl       String?\n  crunchbaseUrl      String?\n  twitterUrl         String?\n  facebookUrl        String?\n  benefits           Json?\n  cultureValues      String[]\n  workEnvironment    Json?\n  isVerified         Boolean         @default(false)\n  verifiedAt         DateTime?\n  verificationSource String?\n  qualityScore       Float?\n  keywords           String[]\n  tags               String[]\n  status             CompanyStatus   @default(ACTIVE)\n  isBlacklisted      Boolean         @default(false)\n  blacklistReason    String?\n  createdAt          DateTime        @default(now())\n  updatedAt          DateTime        @updatedAt\n  companyReviews     CompanyReview[]\n  jobPostings        JobPosting[]\n\n  @@index([slug])\n  @@index([industry])\n  @@index([size])\n  @@index([status])\n  @@index([isVerified])\n  @@index([qualityScore])\n  @@map(\"companies\")\n}\n\nmodel CompanyReview {\n  id              String          @id @default(uuid())\n  companyId       String\n  userId          String?\n  title           String?\n  content         String\n  rating          Float\n  workLifeBalance Float?\n  compensation    Float?\n  culture         Float?\n  management      Float?\n  careerGrowth    Float?\n  jobTitle        String?\n  department      String?\n  employmentType  EmploymentType?\n  workDuration    String?\n  isApproved      Boolean         @default(false)\n  isAnonymous     Boolean         @default(true)\n  isVerified      Boolean         @default(false)\n  helpfulVotes    Int             @default(0)\n  reportCount     Int             @default(0)\n  createdAt       DateTime        @default(now())\n  updatedAt       DateTime        @updatedAt\n  company         Company         @relation(fields: [companyId], references: [id], onDelete: Cascade)\n  user            User?           @relation(fields: [userId], references: [id])\n\n  @@index([companyId, isApproved])\n  @@index([rating])\n  @@index([createdAt])\n  @@map(\"company_reviews\")\n}\n\nmodel JobPosting {\n  id               String      @id @default(uuid())\n  title            String\n  description      String\n  requirements     String?\n  benefits         String?\n  type             JobType     @default(FULL_TIME)\n  level            JobLevel    @default(MID)\n  department       String?\n  category         JobCategory @default(OTHER)\n  remote           Boolean     @default(false)\n  remoteType       RemoteType  @default(ONSITE)\n  location         String?\n  timeZone         String?\n  city             String?\n  state            String?\n  country          String?\n  coordinates      Json?\n  salaryMin        Int?\n  salaryMax        Int?\n  currency         String?     @default(\"USD\")\n  salaryType       SalaryType?\n  equity           String?\n  bonus            String?\n  experienceYears  Int?\n  skills           String[]\n  education        String?\n  languages        String[]\n  companyId        String\n  externalId       String?     @unique\n  source           JobSource   @default(MANUAL)\n  sourceUrl        String?\n  applyUrl         String?\n  keywords         String[]\n  tags             String[]\n  qualityScore     Float?\n  isVerified       Boolean     @default(false)\n  verifiedAt       DateTime?\n  status           JobStatus   @default(ACTIVE)\n  isActive         Boolean     @default(true)\n  isFeatured       Boolean     @default(false)\n  isUrgent         Boolean     @default(false)\n  postedAt         DateTime?\n  expiresAt        DateTime?\n  lastScrapedAt    DateTime?\n  viewCount        Int         @default(0)\n  applicationCount Int         @default(0)\n  rightSwipeCount  Int         @default(0)\n  leftSwipeCount   Int         @default(0)\n  createdAt        DateTime    @default(now())\n  updatedAt        DateTime    @updatedAt\n\n  // Greenhouse-specific fields for automation\n  greenhouseCompanyId String?\n  greenhouseJobId     String?\n  applicationSchema   Json?\n  formMetadata        Json?\n\n  // Automation intelligence metrics\n  automationFeasibility String? // 'high', 'medium', 'low'\n  estimatedSuccessRate  Int? // 0-100\n  prefilledFieldCount   Int     @default(0)\n  aiRequiredFieldCount  Int     @default(0)\n  totalRequiredFields   Int     @default(0)\n\n  // Schema tracking\n  lastSchemaUpdate DateTime?\n  schemaVersion    String?   @default(\"1.0\")\n\n  queueItems   ApplicationQueue[]\n  applications JobApplication[]\n  company      Company             @relation(fields: [companyId], references: [id], onDelete: Cascade)\n  snapshots    JobSnapshot[]\n  enhancements ResumeEnhancement[]\n  savedBy      SavedJob[]\n  swipes       UserJobSwipe[]\n\n  @@unique([greenhouseCompanyId, greenhouseJobId])\n  @@index([companyId])\n  @@index([type, level])\n  @@index([remote, remoteType])\n  @@index([status, isActive])\n  @@index([source])\n  @@index([city, state, country])\n  @@index([salaryMin, salaryMax])\n  @@index([createdAt])\n  @@index([postedAt])\n  @@index([qualityScore])\n  @@index([title])\n  @@index([description])\n  @@index([greenhouseCompanyId, greenhouseJobId])\n  @@index([automationFeasibility])\n  @@index([estimatedSuccessRate])\n  @@map(\"job_postings\")\n}\n\nmodel JobSnapshot {\n  id                 String           @id @default(uuid())\n  originalJobId      String\n  applicationQueueId String           @unique\n  title              String\n  description        String\n  requirements       String?\n  benefits           String?\n  type               String\n  level              String\n  department         String?\n  category           String\n  remote             Boolean\n  remoteType         String\n  location           String?\n  timeZone           String?\n  city               String?\n  state              String?\n  country            String?\n  coordinates        Json?\n  salaryMin          Int?\n  salaryMax          Int?\n  currency           String?\n  salaryType         String?\n  equity             String?\n  bonus              String?\n  experienceYears    Int?\n  skills             String[]\n  education          String?\n  languages          String[]\n  companyName        String\n  companyLogo        String?\n  companyWebsite     String?\n  companyIndustry    String?\n  companySize        String?\n  companyDescription String?\n  externalId         String?\n  source             String\n  sourceUrl          String?\n  applyUrl           String?\n  qualityScore       Float?\n  isVerified         Boolean\n  originalStatus     String\n  isActive           Boolean\n  isFeatured         Boolean\n  isUrgent           Boolean\n  originalPostedAt   DateTime?\n  originalExpiresAt  DateTime?\n  viewCount          Int              @default(0)\n  applicationCount   Int              @default(0)\n  rightSwipeCount    Int              @default(0)\n  leftSwipeCount     Int              @default(0)\n  snapshotVersion    String           @default(\"1.0\")\n  snapshotReason     String           @default(\"USER_SWIPE_RIGHT\")\n  createdAt          DateTime         @default(now())\n  applicationQueue   ApplicationQueue @relation(fields: [applicationQueueId], references: [id], onDelete: Cascade)\n  originalJob        JobPosting       @relation(fields: [originalJobId], references: [id], onDelete: Cascade)\n\n  @@index([originalJobId])\n  @@index([applicationQueueId])\n  @@index([companyName])\n  @@index([title])\n  @@index([createdAt])\n  @@index([originalPostedAt])\n  @@map(\"job_snapshots\")\n}\n\nmodel ResumeTemplate {\n  id           String              @id @default(uuid())\n  name         String\n  description  String?\n  category     TemplateCategory    @default(GENERAL)\n  content      Json\n  sections     Json\n  styling      Json\n  preview      String?\n  thumbnails   Json?\n  industry     String?\n  experience   String?\n  jobTypes     String[]\n  qualityScore Float?\n  downloads    Int                 @default(0)\n  ratings      Float?\n  ratingCount  Int                 @default(0)\n  isActive     Boolean             @default(true)\n  isPremium    Boolean             @default(false)\n  isPublic     Boolean             @default(true)\n  tags         String[]\n  keywords     String[]\n  usageCount   Int                 @default(0)\n  successRate  Float?\n  createdAt    DateTime            @default(now())\n  updatedAt    DateTime            @updatedAt\n  createdBy    String?\n  enhancements ResumeEnhancement[]\n  resumes      Resume[]\n\n  @@index([category, isActive])\n  @@index([isPremium, isActive])\n  @@index([qualityScore])\n  @@index([downloads])\n  @@index([name])\n  @@index([description])\n  @@map(\"resume_templates\")\n}\n\nmodel Resume {\n  id               String           @id @default(uuid())\n  userId           String\n  templateId       String?\n  name             String\n  title            String?\n  content          Json\n  sections         Json\n  metadata         Json?\n  pdfUrl           String?\n  docxUrl          String?\n  htmlUrl          String?\n  fileSize         Int?\n  pageCount        Int?\n  lastGenerated    DateTime?\n  version          Int              @default(1)\n  parentResumeId   String?\n  isDefault        Boolean          @default(false)\n  visibility       ResumeVisibility @default(PRIVATE)\n  shareToken       String?\n  viewCount        Int              @default(0)\n  downloadCount    Int              @default(0)\n  applicationCount Int              @default(0)\n  aiEnhanced       Boolean          @default(false)\n  enhancementData  Json?\n  completeness     Float?\n  readabilityScore Float?\n  keywordMatch     Float?\n\n  // S3 Storage fields\n  s3Key            String? @unique\n  s3Bucket         String?\n  s3Region         String?\n  originalFileName String?\n\n  // Processing status and metadata\n  processingStatus ProcessingStatus @default(PENDING)\n  processingError  String?\n  lastParsedAt     DateTime?\n\n  // Parsed content\n  rawText         String? @db.Text\n  markdownContent String? @db.Text\n\n  // RMS (Resume Metadata Standard) tracking\n  hasRMSMetadata Boolean @default(false)\n  rmsVersion     String?\n  rmsSchemaUrl   String? @default(\"https://github.com/rezi-io/resume-standard\")\n\n  createdAt    DateTime            @default(now())\n  updatedAt    DateTime            @updatedAt\n  applications JobApplication[]\n  enhancements ResumeEnhancement[]\n  template     ResumeTemplate?     @relation(fields: [templateId], references: [id])\n  user         User                @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([userId, isDefault])\n  @@index([templateId])\n  @@index([visibility])\n  @@index([aiEnhanced])\n  @@index([createdAt])\n  @@index([s3Key])\n  @@index([processingStatus])\n  @@index([hasRMSMetadata])\n  @@map(\"resumes\")\n}\n\nmodel ResumeEnhancement {\n  id              String          @id @default(uuid())\n  resumeId        String\n  templateId      String?\n  jobPostingId    String?\n  type            EnhancementType\n  description     String\n  originalContent Json\n  enhancedContent Json\n  changes         Json\n  aiModel         String?\n  prompt          String?\n  confidence      Float?\n  isApplied       Boolean         @default(false)\n  appliedAt       DateTime?\n  improvedMatch   Float?\n  successRate     Float?\n  createdAt       DateTime        @default(now())\n  updatedAt       DateTime        @updatedAt\n  jobPosting      JobPosting?     @relation(fields: [jobPostingId], references: [id])\n  resume          Resume          @relation(fields: [resumeId], references: [id], onDelete: Cascade)\n  template        ResumeTemplate? @relation(fields: [templateId], references: [id])\n\n  @@index([resumeId, type])\n  @@index([jobPostingId])\n  @@index([isApplied])\n  @@index([createdAt])\n  @@map(\"resume_enhancements\")\n}\n\nmodel JobApplication {\n  id                 String                   @id @default(uuid())\n  userId             String\n  jobPostingId       String\n  resumeId           String?\n  status             ApplicationStatus        @default(DRAFT)\n  priority           ApplicationPriority      @default(MEDIUM)\n  source             ApplicationSource        @default(MANUAL)\n  coverLetter        String?\n  customFields       Json?\n  notes              String?\n  customResume       Json?\n  resumeVersion      String?\n  appliedAt          DateTime?\n  viewedAt           DateTime?\n  responseAt         DateTime?\n  interviewAt        DateTime?\n  followUpAt         DateTime?\n  rejectedAt         DateTime?\n  acceptedAt         DateTime?\n  externalId         String?\n  atsUrl             String?\n  confirmationNumber String?\n  automationStatus   AutomationStatus?\n  automationAttempts Int                      @default(0)\n  automationData     Json?\n  lastAutomationAt   DateTime?\n  lastContactAt      DateTime?\n  contactMethod      String?\n  recruiterName      String?\n  recruiterEmail     String?\n  recruiterPhone     String?\n  responseTime       Int?\n  interviewCount     Int                      @default(0)\n  matchScore         Float?\n  appliedVia         String?\n  createdAt          DateTime                 @default(now())\n  updatedAt          DateTime                 @updatedAt\n  automationLogs     Json?\n  executionMode      ExecutionMode?           @default(DESKTOP)\n  proxyUsed          String?\n  serverIpAddress    String?\n  interactions       ApplicationInteraction[]\n  queueItems         ApplicationQueue[]\n  jobPosting         JobPosting               @relation(fields: [jobPostingId], references: [id], onDelete: Cascade)\n  resume             Resume?                  @relation(fields: [resumeId], references: [id])\n  user               User                     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([userId, jobPostingId])\n  @@index([userId, status])\n  @@index([status, priority])\n  @@index([appliedAt])\n  @@index([source])\n  @@index([automationStatus])\n  @@index([createdAt])\n  @@map(\"job_applications\")\n}\n\nmodel ApplicationInteraction {\n  id                String              @id @default(uuid())\n  applicationId     String\n  type              InteractionType\n  title             String\n  description       String?\n  outcome           InteractionOutcome?\n  contactPerson     String?\n  contactEmail      String?\n  contactPhone      String?\n  contactRole       String?\n  medium            String?\n  location          String?\n  duration          Int?\n  scheduledAt       DateTime?\n  startedAt         DateTime?\n  completedAt       DateTime?\n  rescheduledFrom   DateTime?\n  agenda            String?\n  notes             String?\n  feedback          String?\n  nextSteps         String?\n  attachments       Json?\n  requiresFollowUp  Boolean             @default(false)\n  followUpDate      DateTime?\n  followUpCompleted Boolean             @default(false)\n  metadata          Json?\n  createdAt         DateTime            @default(now())\n  updatedAt         DateTime            @updatedAt\n  application       JobApplication      @relation(fields: [applicationId], references: [id], onDelete: Cascade)\n\n  @@index([applicationId, type])\n  @@index([scheduledAt])\n  @@index([completedAt])\n  @@index([requiresFollowUp])\n  @@map(\"application_interactions\")\n}\n\nmodel SavedJob {\n  id              String           @id @default(uuid())\n  userId          String\n  jobPostingId    String\n  folder          String?\n  notes           String?\n  tags            String[]\n  priority        SavedJobPriority @default(MEDIUM)\n  alertOnUpdate   Boolean          @default(false)\n  alertOnDeadline Boolean          @default(false)\n  reminderDate    DateTime?\n  savedReason     String?\n  createdAt       DateTime         @default(now())\n  updatedAt       DateTime         @updatedAt\n  jobPosting      JobPosting       @relation(fields: [jobPostingId], references: [id], onDelete: Cascade)\n  user            User             @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([userId, jobPostingId])\n  @@index([userId, folder])\n  @@index([priority])\n  @@index([reminderDate])\n  @@map(\"saved_jobs\")\n}\n\nmodel Subscription {\n  id                   String             @id @default(uuid())\n  userId               String             @unique\n  plan                 SubscriptionPlan   @default(FREE)\n  status               SubscriptionStatus @default(ACTIVE)\n  stripeCustomerId     String?\n  stripeSubscriptionId String?\n  stripePriceId        String?\n  stripeProductId      String?\n  currentPeriodStart   DateTime?\n  currentPeriodEnd     DateTime?\n  cancelAtPeriodEnd    Boolean            @default(false)\n  canceledAt           DateTime?\n  cancelReason         String?\n  trialStart           DateTime?\n  trialEnd             DateTime?\n  trialUsed            Boolean            @default(false)\n  monthlyApplications  Int?\n  resumeTemplates      Int?\n  prioritySupport      Boolean            @default(false)\n  lastPaymentAt        DateTime?\n  lastPaymentAmount    Decimal?\n  nextBillingDate      DateTime?\n  promoCode            String?\n  discountPercent      Float?\n  discountEndsAt       DateTime?\n  createdAt            DateTime           @default(now())\n  updatedAt            DateTime           @updatedAt\n  billingHistory       BillingHistory[]\n  user                 User               @relation(fields: [userId], references: [id], onDelete: Cascade)\n  usageRecords         UsageRecord[]\n\n  @@index([plan, status])\n  @@index([stripeCustomerId])\n  @@index([nextBillingDate])\n  @@map(\"subscriptions\")\n}\n\nmodel BillingHistory {\n  id                    String        @id @default(uuid())\n  subscriptionId        String\n  amount                Decimal\n  currency              String        @default(\"USD\")\n  status                PaymentStatus\n  stripeInvoiceId       String?\n  stripePaymentIntentId String?\n  description           String?\n  invoiceUrl            String?\n  periodStart           DateTime\n  periodEnd             DateTime\n  metadata              Json?\n  createdAt             DateTime      @default(now())\n  updatedAt             DateTime      @updatedAt\n  subscription          Subscription  @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)\n\n  @@index([subscriptionId, status])\n  @@index([status, createdAt])\n  @@map(\"billing_history\")\n}\n\nmodel UsageRecord {\n  id             String        @id @default(uuid())\n  userId         String\n  subscriptionId String?\n  feature        UsageFeature\n  count          Int           @default(1)\n  metadata       Json?\n  sessionId      String?\n  deviceType     String?\n  ipAddress      String?\n  date           DateTime      @default(now()) @db.Date\n  hour           Int?\n  createdAt      DateTime      @default(now())\n  subscription   Subscription? @relation(fields: [subscriptionId], references: [id])\n  user           User          @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([userId, feature, date])\n  @@index([userId, feature])\n  @@index([feature, date])\n  @@index([subscriptionId])\n  @@map(\"usage_records\")\n}\n\nenum UserRole {\n  USER\n  PREMIUM_USER\n  ADMIN\n  SUPER_ADMIN\n  MODERATOR\n}\n\nenum UserStatus {\n  ACTIVE\n  INACTIVE\n  SUSPENDED\n  BANNED\n  PENDING_VERIFICATION\n  DELETED\n}\n\nenum ProfileVisibility {\n  PRIVATE\n  PUBLIC\n  CONNECTIONS_ONLY\n  RECRUITERS_ONLY\n}\n\nenum RemotePreference {\n  REMOTE_ONLY\n  HYBRID\n  ONSITE_ONLY\n  NO_PREFERENCE\n}\n\nenum JobType {\n  FULL_TIME\n  PART_TIME\n  CONTRACT\n  FREELANCE\n  INTERNSHIP\n  TEMPORARY\n  VOLUNTEER\n  APPRENTICESHIP\n}\n\nenum JobLevel {\n  ENTRY\n  JUNIOR\n  MID\n  SENIOR\n  LEAD\n  PRINCIPAL\n  STAFF\n  MANAGER\n  SENIOR_MANAGER\n  DIRECTOR\n  SENIOR_DIRECTOR\n  VP\n  SVP\n  C_LEVEL\n  FOUNDER\n}\n\nenum JobCategory {\n  TECHNOLOGY\n  ENGINEERING\n  DESIGN\n  PRODUCT\n  MARKETING\n  SALES\n  FINANCE\n  OPERATIONS\n  HUMAN_RESOURCES\n  LEGAL\n  CUSTOMER_SUCCESS\n  DATA_SCIENCE\n  HEALTHCARE\n  EDUCATION\n  CONSULTING\n  MANUFACTURING\n  RETAIL\n  HOSPITALITY\n  MEDIA\n  NON_PROFIT\n  GOVERNMENT\n  OTHER\n}\n\nenum RemoteType {\n  ONSITE\n  REMOTE\n  HYBRID\n  FLEXIBLE\n}\n\nenum SalaryType {\n  HOURLY\n  DAILY\n  WEEKLY\n  MONTHLY\n  ANNUAL\n  CONTRACT\n  COMMISSION\n}\n\nenum JobSource {\n  MANUAL\n  LINKEDIN\n  INDEED\n  GLASSDOOR\n  ANGELLIST\n  STACKOVERFLOW\n  DICE\n  MONSTER\n  ZIPRECRUITER\n  BUILTIN\n  FLEXJOBS\n  REMOTE_CO\n  WEWORKREMOTELY\n  COMPANY_WEBSITE\n  RECRUITER_OUTREACH\n  REFERRAL\n  OTHER\n}\n\nenum JobStatus {\n  ACTIVE\n  INACTIVE\n  EXPIRED\n  FILLED\n  ON_HOLD\n  CANCELLED\n  DRAFT\n}\n\nenum CompanySize {\n  STARTUP\n  SMALL\n  MEDIUM\n  LARGE\n  ENTERPRISE\n  UNKNOWN\n}\n\nenum CompanyStatus {\n  ACTIVE\n  INACTIVE\n  ACQUIRED\n  CLOSED\n  SUSPENDED\n}\n\nenum EmploymentType {\n  FULL_TIME\n  PART_TIME\n  CONTRACT\n  FREELANCE\n  INTERNSHIP\n  TEMPORARY\n}\n\nenum ApplicationStatus {\n  DRAFT\n  QUEUED\n  APPLYING\n  APPLIED\n  APPLICATION_ERROR\n  VIEWED\n  SCREENING\n  PHONE_SCREEN\n  INTERVIEW_SCHEDULED\n  FIRST_INTERVIEW\n  SECOND_INTERVIEW\n  FINAL_INTERVIEW\n  TECHNICAL_ASSESSMENT\n  TAKE_HOME_PROJECT\n  REFERENCE_CHECK\n  BACKGROUND_CHECK\n  OFFER_PENDING\n  OFFER_RECEIVED\n  OFFER_ACCEPTED\n  OFFER_DECLINED\n  REJECTED\n  WITHDRAWN\n  GHOSTED\n  ARCHIVED\n}\n\nenum ApplicationPriority {\n  LOW\n  MEDIUM\n  HIGH\n  URGENT\n  CRITICAL\n}\n\nenum ApplicationSource {\n  MANUAL\n  AUTOMATION\n  BULK_APPLY\n  REFERRAL\n  RECRUITER\n  COMPANY_OUTREACH\n}\n\nenum AutomationStatus {\n  NOT_AUTOMATED\n  QUEUED\n  IN_PROGRESS\n  WAITING_CAPTCHA\n  COMPLETED\n  FAILED\n  REQUIRES_MANUAL\n  CANCELLED\n}\n\nenum ExecutionMode {\n  SERVER\n  DESKTOP\n}\n\nenum ProxyType {\n  RESIDENTIAL\n  DATACENTER\n  MOBILE\n  STATIC\n  ROTATING\n}\n\nenum QueueStatus {\n  PENDING\n  QUEUED\n  PROCESSING\n  COMPLETED\n  FAILED\n  CANCELLED\n  RETRYING\n  PAUSED\n  REQUIRES_CAPTCHA\n}\n\nenum QueuePriority {\n  LOW\n  NORMAL\n  HIGH\n  URGENT\n  IMMEDIATE\n}\n\nenum InteractionType {\n  APPLICATION_SUBMITTED\n  EMAIL_RECEIVED\n  EMAIL_SENT\n  PHONE_CALL_INCOMING\n  PHONE_CALL_OUTGOING\n  VIDEO_CALL\n  IN_PERSON_MEETING\n  LINKEDIN_MESSAGE\n  TEXT_MESSAGE\n  RECRUITER_CONTACT\n  INTERVIEW_SCHEDULED\n  INTERVIEW_COMPLETED\n  ASSESSMENT_SENT\n  ASSESSMENT_COMPLETED\n  REFERENCE_REQUEST\n  BACKGROUND_CHECK\n  OFFER_RECEIVED\n  OFFER_NEGOTIATION\n  REJECTION_RECEIVED\n  FOLLOW_UP_SENT\n  THANK_YOU_SENT\n  WITHDRAWAL_SENT\n  STATUS_UPDATE\n  OTHER\n}\n\nenum InteractionOutcome {\n  POSITIVE\n  NEUTRAL\n  NEGATIVE\n  NO_RESPONSE\n  NEEDS_FOLLOW_UP\n  SCHEDULED_NEXT_STEP\n  OFFER_DISCUSSION\n  REJECTION\n  INTERVIEW_SCHEDULED\n  ASSESSMENT_REQUIRED\n  REFERENCES_REQUESTED\n  WITHDRAWN\n}\n\nenum TemplateCategory {\n  GENERAL\n  TECHNOLOGY\n  BUSINESS\n  CREATIVE\n  ACADEMIC\n  HEALTHCARE\n  ENGINEERING\n  SALES\n  MARKETING\n  FINANCE\n  LEGAL\n  EDUCATION\n  NON_PROFIT\n  EXECUTIVE\n  ENTRY_LEVEL\n  CAREER_CHANGE\n}\n\nenum ResumeVisibility {\n  PRIVATE\n  PUBLIC\n  RECRUITERS_ONLY\n  SHARED_LINK\n}\n\nenum ProcessingStatus {\n  PENDING // Upload received, not yet processed\n  PARSING // Extracting text and structure\n  PARSED // Successfully parsed\n  ENHANCING // AI enhancement in progress\n  ENHANCED // AI enhancement complete\n  FAILED // Processing failed\n  ERROR // Critical error occurred\n}\n\nenum EnhancementType {\n  KEYWORD_OPTIMIZATION\n  ATS_OPTIMIZATION\n  JOB_SPECIFIC_TAILORING\n  SKILL_HIGHLIGHTING\n  EXPERIENCE_ENHANCEMENT\n  SUMMARY_IMPROVEMENT\n  GRAMMAR_CHECK\n  FORMAT_OPTIMIZATION\n  LENGTH_OPTIMIZATION\n  IMPACT_ENHANCEMENT\n}\n\nenum SwipeDirection {\n  LEFT\n  RIGHT\n  SUPER_LIKE\n}\n\nenum SubscriptionPlan {\n  FREE\n  BASIC\n  PRO\n  PREMIUM\n  ENTERPRISE\n  CUSTOM\n}\n\nenum SubscriptionStatus {\n  ACTIVE\n  INACTIVE\n  PAST_DUE\n  CANCELLED\n  UNPAID\n  TRIALING\n  INCOMPLETE\n  INCOMPLETE_EXPIRED\n  PAUSED\n}\n\nenum PaymentStatus {\n  PENDING\n  SUCCEEDED\n  FAILED\n  CANCELLED\n  REFUNDED\n  DISPUTED\n  REQUIRES_ACTION\n}\n\nenum SavedJobPriority {\n  LOW\n  MEDIUM\n  HIGH\n  URGENT\n}\n\nenum UsageFeature {\n  JOB_SEARCH\n  JOB_VIEW\n  JOB_SWIPE\n  JOB_SAVE\n  APPLICATION_MANUAL\n  APPLICATION_AUTOMATION\n  RESUME_CREATION\n  RESUME_EDIT\n  RESUME_DOWNLOAD\n  RESUME_ENHANCEMENT\n  COVER_LETTER_GENERATION\n  TEMPLATE_USAGE\n  PROFILE_UPDATE\n  SEARCH_FILTER\n  NOTIFICATION_SENT\n  EMAIL_SENT\n  FILE_UPLOAD\n  FILE_DOWNLOAD\n  API_CALL\n  DESKTOP_APP_USAGE\n  MOBILE_APP_USAGE\n  WEB_APP_USAGE\n  ANALYTICS_EVENT\n  AUDIT_LOG_ENTRY\n}\n\nenum NotificationType {\n  JOB_MATCH\n  APPLICATION_UPDATE\n  INTERVIEW_REMINDER\n  DEADLINE_REMINDER\n  NEW_MESSAGE\n  SYSTEM_NOTIFICATION\n  BILLING_NOTIFICATION\n  SECURITY_ALERT\n  FEATURE_ANNOUNCEMENT\n  WEEKLY_DIGEST\n  REFERRAL_BONUS\n  ACHIEVEMENT_UNLOCKED\n  SUBSCRIPTION_EXPIRING\n  PAYMENT_FAILED\n  ACCOUNT_SUSPENDED\n  DATA_EXPORT_READY\n  PROFILE_INCOMPLETE\n  RESUME_FEEDBACK\n  JOB_RECOMMENDATION\n  COMPANY_UPDATE\n}\n\nenum NotificationChannel {\n  IN_APP\n  EMAIL\n  SMS\n  PUSH\n  SLACK\n  WEBHOOK\n}\n\nenum NotificationPriority {\n  LOW\n  NORMAL\n  HIGH\n  URGENT\n  CRITICAL\n}\n\nenum NotificationStatus {\n  UNREAD\n  READ\n  CLICKED\n  DISMISSED\n  EXPIRED\n  FAILED\n}\n\nenum SettingType {\n  STRING\n  NUMBER\n  BOOLEAN\n  JSON\n  ARRAY\n  URL\n  EMAIL\n  PASSWORD\n  ENCRYPTED\n}\n\nenum ActorType {\n  USER\n  ADMIN\n  SYSTEM\n  API_KEY\n  SERVICE_ACCOUNT\n  AUTOMATION\n  WEBHOOK\n}\n\nenum RiskLevel {\n  LOW\n  MEDIUM\n  HIGH\n  CRITICAL\n}\n\nenum LogLevel {\n  DEBUG\n  INFO\n  WARN\n  ERROR\n  CRITICAL\n}\n",
  "inlineSchemaHash": "03d13964c1b5abf10c4076982e65246ed4fe34677bb65b2420cdd71d67c09c58",
  "copyEngine": true
}
config.dirname = '/'

config.runtimeDataModel = JSON.parse("{\"models\":{\"User\":{\"dbName\":\"users\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"email\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"passwordHash\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"avatar\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"emailVerified\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"role\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"UserRole\",\"default\":\"USER\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"UserStatus\",\"default\":\"ACTIVE\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastLoginAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"loginAttempts\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lockedUntil\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dataConsent\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"consentDate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dataRetentionUntil\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isDeleted\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deletedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"onboardingCompleted\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"onboardingProgress\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"onboardingStep\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":1,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"onboardingStartedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"onboardingCompletedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ipAddress\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userAgent\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"timezone\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"locale\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"en\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"oauthProviders\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"primaryAuthProvider\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"accounts\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Account\",\"relationName\":\"AccountToUser\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"analyticsEvents\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"AnalyticsEvent\",\"relationName\":\"AnalyticsEventToUser\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"applicationQueue\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ApplicationQueue\",\"relationName\":\"ApplicationQueueToUser\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"auditLogs\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"AuditLog\",\"relationName\":\"AuditLogToUser\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"companyReviews\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"CompanyReview\",\"relationName\":\"CompanyReviewToUser\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"applications\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"JobApplication\",\"relationName\":\"JobApplicationToUser\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"resumes\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Resume\",\"relationName\":\"ResumeToUser\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"savedJobs\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"SavedJob\",\"relationName\":\"SavedJobToUser\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sessions\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Session\",\"relationName\":\"SessionToUser\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"subscription\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Subscription\",\"relationName\":\"SubscriptionToUser\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"usageRecords\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UsageRecord\",\"relationName\":\"UsageRecordToUser\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"jobSwipes\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserJobSwipe\",\"relationName\":\"UserToUserJobSwipe\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"notifications\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserNotification\",\"relationName\":\"UserToUserNotification\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"preferences\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserPreferences\",\"relationName\":\"UserToUserPreferences\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"profile\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserProfile\",\"relationName\":\"UserToUserProfile\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"UserProfile\":{\"dbName\":\"user_profiles\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"firstName\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastName\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"displayName\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"phone\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dateOfBirth\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"gender\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"address\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"city\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"state\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"country\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"postalCode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"location\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"website\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"linkedin\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"github\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"portfolio\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"blog\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bio\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"headline\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"summary\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"currentTitle\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"currentCompany\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"experienceLevel\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"yearsOfExperience\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"skills\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"certifications\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"languages\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"education\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"desiredJobTypes\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"desiredSalaryMin\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"desiredSalaryMax\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"preferredCurrency\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"willingToRelocate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"needsVisaSponsorship\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"profileVisibility\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"ProfileVisibility\",\"default\":\"PRIVATE\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"showEmail\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"showPhone\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"automationPreferences\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"coverLetterTemplate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"workAuthorization\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"UserToUserProfile\",\"relationFromFields\":[\"userId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"UserPreferences\":{\"dbName\":\"user_preferences\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"jobSearchRadius\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":50,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"jobTypes\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"experienceLevels\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"industries\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"companyTypes\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"remotePref\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"RemotePreference\",\"default\":\"NO_PREFERENCE\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"emailNotifications\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pushNotifications\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"smsNotifications\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"newJobMatches\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"applicationUpdates\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"interviewReminders\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"weeklyDigest\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"promotionalEmails\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"autoApplyEnabled\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"autoApplyJobTypes\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"autoApplyMaxPerDay\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":5,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"autoApplyRequireMatch\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dataProcessingConsent\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"marketingConsent\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"analyticsConsent\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"thirdPartySharing\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"theme\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"light\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"language\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"en\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"timezone\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dateFormat\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"MM/DD/YYYY\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"UserToUserPreferences\",\"relationFromFields\":[\"userId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Account\":{\"dbName\":\"accounts\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"provider\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"providerAccountId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"refresh_token\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"access_token\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"expires_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"token_type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"scope\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_token\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"session_state\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"AccountToUser\",\"relationFromFields\":[\"userId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"provider\",\"providerAccountId\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"provider\",\"providerAccountId\"]}],\"isGenerated\":false},\"Session\":{\"dbName\":\"sessions\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sessionToken\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"expires\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"SessionToUser\",\"relationFromFields\":[\"userId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"VerificationToken\":{\"dbName\":\"verification_tokens\",\"fields\":[{\"name\":\"identifier\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"token\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"expires\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"identifier\",\"token\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"identifier\",\"token\"]}],\"isGenerated\":false},\"OAuthState\":{\"dbName\":\"oauth_states\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"state\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"codeVerifier\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"provider\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"redirectUri\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"source\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"metadata\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"expiresAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"UserJobSwipe\":{\"dbName\":\"user_job_swipes\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"jobPostingId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"direction\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"SwipeDirection\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"confidence\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deviceType\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sessionId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"position\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"timeSpent\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"matchScore\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"matchFactors\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userFeedback\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isCorrectMatch\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ipAddress\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userAgent\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"location\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"jobPosting\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"JobPosting\",\"relationName\":\"JobPostingToUserJobSwipe\",\"relationFromFields\":[\"jobPostingId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"UserToUserJobSwipe\",\"relationFromFields\":[\"userId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"userId\",\"jobPostingId\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"userId\",\"jobPostingId\"]}],\"isGenerated\":false},\"ApplicationQueue\":{\"dbName\":\"application_queue\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"jobPostingId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"applicationId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"QueueStatus\",\"default\":\"PENDING\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"priority\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"QueuePriority\",\"default\":\"NORMAL\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"attempts\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"maxAttempts\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":3,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"scheduledAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"startedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"completedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"failedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nextRetryAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"useCustomResume\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"resumeId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"coverLetter\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"customFields\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"automationConfig\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"requiresCaptcha\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"captchaSolved\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"success\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"errorMessage\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"errorType\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"responseData\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"desktopSessionId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"claimedBy\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"claimedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"application\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"JobApplication\",\"relationName\":\"ApplicationQueueToJobApplication\",\"relationFromFields\":[\"applicationId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"jobPosting\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"JobPosting\",\"relationName\":\"ApplicationQueueToJobPosting\",\"relationFromFields\":[\"jobPostingId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"ApplicationQueueToUser\",\"relationFromFields\":[\"userId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"automationLogs\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"AutomationLog\",\"relationName\":\"ApplicationQueueToAutomationLog\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"jobSnapshot\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"JobSnapshot\",\"relationName\":\"ApplicationQueueToJobSnapshot\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"AutomationLog\":{\"dbName\":\"automation_logs\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"queueId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"level\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"LogLevel\",\"default\":\"INFO\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"message\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"details\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"step\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"elementSelector\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"action\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"errorType\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"stackTrace\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"screenshot\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"executionTime\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"memoryUsage\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"browserInfo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pageUrl\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"queue\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ApplicationQueue\",\"relationName\":\"ApplicationQueueToAutomationLog\",\"relationFromFields\":[\"queueId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"AutomationProxy\":{\"dbName\":\"automation_proxies\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"host\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"port\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"username\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"password\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"proxyType\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"ProxyType\",\"default\":\"RESIDENTIAL\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"provider\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"country\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"region\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isActive\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"failureCount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"successRate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Float\",\"default\":100,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastUsedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastCheckedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"requestsPerHour\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":100,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dailyLimit\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":1000,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"currentHourlyUsage\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"currentDailyUsage\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"avgResponseTime\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"uptime\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"costPerRequest\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"monthlyLimit\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"notes\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tags\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"AuditLog\":{\"dbName\":\"audit_logs\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"actorType\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"ActorType\",\"default\":\"USER\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"actorId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"action\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"resource\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"resourceId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"method\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"endpoint\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"statusCode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ipAddress\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userAgent\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sessionId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"oldValues\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"newValues\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"riskLevel\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"RiskLevel\",\"default\":\"LOW\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"riskFactors\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dataCategory\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"legalBasis\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"metadata\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tags\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"AuditLogToUser\",\"relationFromFields\":[\"userId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"AnalyticsEvent\":{\"dbName\":\"analytics_events\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"eventType\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"eventCategory\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"eventName\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"properties\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"traits\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sessionId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deviceType\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"platform\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ipAddress\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"country\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"region\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"city\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userAgent\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"referrer\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pageUrl\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"revenue\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"currency\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"timestamp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"processingTime\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"AnalyticsEventToUser\",\"relationFromFields\":[\"userId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"UserNotification\":{\"dbName\":\"user_notifications\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"NotificationType\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"title\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"message\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"actionUrl\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"channel\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"NotificationChannel\",\"default\":\"IN_APP\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"priority\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"NotificationPriority\",\"default\":\"NORMAL\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"NotificationStatus\",\"default\":\"UNREAD\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"readAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"clickedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sentAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deliveredAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"failedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"errorMessage\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"metadata\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"templateId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"scheduledFor\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"expiresAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"UserToUserNotification\",\"relationFromFields\":[\"userId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"SystemSetting\":{\"dbName\":\"system_settings\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"key\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"value\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"SettingType\",\"default\":\"STRING\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"category\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"general\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isPublic\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isEncrypted\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"validationRule\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"defaultValue\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"updatedBy\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"NotificationTemplate\":{\"dbName\":\"notification_templates\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"NotificationType\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"subject\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"title\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"body\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"htmlBody\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"channel\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"NotificationChannel\",\"default\":\"IN_APP\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isActive\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"variables\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"conditions\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"category\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tags\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Company\":{\"dbName\":\"companies\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"slug\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"website\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"logo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"industry\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"size\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"CompanySize\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"headquarters\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"locations\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"country\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"foundedYear\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"employeeCount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"revenue\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fundingStage\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"linkedinUrl\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"glassdoorUrl\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"crunchbaseUrl\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"twitterUrl\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"facebookUrl\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"benefits\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cultureValues\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"workEnvironment\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isVerified\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"verifiedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"verificationSource\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"qualityScore\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"keywords\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tags\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"CompanyStatus\",\"default\":\"ACTIVE\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isBlacklisted\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"blacklistReason\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"companyReviews\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"CompanyReview\",\"relationName\":\"CompanyToCompanyReview\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"jobPostings\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"JobPosting\",\"relationName\":\"CompanyToJobPosting\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"CompanyReview\":{\"dbName\":\"company_reviews\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"companyId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"title\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"content\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"rating\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"workLifeBalance\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"compensation\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"culture\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"management\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"careerGrowth\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"jobTitle\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"department\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"employmentType\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"EmploymentType\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"workDuration\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isApproved\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isAnonymous\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isVerified\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"helpfulVotes\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"reportCount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"company\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Company\",\"relationName\":\"CompanyToCompanyReview\",\"relationFromFields\":[\"companyId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"CompanyReviewToUser\",\"relationFromFields\":[\"userId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"JobPosting\":{\"dbName\":\"job_postings\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"title\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"requirements\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"benefits\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"JobType\",\"default\":\"FULL_TIME\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"level\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"JobLevel\",\"default\":\"MID\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"department\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"category\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"JobCategory\",\"default\":\"OTHER\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"remote\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"remoteType\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"RemoteType\",\"default\":\"ONSITE\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"location\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"timeZone\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"city\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"state\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"country\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"coordinates\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"salaryMin\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"salaryMax\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"currency\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"USD\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"salaryType\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"SalaryType\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"equity\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bonus\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"experienceYears\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"skills\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"education\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"languages\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"companyId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"externalId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"source\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"JobSource\",\"default\":\"MANUAL\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sourceUrl\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"applyUrl\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"keywords\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tags\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"qualityScore\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isVerified\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"verifiedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"JobStatus\",\"default\":\"ACTIVE\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isActive\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isFeatured\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isUrgent\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"postedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"expiresAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastScrapedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"viewCount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"applicationCount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"rightSwipeCount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"leftSwipeCount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"greenhouseCompanyId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"greenhouseJobId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"applicationSchema\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"formMetadata\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"automationFeasibility\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"estimatedSuccessRate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"prefilledFieldCount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"aiRequiredFieldCount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"totalRequiredFields\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastSchemaUpdate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"schemaVersion\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"1.0\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"queueItems\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ApplicationQueue\",\"relationName\":\"ApplicationQueueToJobPosting\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"applications\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"JobApplication\",\"relationName\":\"JobApplicationToJobPosting\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"company\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Company\",\"relationName\":\"CompanyToJobPosting\",\"relationFromFields\":[\"companyId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"snapshots\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"JobSnapshot\",\"relationName\":\"JobPostingToJobSnapshot\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"enhancements\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ResumeEnhancement\",\"relationName\":\"JobPostingToResumeEnhancement\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"savedBy\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"SavedJob\",\"relationName\":\"JobPostingToSavedJob\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"swipes\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserJobSwipe\",\"relationName\":\"JobPostingToUserJobSwipe\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"greenhouseCompanyId\",\"greenhouseJobId\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"greenhouseCompanyId\",\"greenhouseJobId\"]}],\"isGenerated\":false},\"JobSnapshot\":{\"dbName\":\"job_snapshots\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"originalJobId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"applicationQueueId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"title\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"requirements\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"benefits\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"level\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"department\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"category\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"remote\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"remoteType\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"location\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"timeZone\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"city\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"state\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"country\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"coordinates\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"salaryMin\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"salaryMax\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"currency\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"salaryType\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"equity\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bonus\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"experienceYears\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"skills\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"education\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"languages\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"companyName\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"companyLogo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"companyWebsite\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"companyIndustry\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"companySize\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"companyDescription\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"externalId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"source\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sourceUrl\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"applyUrl\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"qualityScore\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isVerified\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"originalStatus\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isActive\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isFeatured\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isUrgent\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"originalPostedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"originalExpiresAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"viewCount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"applicationCount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"rightSwipeCount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"leftSwipeCount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"snapshotVersion\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"1.0\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"snapshotReason\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"USER_SWIPE_RIGHT\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"applicationQueue\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ApplicationQueue\",\"relationName\":\"ApplicationQueueToJobSnapshot\",\"relationFromFields\":[\"applicationQueueId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"originalJob\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"JobPosting\",\"relationName\":\"JobPostingToJobSnapshot\",\"relationFromFields\":[\"originalJobId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"ResumeTemplate\":{\"dbName\":\"resume_templates\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"category\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"TemplateCategory\",\"default\":\"GENERAL\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"content\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sections\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"styling\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"preview\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"thumbnails\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"industry\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"experience\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"jobTypes\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"qualityScore\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"downloads\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ratings\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ratingCount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isActive\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isPremium\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isPublic\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tags\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"keywords\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"usageCount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"successRate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"createdBy\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"enhancements\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ResumeEnhancement\",\"relationName\":\"ResumeEnhancementToResumeTemplate\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"resumes\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Resume\",\"relationName\":\"ResumeToResumeTemplate\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Resume\":{\"dbName\":\"resumes\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"templateId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"title\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"content\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sections\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"metadata\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pdfUrl\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"docxUrl\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"htmlUrl\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fileSize\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pageCount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastGenerated\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"version\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":1,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"parentResumeId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isDefault\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"visibility\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"ResumeVisibility\",\"default\":\"PRIVATE\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"shareToken\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"viewCount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"downloadCount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"applicationCount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"aiEnhanced\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"enhancementData\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"completeness\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"readabilityScore\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"keywordMatch\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"s3Key\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"s3Bucket\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"s3Region\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"originalFileName\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"processingStatus\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"ProcessingStatus\",\"default\":\"PENDING\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"processingError\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastParsedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"rawText\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"markdownContent\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"hasRMSMetadata\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"rmsVersion\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"rmsSchemaUrl\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"https://github.com/rezi-io/resume-standard\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"applications\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"JobApplication\",\"relationName\":\"JobApplicationToResume\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"enhancements\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ResumeEnhancement\",\"relationName\":\"ResumeToResumeEnhancement\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"template\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ResumeTemplate\",\"relationName\":\"ResumeToResumeTemplate\",\"relationFromFields\":[\"templateId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"ResumeToUser\",\"relationFromFields\":[\"userId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"ResumeEnhancement\":{\"dbName\":\"resume_enhancements\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"resumeId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"templateId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"jobPostingId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"EnhancementType\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"originalContent\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"enhancedContent\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"changes\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"aiModel\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"prompt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"confidence\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isApplied\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"appliedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"improvedMatch\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"successRate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"jobPosting\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"JobPosting\",\"relationName\":\"JobPostingToResumeEnhancement\",\"relationFromFields\":[\"jobPostingId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"resume\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Resume\",\"relationName\":\"ResumeToResumeEnhancement\",\"relationFromFields\":[\"resumeId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"template\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ResumeTemplate\",\"relationName\":\"ResumeEnhancementToResumeTemplate\",\"relationFromFields\":[\"templateId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"JobApplication\":{\"dbName\":\"job_applications\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"jobPostingId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"resumeId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"ApplicationStatus\",\"default\":\"DRAFT\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"priority\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"ApplicationPriority\",\"default\":\"MEDIUM\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"source\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"ApplicationSource\",\"default\":\"MANUAL\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"coverLetter\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"customFields\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"notes\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"customResume\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"resumeVersion\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"appliedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"viewedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"responseAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"interviewAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"followUpAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"rejectedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"acceptedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"externalId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"atsUrl\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"confirmationNumber\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"automationStatus\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"AutomationStatus\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"automationAttempts\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"automationData\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastAutomationAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastContactAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"contactMethod\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"recruiterName\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"recruiterEmail\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"recruiterPhone\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"responseTime\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"interviewCount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"matchScore\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"appliedVia\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"automationLogs\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"executionMode\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"ExecutionMode\",\"default\":\"DESKTOP\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"proxyUsed\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"serverIpAddress\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"interactions\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ApplicationInteraction\",\"relationName\":\"ApplicationInteractionToJobApplication\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"queueItems\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ApplicationQueue\",\"relationName\":\"ApplicationQueueToJobApplication\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"jobPosting\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"JobPosting\",\"relationName\":\"JobApplicationToJobPosting\",\"relationFromFields\":[\"jobPostingId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"resume\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Resume\",\"relationName\":\"JobApplicationToResume\",\"relationFromFields\":[\"resumeId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"JobApplicationToUser\",\"relationFromFields\":[\"userId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"userId\",\"jobPostingId\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"userId\",\"jobPostingId\"]}],\"isGenerated\":false},\"ApplicationInteraction\":{\"dbName\":\"application_interactions\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"applicationId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"InteractionType\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"title\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"outcome\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"InteractionOutcome\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"contactPerson\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"contactEmail\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"contactPhone\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"contactRole\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"medium\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"location\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"duration\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"scheduledAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"startedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"completedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"rescheduledFrom\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"agenda\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"notes\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"feedback\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nextSteps\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"attachments\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"requiresFollowUp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"followUpDate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"followUpCompleted\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"metadata\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"application\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"JobApplication\",\"relationName\":\"ApplicationInteractionToJobApplication\",\"relationFromFields\":[\"applicationId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"SavedJob\":{\"dbName\":\"saved_jobs\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"jobPostingId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"folder\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"notes\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tags\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"priority\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"SavedJobPriority\",\"default\":\"MEDIUM\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"alertOnUpdate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"alertOnDeadline\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"reminderDate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"savedReason\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"jobPosting\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"JobPosting\",\"relationName\":\"JobPostingToSavedJob\",\"relationFromFields\":[\"jobPostingId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"SavedJobToUser\",\"relationFromFields\":[\"userId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"userId\",\"jobPostingId\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"userId\",\"jobPostingId\"]}],\"isGenerated\":false},\"Subscription\":{\"dbName\":\"subscriptions\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"plan\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"SubscriptionPlan\",\"default\":\"FREE\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"SubscriptionStatus\",\"default\":\"ACTIVE\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"stripeCustomerId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"stripeSubscriptionId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"stripePriceId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"stripeProductId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"currentPeriodStart\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"currentPeriodEnd\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cancelAtPeriodEnd\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"canceledAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cancelReason\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"trialStart\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"trialEnd\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"trialUsed\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"monthlyApplications\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"resumeTemplates\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"prioritySupport\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastPaymentAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastPaymentAmount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nextBillingDate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"promoCode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"discountPercent\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"discountEndsAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"billingHistory\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"BillingHistory\",\"relationName\":\"BillingHistoryToSubscription\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"SubscriptionToUser\",\"relationFromFields\":[\"userId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"usageRecords\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UsageRecord\",\"relationName\":\"SubscriptionToUsageRecord\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"BillingHistory\":{\"dbName\":\"billing_history\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"subscriptionId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"amount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"currency\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"USD\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"PaymentStatus\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"stripeInvoiceId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"stripePaymentIntentId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"invoiceUrl\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"periodStart\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"periodEnd\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"metadata\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"subscription\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Subscription\",\"relationName\":\"BillingHistoryToSubscription\",\"relationFromFields\":[\"subscriptionId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"UsageRecord\":{\"dbName\":\"usage_records\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"subscriptionId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"feature\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UsageFeature\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"count\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":1,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"metadata\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sessionId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deviceType\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ipAddress\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"date\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"hour\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"subscription\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Subscription\",\"relationName\":\"SubscriptionToUsageRecord\",\"relationFromFields\":[\"subscriptionId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"UsageRecordToUser\",\"relationFromFields\":[\"userId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"userId\",\"feature\",\"date\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"userId\",\"feature\",\"date\"]}],\"isGenerated\":false}},\"enums\":{\"UserRole\":{\"values\":[{\"name\":\"USER\",\"dbName\":null},{\"name\":\"PREMIUM_USER\",\"dbName\":null},{\"name\":\"ADMIN\",\"dbName\":null},{\"name\":\"SUPER_ADMIN\",\"dbName\":null},{\"name\":\"MODERATOR\",\"dbName\":null}],\"dbName\":null},\"UserStatus\":{\"values\":[{\"name\":\"ACTIVE\",\"dbName\":null},{\"name\":\"INACTIVE\",\"dbName\":null},{\"name\":\"SUSPENDED\",\"dbName\":null},{\"name\":\"BANNED\",\"dbName\":null},{\"name\":\"PENDING_VERIFICATION\",\"dbName\":null},{\"name\":\"DELETED\",\"dbName\":null}],\"dbName\":null},\"ProfileVisibility\":{\"values\":[{\"name\":\"PRIVATE\",\"dbName\":null},{\"name\":\"PUBLIC\",\"dbName\":null},{\"name\":\"CONNECTIONS_ONLY\",\"dbName\":null},{\"name\":\"RECRUITERS_ONLY\",\"dbName\":null}],\"dbName\":null},\"RemotePreference\":{\"values\":[{\"name\":\"REMOTE_ONLY\",\"dbName\":null},{\"name\":\"HYBRID\",\"dbName\":null},{\"name\":\"ONSITE_ONLY\",\"dbName\":null},{\"name\":\"NO_PREFERENCE\",\"dbName\":null}],\"dbName\":null},\"JobType\":{\"values\":[{\"name\":\"FULL_TIME\",\"dbName\":null},{\"name\":\"PART_TIME\",\"dbName\":null},{\"name\":\"CONTRACT\",\"dbName\":null},{\"name\":\"FREELANCE\",\"dbName\":null},{\"name\":\"INTERNSHIP\",\"dbName\":null},{\"name\":\"TEMPORARY\",\"dbName\":null},{\"name\":\"VOLUNTEER\",\"dbName\":null},{\"name\":\"APPRENTICESHIP\",\"dbName\":null}],\"dbName\":null},\"JobLevel\":{\"values\":[{\"name\":\"ENTRY\",\"dbName\":null},{\"name\":\"JUNIOR\",\"dbName\":null},{\"name\":\"MID\",\"dbName\":null},{\"name\":\"SENIOR\",\"dbName\":null},{\"name\":\"LEAD\",\"dbName\":null},{\"name\":\"PRINCIPAL\",\"dbName\":null},{\"name\":\"STAFF\",\"dbName\":null},{\"name\":\"MANAGER\",\"dbName\":null},{\"name\":\"SENIOR_MANAGER\",\"dbName\":null},{\"name\":\"DIRECTOR\",\"dbName\":null},{\"name\":\"SENIOR_DIRECTOR\",\"dbName\":null},{\"name\":\"VP\",\"dbName\":null},{\"name\":\"SVP\",\"dbName\":null},{\"name\":\"C_LEVEL\",\"dbName\":null},{\"name\":\"FOUNDER\",\"dbName\":null}],\"dbName\":null},\"JobCategory\":{\"values\":[{\"name\":\"TECHNOLOGY\",\"dbName\":null},{\"name\":\"ENGINEERING\",\"dbName\":null},{\"name\":\"DESIGN\",\"dbName\":null},{\"name\":\"PRODUCT\",\"dbName\":null},{\"name\":\"MARKETING\",\"dbName\":null},{\"name\":\"SALES\",\"dbName\":null},{\"name\":\"FINANCE\",\"dbName\":null},{\"name\":\"OPERATIONS\",\"dbName\":null},{\"name\":\"HUMAN_RESOURCES\",\"dbName\":null},{\"name\":\"LEGAL\",\"dbName\":null},{\"name\":\"CUSTOMER_SUCCESS\",\"dbName\":null},{\"name\":\"DATA_SCIENCE\",\"dbName\":null},{\"name\":\"HEALTHCARE\",\"dbName\":null},{\"name\":\"EDUCATION\",\"dbName\":null},{\"name\":\"CONSULTING\",\"dbName\":null},{\"name\":\"MANUFACTURING\",\"dbName\":null},{\"name\":\"RETAIL\",\"dbName\":null},{\"name\":\"HOSPITALITY\",\"dbName\":null},{\"name\":\"MEDIA\",\"dbName\":null},{\"name\":\"NON_PROFIT\",\"dbName\":null},{\"name\":\"GOVERNMENT\",\"dbName\":null},{\"name\":\"OTHER\",\"dbName\":null}],\"dbName\":null},\"RemoteType\":{\"values\":[{\"name\":\"ONSITE\",\"dbName\":null},{\"name\":\"REMOTE\",\"dbName\":null},{\"name\":\"HYBRID\",\"dbName\":null},{\"name\":\"FLEXIBLE\",\"dbName\":null}],\"dbName\":null},\"SalaryType\":{\"values\":[{\"name\":\"HOURLY\",\"dbName\":null},{\"name\":\"DAILY\",\"dbName\":null},{\"name\":\"WEEKLY\",\"dbName\":null},{\"name\":\"MONTHLY\",\"dbName\":null},{\"name\":\"ANNUAL\",\"dbName\":null},{\"name\":\"CONTRACT\",\"dbName\":null},{\"name\":\"COMMISSION\",\"dbName\":null}],\"dbName\":null},\"JobSource\":{\"values\":[{\"name\":\"MANUAL\",\"dbName\":null},{\"name\":\"LINKEDIN\",\"dbName\":null},{\"name\":\"INDEED\",\"dbName\":null},{\"name\":\"GLASSDOOR\",\"dbName\":null},{\"name\":\"ANGELLIST\",\"dbName\":null},{\"name\":\"STACKOVERFLOW\",\"dbName\":null},{\"name\":\"DICE\",\"dbName\":null},{\"name\":\"MONSTER\",\"dbName\":null},{\"name\":\"ZIPRECRUITER\",\"dbName\":null},{\"name\":\"BUILTIN\",\"dbName\":null},{\"name\":\"FLEXJOBS\",\"dbName\":null},{\"name\":\"REMOTE_CO\",\"dbName\":null},{\"name\":\"WEWORKREMOTELY\",\"dbName\":null},{\"name\":\"COMPANY_WEBSITE\",\"dbName\":null},{\"name\":\"RECRUITER_OUTREACH\",\"dbName\":null},{\"name\":\"REFERRAL\",\"dbName\":null},{\"name\":\"OTHER\",\"dbName\":null}],\"dbName\":null},\"JobStatus\":{\"values\":[{\"name\":\"ACTIVE\",\"dbName\":null},{\"name\":\"INACTIVE\",\"dbName\":null},{\"name\":\"EXPIRED\",\"dbName\":null},{\"name\":\"FILLED\",\"dbName\":null},{\"name\":\"ON_HOLD\",\"dbName\":null},{\"name\":\"CANCELLED\",\"dbName\":null},{\"name\":\"DRAFT\",\"dbName\":null}],\"dbName\":null},\"CompanySize\":{\"values\":[{\"name\":\"STARTUP\",\"dbName\":null},{\"name\":\"SMALL\",\"dbName\":null},{\"name\":\"MEDIUM\",\"dbName\":null},{\"name\":\"LARGE\",\"dbName\":null},{\"name\":\"ENTERPRISE\",\"dbName\":null},{\"name\":\"UNKNOWN\",\"dbName\":null}],\"dbName\":null},\"CompanyStatus\":{\"values\":[{\"name\":\"ACTIVE\",\"dbName\":null},{\"name\":\"INACTIVE\",\"dbName\":null},{\"name\":\"ACQUIRED\",\"dbName\":null},{\"name\":\"CLOSED\",\"dbName\":null},{\"name\":\"SUSPENDED\",\"dbName\":null}],\"dbName\":null},\"EmploymentType\":{\"values\":[{\"name\":\"FULL_TIME\",\"dbName\":null},{\"name\":\"PART_TIME\",\"dbName\":null},{\"name\":\"CONTRACT\",\"dbName\":null},{\"name\":\"FREELANCE\",\"dbName\":null},{\"name\":\"INTERNSHIP\",\"dbName\":null},{\"name\":\"TEMPORARY\",\"dbName\":null}],\"dbName\":null},\"ApplicationStatus\":{\"values\":[{\"name\":\"DRAFT\",\"dbName\":null},{\"name\":\"QUEUED\",\"dbName\":null},{\"name\":\"APPLYING\",\"dbName\":null},{\"name\":\"APPLIED\",\"dbName\":null},{\"name\":\"APPLICATION_ERROR\",\"dbName\":null},{\"name\":\"VIEWED\",\"dbName\":null},{\"name\":\"SCREENING\",\"dbName\":null},{\"name\":\"PHONE_SCREEN\",\"dbName\":null},{\"name\":\"INTERVIEW_SCHEDULED\",\"dbName\":null},{\"name\":\"FIRST_INTERVIEW\",\"dbName\":null},{\"name\":\"SECOND_INTERVIEW\",\"dbName\":null},{\"name\":\"FINAL_INTERVIEW\",\"dbName\":null},{\"name\":\"TECHNICAL_ASSESSMENT\",\"dbName\":null},{\"name\":\"TAKE_HOME_PROJECT\",\"dbName\":null},{\"name\":\"REFERENCE_CHECK\",\"dbName\":null},{\"name\":\"BACKGROUND_CHECK\",\"dbName\":null},{\"name\":\"OFFER_PENDING\",\"dbName\":null},{\"name\":\"OFFER_RECEIVED\",\"dbName\":null},{\"name\":\"OFFER_ACCEPTED\",\"dbName\":null},{\"name\":\"OFFER_DECLINED\",\"dbName\":null},{\"name\":\"REJECTED\",\"dbName\":null},{\"name\":\"WITHDRAWN\",\"dbName\":null},{\"name\":\"GHOSTED\",\"dbName\":null},{\"name\":\"ARCHIVED\",\"dbName\":null}],\"dbName\":null},\"ApplicationPriority\":{\"values\":[{\"name\":\"LOW\",\"dbName\":null},{\"name\":\"MEDIUM\",\"dbName\":null},{\"name\":\"HIGH\",\"dbName\":null},{\"name\":\"URGENT\",\"dbName\":null},{\"name\":\"CRITICAL\",\"dbName\":null}],\"dbName\":null},\"ApplicationSource\":{\"values\":[{\"name\":\"MANUAL\",\"dbName\":null},{\"name\":\"AUTOMATION\",\"dbName\":null},{\"name\":\"BULK_APPLY\",\"dbName\":null},{\"name\":\"REFERRAL\",\"dbName\":null},{\"name\":\"RECRUITER\",\"dbName\":null},{\"name\":\"COMPANY_OUTREACH\",\"dbName\":null}],\"dbName\":null},\"AutomationStatus\":{\"values\":[{\"name\":\"NOT_AUTOMATED\",\"dbName\":null},{\"name\":\"QUEUED\",\"dbName\":null},{\"name\":\"IN_PROGRESS\",\"dbName\":null},{\"name\":\"WAITING_CAPTCHA\",\"dbName\":null},{\"name\":\"COMPLETED\",\"dbName\":null},{\"name\":\"FAILED\",\"dbName\":null},{\"name\":\"REQUIRES_MANUAL\",\"dbName\":null},{\"name\":\"CANCELLED\",\"dbName\":null}],\"dbName\":null},\"ExecutionMode\":{\"values\":[{\"name\":\"SERVER\",\"dbName\":null},{\"name\":\"DESKTOP\",\"dbName\":null}],\"dbName\":null},\"ProxyType\":{\"values\":[{\"name\":\"RESIDENTIAL\",\"dbName\":null},{\"name\":\"DATACENTER\",\"dbName\":null},{\"name\":\"MOBILE\",\"dbName\":null},{\"name\":\"STATIC\",\"dbName\":null},{\"name\":\"ROTATING\",\"dbName\":null}],\"dbName\":null},\"QueueStatus\":{\"values\":[{\"name\":\"PENDING\",\"dbName\":null},{\"name\":\"QUEUED\",\"dbName\":null},{\"name\":\"PROCESSING\",\"dbName\":null},{\"name\":\"COMPLETED\",\"dbName\":null},{\"name\":\"FAILED\",\"dbName\":null},{\"name\":\"CANCELLED\",\"dbName\":null},{\"name\":\"RETRYING\",\"dbName\":null},{\"name\":\"PAUSED\",\"dbName\":null},{\"name\":\"REQUIRES_CAPTCHA\",\"dbName\":null}],\"dbName\":null},\"QueuePriority\":{\"values\":[{\"name\":\"LOW\",\"dbName\":null},{\"name\":\"NORMAL\",\"dbName\":null},{\"name\":\"HIGH\",\"dbName\":null},{\"name\":\"URGENT\",\"dbName\":null},{\"name\":\"IMMEDIATE\",\"dbName\":null}],\"dbName\":null},\"InteractionType\":{\"values\":[{\"name\":\"APPLICATION_SUBMITTED\",\"dbName\":null},{\"name\":\"EMAIL_RECEIVED\",\"dbName\":null},{\"name\":\"EMAIL_SENT\",\"dbName\":null},{\"name\":\"PHONE_CALL_INCOMING\",\"dbName\":null},{\"name\":\"PHONE_CALL_OUTGOING\",\"dbName\":null},{\"name\":\"VIDEO_CALL\",\"dbName\":null},{\"name\":\"IN_PERSON_MEETING\",\"dbName\":null},{\"name\":\"LINKEDIN_MESSAGE\",\"dbName\":null},{\"name\":\"TEXT_MESSAGE\",\"dbName\":null},{\"name\":\"RECRUITER_CONTACT\",\"dbName\":null},{\"name\":\"INTERVIEW_SCHEDULED\",\"dbName\":null},{\"name\":\"INTERVIEW_COMPLETED\",\"dbName\":null},{\"name\":\"ASSESSMENT_SENT\",\"dbName\":null},{\"name\":\"ASSESSMENT_COMPLETED\",\"dbName\":null},{\"name\":\"REFERENCE_REQUEST\",\"dbName\":null},{\"name\":\"BACKGROUND_CHECK\",\"dbName\":null},{\"name\":\"OFFER_RECEIVED\",\"dbName\":null},{\"name\":\"OFFER_NEGOTIATION\",\"dbName\":null},{\"name\":\"REJECTION_RECEIVED\",\"dbName\":null},{\"name\":\"FOLLOW_UP_SENT\",\"dbName\":null},{\"name\":\"THANK_YOU_SENT\",\"dbName\":null},{\"name\":\"WITHDRAWAL_SENT\",\"dbName\":null},{\"name\":\"STATUS_UPDATE\",\"dbName\":null},{\"name\":\"OTHER\",\"dbName\":null}],\"dbName\":null},\"InteractionOutcome\":{\"values\":[{\"name\":\"POSITIVE\",\"dbName\":null},{\"name\":\"NEUTRAL\",\"dbName\":null},{\"name\":\"NEGATIVE\",\"dbName\":null},{\"name\":\"NO_RESPONSE\",\"dbName\":null},{\"name\":\"NEEDS_FOLLOW_UP\",\"dbName\":null},{\"name\":\"SCHEDULED_NEXT_STEP\",\"dbName\":null},{\"name\":\"OFFER_DISCUSSION\",\"dbName\":null},{\"name\":\"REJECTION\",\"dbName\":null},{\"name\":\"INTERVIEW_SCHEDULED\",\"dbName\":null},{\"name\":\"ASSESSMENT_REQUIRED\",\"dbName\":null},{\"name\":\"REFERENCES_REQUESTED\",\"dbName\":null},{\"name\":\"WITHDRAWN\",\"dbName\":null}],\"dbName\":null},\"TemplateCategory\":{\"values\":[{\"name\":\"GENERAL\",\"dbName\":null},{\"name\":\"TECHNOLOGY\",\"dbName\":null},{\"name\":\"BUSINESS\",\"dbName\":null},{\"name\":\"CREATIVE\",\"dbName\":null},{\"name\":\"ACADEMIC\",\"dbName\":null},{\"name\":\"HEALTHCARE\",\"dbName\":null},{\"name\":\"ENGINEERING\",\"dbName\":null},{\"name\":\"SALES\",\"dbName\":null},{\"name\":\"MARKETING\",\"dbName\":null},{\"name\":\"FINANCE\",\"dbName\":null},{\"name\":\"LEGAL\",\"dbName\":null},{\"name\":\"EDUCATION\",\"dbName\":null},{\"name\":\"NON_PROFIT\",\"dbName\":null},{\"name\":\"EXECUTIVE\",\"dbName\":null},{\"name\":\"ENTRY_LEVEL\",\"dbName\":null},{\"name\":\"CAREER_CHANGE\",\"dbName\":null}],\"dbName\":null},\"ResumeVisibility\":{\"values\":[{\"name\":\"PRIVATE\",\"dbName\":null},{\"name\":\"PUBLIC\",\"dbName\":null},{\"name\":\"RECRUITERS_ONLY\",\"dbName\":null},{\"name\":\"SHARED_LINK\",\"dbName\":null}],\"dbName\":null},\"ProcessingStatus\":{\"values\":[{\"name\":\"PENDING\",\"dbName\":null},{\"name\":\"PARSING\",\"dbName\":null},{\"name\":\"PARSED\",\"dbName\":null},{\"name\":\"ENHANCING\",\"dbName\":null},{\"name\":\"ENHANCED\",\"dbName\":null},{\"name\":\"FAILED\",\"dbName\":null},{\"name\":\"ERROR\",\"dbName\":null}],\"dbName\":null},\"EnhancementType\":{\"values\":[{\"name\":\"KEYWORD_OPTIMIZATION\",\"dbName\":null},{\"name\":\"ATS_OPTIMIZATION\",\"dbName\":null},{\"name\":\"JOB_SPECIFIC_TAILORING\",\"dbName\":null},{\"name\":\"SKILL_HIGHLIGHTING\",\"dbName\":null},{\"name\":\"EXPERIENCE_ENHANCEMENT\",\"dbName\":null},{\"name\":\"SUMMARY_IMPROVEMENT\",\"dbName\":null},{\"name\":\"GRAMMAR_CHECK\",\"dbName\":null},{\"name\":\"FORMAT_OPTIMIZATION\",\"dbName\":null},{\"name\":\"LENGTH_OPTIMIZATION\",\"dbName\":null},{\"name\":\"IMPACT_ENHANCEMENT\",\"dbName\":null}],\"dbName\":null},\"SwipeDirection\":{\"values\":[{\"name\":\"LEFT\",\"dbName\":null},{\"name\":\"RIGHT\",\"dbName\":null},{\"name\":\"SUPER_LIKE\",\"dbName\":null}],\"dbName\":null},\"SubscriptionPlan\":{\"values\":[{\"name\":\"FREE\",\"dbName\":null},{\"name\":\"BASIC\",\"dbName\":null},{\"name\":\"PRO\",\"dbName\":null},{\"name\":\"PREMIUM\",\"dbName\":null},{\"name\":\"ENTERPRISE\",\"dbName\":null},{\"name\":\"CUSTOM\",\"dbName\":null}],\"dbName\":null},\"SubscriptionStatus\":{\"values\":[{\"name\":\"ACTIVE\",\"dbName\":null},{\"name\":\"INACTIVE\",\"dbName\":null},{\"name\":\"PAST_DUE\",\"dbName\":null},{\"name\":\"CANCELLED\",\"dbName\":null},{\"name\":\"UNPAID\",\"dbName\":null},{\"name\":\"TRIALING\",\"dbName\":null},{\"name\":\"INCOMPLETE\",\"dbName\":null},{\"name\":\"INCOMPLETE_EXPIRED\",\"dbName\":null},{\"name\":\"PAUSED\",\"dbName\":null}],\"dbName\":null},\"PaymentStatus\":{\"values\":[{\"name\":\"PENDING\",\"dbName\":null},{\"name\":\"SUCCEEDED\",\"dbName\":null},{\"name\":\"FAILED\",\"dbName\":null},{\"name\":\"CANCELLED\",\"dbName\":null},{\"name\":\"REFUNDED\",\"dbName\":null},{\"name\":\"DISPUTED\",\"dbName\":null},{\"name\":\"REQUIRES_ACTION\",\"dbName\":null}],\"dbName\":null},\"SavedJobPriority\":{\"values\":[{\"name\":\"LOW\",\"dbName\":null},{\"name\":\"MEDIUM\",\"dbName\":null},{\"name\":\"HIGH\",\"dbName\":null},{\"name\":\"URGENT\",\"dbName\":null}],\"dbName\":null},\"UsageFeature\":{\"values\":[{\"name\":\"JOB_SEARCH\",\"dbName\":null},{\"name\":\"JOB_VIEW\",\"dbName\":null},{\"name\":\"JOB_SWIPE\",\"dbName\":null},{\"name\":\"JOB_SAVE\",\"dbName\":null},{\"name\":\"APPLICATION_MANUAL\",\"dbName\":null},{\"name\":\"APPLICATION_AUTOMATION\",\"dbName\":null},{\"name\":\"RESUME_CREATION\",\"dbName\":null},{\"name\":\"RESUME_EDIT\",\"dbName\":null},{\"name\":\"RESUME_DOWNLOAD\",\"dbName\":null},{\"name\":\"RESUME_ENHANCEMENT\",\"dbName\":null},{\"name\":\"COVER_LETTER_GENERATION\",\"dbName\":null},{\"name\":\"TEMPLATE_USAGE\",\"dbName\":null},{\"name\":\"PROFILE_UPDATE\",\"dbName\":null},{\"name\":\"SEARCH_FILTER\",\"dbName\":null},{\"name\":\"NOTIFICATION_SENT\",\"dbName\":null},{\"name\":\"EMAIL_SENT\",\"dbName\":null},{\"name\":\"FILE_UPLOAD\",\"dbName\":null},{\"name\":\"FILE_DOWNLOAD\",\"dbName\":null},{\"name\":\"API_CALL\",\"dbName\":null},{\"name\":\"DESKTOP_APP_USAGE\",\"dbName\":null},{\"name\":\"MOBILE_APP_USAGE\",\"dbName\":null},{\"name\":\"WEB_APP_USAGE\",\"dbName\":null},{\"name\":\"ANALYTICS_EVENT\",\"dbName\":null},{\"name\":\"AUDIT_LOG_ENTRY\",\"dbName\":null}],\"dbName\":null},\"NotificationType\":{\"values\":[{\"name\":\"JOB_MATCH\",\"dbName\":null},{\"name\":\"APPLICATION_UPDATE\",\"dbName\":null},{\"name\":\"INTERVIEW_REMINDER\",\"dbName\":null},{\"name\":\"DEADLINE_REMINDER\",\"dbName\":null},{\"name\":\"NEW_MESSAGE\",\"dbName\":null},{\"name\":\"SYSTEM_NOTIFICATION\",\"dbName\":null},{\"name\":\"BILLING_NOTIFICATION\",\"dbName\":null},{\"name\":\"SECURITY_ALERT\",\"dbName\":null},{\"name\":\"FEATURE_ANNOUNCEMENT\",\"dbName\":null},{\"name\":\"WEEKLY_DIGEST\",\"dbName\":null},{\"name\":\"REFERRAL_BONUS\",\"dbName\":null},{\"name\":\"ACHIEVEMENT_UNLOCKED\",\"dbName\":null},{\"name\":\"SUBSCRIPTION_EXPIRING\",\"dbName\":null},{\"name\":\"PAYMENT_FAILED\",\"dbName\":null},{\"name\":\"ACCOUNT_SUSPENDED\",\"dbName\":null},{\"name\":\"DATA_EXPORT_READY\",\"dbName\":null},{\"name\":\"PROFILE_INCOMPLETE\",\"dbName\":null},{\"name\":\"RESUME_FEEDBACK\",\"dbName\":null},{\"name\":\"JOB_RECOMMENDATION\",\"dbName\":null},{\"name\":\"COMPANY_UPDATE\",\"dbName\":null}],\"dbName\":null},\"NotificationChannel\":{\"values\":[{\"name\":\"IN_APP\",\"dbName\":null},{\"name\":\"EMAIL\",\"dbName\":null},{\"name\":\"SMS\",\"dbName\":null},{\"name\":\"PUSH\",\"dbName\":null},{\"name\":\"SLACK\",\"dbName\":null},{\"name\":\"WEBHOOK\",\"dbName\":null}],\"dbName\":null},\"NotificationPriority\":{\"values\":[{\"name\":\"LOW\",\"dbName\":null},{\"name\":\"NORMAL\",\"dbName\":null},{\"name\":\"HIGH\",\"dbName\":null},{\"name\":\"URGENT\",\"dbName\":null},{\"name\":\"CRITICAL\",\"dbName\":null}],\"dbName\":null},\"NotificationStatus\":{\"values\":[{\"name\":\"UNREAD\",\"dbName\":null},{\"name\":\"READ\",\"dbName\":null},{\"name\":\"CLICKED\",\"dbName\":null},{\"name\":\"DISMISSED\",\"dbName\":null},{\"name\":\"EXPIRED\",\"dbName\":null},{\"name\":\"FAILED\",\"dbName\":null}],\"dbName\":null},\"SettingType\":{\"values\":[{\"name\":\"STRING\",\"dbName\":null},{\"name\":\"NUMBER\",\"dbName\":null},{\"name\":\"BOOLEAN\",\"dbName\":null},{\"name\":\"JSON\",\"dbName\":null},{\"name\":\"ARRAY\",\"dbName\":null},{\"name\":\"URL\",\"dbName\":null},{\"name\":\"EMAIL\",\"dbName\":null},{\"name\":\"PASSWORD\",\"dbName\":null},{\"name\":\"ENCRYPTED\",\"dbName\":null}],\"dbName\":null},\"ActorType\":{\"values\":[{\"name\":\"USER\",\"dbName\":null},{\"name\":\"ADMIN\",\"dbName\":null},{\"name\":\"SYSTEM\",\"dbName\":null},{\"name\":\"API_KEY\",\"dbName\":null},{\"name\":\"SERVICE_ACCOUNT\",\"dbName\":null},{\"name\":\"AUTOMATION\",\"dbName\":null},{\"name\":\"WEBHOOK\",\"dbName\":null}],\"dbName\":null},\"RiskLevel\":{\"values\":[{\"name\":\"LOW\",\"dbName\":null},{\"name\":\"MEDIUM\",\"dbName\":null},{\"name\":\"HIGH\",\"dbName\":null},{\"name\":\"CRITICAL\",\"dbName\":null}],\"dbName\":null},\"LogLevel\":{\"values\":[{\"name\":\"DEBUG\",\"dbName\":null},{\"name\":\"INFO\",\"dbName\":null},{\"name\":\"WARN\",\"dbName\":null},{\"name\":\"ERROR\",\"dbName\":null},{\"name\":\"CRITICAL\",\"dbName\":null}],\"dbName\":null}},\"types\":{}}")
defineDmmfProperty(exports.Prisma, config.runtimeDataModel)
config.engineWasm = undefined

config.injectableEdgeEnv = () => ({
  parsed: {
    DATABASE_URL: typeof globalThis !== 'undefined' && globalThis['DATABASE_URL'] || typeof process !== 'undefined' && process.env && process.env.DATABASE_URL || undefined
  }
})

if (typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined) {
  Debug.enable(typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined)
}

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

