-- Add externalId with unique constraint
ALTER TABLE "job_postings" ADD COLUMN IF NOT EXISTS "externalId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "job_postings_externalId_key" ON "job_postings"("externalId");

-- Add Greenhouse-specific fields
ALTER TABLE "job_postings" ADD COLUMN IF NOT EXISTS "greenhouseCompanyId" TEXT;
ALTER TABLE "job_postings" ADD COLUMN IF NOT EXISTS "greenhouseJobId" TEXT;
ALTER TABLE "job_postings" ADD COLUMN IF NOT EXISTS "applicationSchema" JSONB;
ALTER TABLE "job_postings" ADD COLUMN IF NOT EXISTS "formMetadata" JSONB;

-- Add automation intelligence metrics
ALTER TABLE "job_postings" ADD COLUMN IF NOT EXISTS "automationFeasibility" TEXT;
ALTER TABLE "job_postings" ADD COLUMN IF NOT EXISTS "estimatedSuccessRate" INTEGER;
ALTER TABLE "job_postings" ADD COLUMN IF NOT EXISTS "prefilledFieldCount" INTEGER DEFAULT 0;
ALTER TABLE "job_postings" ADD COLUMN IF NOT EXISTS "aiRequiredFieldCount" INTEGER DEFAULT 0;
ALTER TABLE "job_postings" ADD COLUMN IF NOT EXISTS "totalRequiredFields" INTEGER DEFAULT 0;

-- Add schema tracking fields
ALTER TABLE "job_postings" ADD COLUMN IF NOT EXISTS "lastSchemaUpdate" TIMESTAMP(3);
ALTER TABLE "job_postings" ADD COLUMN IF NOT EXISTS "schemaVersion" TEXT DEFAULT '1.0';

-- Add compound unique constraint for Greenhouse company and job IDs
CREATE UNIQUE INDEX IF NOT EXISTS "job_postings_greenhouseCompanyId_greenhouseJobId_key"
  ON "job_postings"("greenhouseCompanyId", "greenhouseJobId")
  WHERE "greenhouseCompanyId" IS NOT NULL AND "greenhouseJobId" IS NOT NULL;

-- Add indexes for query optimization
CREATE INDEX IF NOT EXISTS "job_postings_automationFeasibility_idx" ON "job_postings"("automationFeasibility");
CREATE INDEX IF NOT EXISTS "job_postings_estimatedSuccessRate_idx" ON "job_postings"("estimatedSuccessRate");
CREATE INDEX IF NOT EXISTS "job_postings_greenhouseCompanyId_greenhouseJobId_idx"
  ON "job_postings"("greenhouseCompanyId", "greenhouseJobId");

-- Add needsVisaSponsorship to user_profiles if not exists
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "needsVisaSponsorship" BOOLEAN DEFAULT false;
