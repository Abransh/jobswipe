-- AlterTable
ALTER TABLE "application_queue" ADD COLUMN     "claimedAt" TIMESTAMP(3),
ADD COLUMN     "claimedBy" TEXT;

-- AlterTable
ALTER TABLE "job_postings" ADD COLUMN     "aiRequiredFieldCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "applicationSchema" JSONB,
ADD COLUMN     "automationFeasibility" TEXT,
ADD COLUMN     "estimatedSuccessRate" INTEGER,
ADD COLUMN     "formMetadata" JSONB,
ADD COLUMN     "greenhouseCompanyId" TEXT,
ADD COLUMN     "greenhouseJobId" TEXT,
ADD COLUMN     "lastSchemaUpdate" TIMESTAMP(3),
ADD COLUMN     "prefilledFieldCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "schemaVersion" TEXT DEFAULT '1.0',
ADD COLUMN     "totalRequiredFields" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "user_profiles" ADD COLUMN     "needsVisaSponsorship" BOOLEAN DEFAULT false;

-- CreateIndex
CREATE INDEX "job_postings_greenhouseCompanyId_greenhouseJobId_idx" ON "job_postings"("greenhouseCompanyId", "greenhouseJobId");

-- CreateIndex
CREATE INDEX "job_postings_automationFeasibility_idx" ON "job_postings"("automationFeasibility");

-- CreateIndex
CREATE INDEX "job_postings_estimatedSuccessRate_idx" ON "job_postings"("estimatedSuccessRate");
