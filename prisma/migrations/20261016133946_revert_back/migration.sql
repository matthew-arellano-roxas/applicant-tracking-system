/*
  Warnings:

  - A unique constraint covering the columns `[provider,providerUserId]` on the table `AuthIdentity` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `stage` to the `Interview` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Interview" ADD COLUMN     "instructions" TEXT,
ADD COLUMN     "interviewerId" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "stage" VARCHAR(30) NOT NULL,
ADD COLUMN     "status" VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED';

-- CreateIndex
CREATE INDEX "Applicant_jobPostId_status_idx" ON "Applicant"("jobPostId", "status");

-- CreateIndex
CREATE INDEX "Applicant_userId_idx" ON "Applicant"("userId");

-- CreateIndex
CREATE INDEX "Applicant_status_applyDate_idx" ON "Applicant"("status", "applyDate");

-- CreateIndex
CREATE INDEX "ApplicantScore_totalScore_idx" ON "ApplicantScore"("totalScore");

-- CreateIndex
CREATE INDEX "ApplicantScore_createdAt_idx" ON "ApplicantScore"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AuthIdentity_provider_providerUserId_key" ON "AuthIdentity"("provider", "providerUserId");

-- CreateIndex
CREATE INDEX "Department_departmentHeadId_idx" ON "Department"("departmentHeadId");

-- CreateIndex
CREATE INDEX "DepartmentMember_departmentId_employeeId_idx" ON "DepartmentMember"("departmentId", "employeeId");

-- CreateIndex
CREATE INDEX "Employee_userId_idx" ON "Employee"("userId");

-- CreateIndex
CREATE INDEX "HiringRequest_departmentId_campusId_idx" ON "HiringRequest"("departmentId", "campusId");

-- CreateIndex
CREATE INDEX "HiringRequest_status_idx" ON "HiringRequest"("status");

-- CreateIndex
CREATE INDEX "Interview_status_date_idx" ON "Interview"("status", "date");

-- CreateIndex
CREATE INDEX "Interview_interviewerId_idx" ON "Interview"("interviewerId");

-- CreateIndex
CREATE INDEX "JobPost_status_createdAt_idx" ON "JobPost"("status", "createdAt");

-- CreateIndex
CREATE INDEX "JobPost_approvedBy_idx" ON "JobPost"("approvedBy");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_interviewerId_fkey" FOREIGN KEY ("interviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
