
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


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

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

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
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  timezone: 'timezone',
  locale: 'locale',
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
  profileVisibility: 'profileVisibility',
  showEmail: 'showEmail',
  showPhone: 'showPhone',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
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
  updatedAt: 'updatedAt'
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
  updatedAt: 'updatedAt'
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
  locale: 'locale'
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
  preferredCurrency: 'preferredCurrency'
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
  desktopSessionId: 'desktopSessionId'
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
  tags: 'tags'
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
  shareToken: 'shareToken'
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
  appliedVia: 'appliedVia'
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
  RUNNING: 'RUNNING',
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
  UserJobSwipe: 'UserJobSwipe',
  ApplicationQueue: 'ApplicationQueue',
  AutomationLog: 'AutomationLog',
  AuditLog: 'AuditLog',
  AnalyticsEvent: 'AnalyticsEvent',
  UserNotification: 'UserNotification',
  SystemSetting: 'SystemSetting',
  NotificationTemplate: 'NotificationTemplate',
  Company: 'Company',
  CompanyReview: 'CompanyReview',
  JobPosting: 'JobPosting',
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
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
