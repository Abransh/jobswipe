/*
  Warnings:

  - A unique constraint covering the columns `[externalId]` on the table `job_postings` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[greenhouseCompanyId,greenhouseJobId]` on the table `job_postings` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "job_postings_externalId_key" ON "job_postings"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "job_postings_greenhouseCompanyId_greenhouseJobId_key" ON "job_postings"("greenhouseCompanyId", "greenhouseJobId");
