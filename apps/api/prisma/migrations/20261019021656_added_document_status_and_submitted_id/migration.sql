-- CreateEnum
CREATE TYPE "AcceptedIdType" AS ENUM ('PHILIPPINE_NATIONAL_ID', 'PASSPORT', 'DRIVERS_LICENSE', 'UMID', 'PRC_ID', 'VOTERS_ID', 'POSTAL_ID');

-- CreateTable
CREATE TABLE "ApplicantScore" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "educationalBackground" INTEGER NOT NULL,
    "workExperience" INTEGER NOT NULL,
    "skills" INTEGER NOT NULL,
    "certification" INTEGER NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicantScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Applicant" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobPostId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "scoreStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "applyDate" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Applicant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthIdentity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerUserId" TEXT NOT NULL,
    "hashPassword" TEXT NOT NULL,

    CONSTRAINT "AuthIdentity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campus" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,

    CONSTRAINT "Campus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CV" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "uploaded_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CV_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DepartmentMember" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,

    CONSTRAINT "DepartmentMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "departmentHeadId" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeDocumentStatus" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "validId" TEXT NOT NULL,
    "tin" TEXT NOT NULL,
    "sss" TEXT NOT NULL,
    "philhealth" TEXT NOT NULL,
    "pagIbig" TEXT NOT NULL,
    "medicalRecord" TEXT NOT NULL,
    "psa" TEXT NOT NULL,
    "birForm" TEXT,
    "nbiClearance" TEXT NOT NULL,

    CONSTRAINT "EmployeeDocumentStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "employmentType" TEXT NOT NULL,
    "isTeaching" BOOLEAN NOT NULL,
    "hiredAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HiringRequest" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "employmentType" TEXT NOT NULL,
    "isTeaching" BOOLEAN NOT NULL,
    "requirements" JSONB NOT NULL DEFAULT '{}',
    "departmentId" TEXT NOT NULL,
    "campusId" INTEGER NOT NULL,

    CONSTRAINT "HiringRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interview" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "interviewerId" TEXT,
    "stage" VARCHAR(30) NOT NULL,
    "date" TIMESTAMPTZ(3) NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 60,
    "timeZone" VARCHAR(64) NOT NULL DEFAULT 'Asia/Manila',
    "type" VARCHAR(20) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    "location" VARCHAR(255),
    "meetingUrl" VARCHAR(2048),
    "instructions" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewEvaluation" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "evaluatorId" TEXT NOT NULL,
    "ratings" JSONB NOT NULL,
    "recommendation" VARCHAR(20) NOT NULL,
    "strengths" TEXT,
    "concerns" TEXT,
    "comments" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "InterviewEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobPost" (
    "id" TEXT NOT NULL,
    "hiringRequestId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL,
    "employmentType" TEXT NOT NULL,
    "applicationCount" INTEGER NOT NULL DEFAULT 0,
    "approvedBy" TEXT NOT NULL,
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "JobPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubmittedId" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "idType" "AcceptedIdType" NOT NULL,
    "notes" TEXT,
    "presentedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubmittedId_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "avatarUrl" TEXT,
    "role" TEXT NOT NULL DEFAULT 'APPLICANT',
    "education" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApplicantScore_applicantId_key" ON "ApplicantScore"("applicantId");

-- CreateIndex
CREATE INDEX "ApplicantScore_totalScore_idx" ON "ApplicantScore"("totalScore");

-- CreateIndex
CREATE INDEX "ApplicantScore_createdAt_idx" ON "ApplicantScore"("createdAt");

-- CreateIndex
CREATE INDEX "Applicant_jobPostId_status_idx" ON "Applicant"("jobPostId", "status");

-- CreateIndex
CREATE INDEX "Applicant_userId_idx" ON "Applicant"("userId");

-- CreateIndex
CREATE INDEX "Applicant_status_applyDate_idx" ON "Applicant"("status", "applyDate");

-- CreateIndex
CREATE INDEX "Applicant_scoreStatus_idx" ON "Applicant"("scoreStatus");

-- CreateIndex
CREATE UNIQUE INDEX "AuthIdentity_userId_key" ON "AuthIdentity"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AuthIdentity_provider_providerUserId_key" ON "AuthIdentity"("provider", "providerUserId");

-- CreateIndex
CREATE UNIQUE INDEX "CV_user_id_key" ON "CV"("user_id");

-- CreateIndex
CREATE INDEX "DepartmentMember_departmentId_employeeId_idx" ON "DepartmentMember"("departmentId", "employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "DepartmentMember_departmentId_employeeId_key" ON "DepartmentMember"("departmentId", "employeeId");

-- CreateIndex
CREATE INDEX "Department_departmentHeadId_idx" ON "Department"("departmentHeadId");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeDocumentStatus_employeeId_key" ON "EmployeeDocumentStatus"("employeeId");

-- CreateIndex
CREATE INDEX "Employee_userId_idx" ON "Employee"("userId");

-- CreateIndex
CREATE INDEX "HiringRequest_departmentId_campusId_idx" ON "HiringRequest"("departmentId", "campusId");

-- CreateIndex
CREATE INDEX "HiringRequest_status_idx" ON "HiringRequest"("status");

-- CreateIndex
CREATE INDEX "Interview_applicantId_date_idx" ON "Interview"("applicantId", "date");

-- CreateIndex
CREATE INDEX "Interview_status_date_idx" ON "Interview"("status", "date");

-- CreateIndex
CREATE INDEX "Interview_interviewerId_date_idx" ON "Interview"("interviewerId", "date");

-- CreateIndex
CREATE INDEX "InterviewEvaluation_evaluatorId_idx" ON "InterviewEvaluation"("evaluatorId");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewEvaluation_interviewId_evaluatorId_key" ON "InterviewEvaluation"("interviewId", "evaluatorId");

-- CreateIndex
CREATE UNIQUE INDEX "JobPost_hiringRequestId_key" ON "JobPost"("hiringRequestId");

-- CreateIndex
CREATE INDEX "JobPost_status_createdAt_idx" ON "JobPost"("status", "createdAt");

-- CreateIndex
CREATE INDEX "JobPost_approvedBy_idx" ON "JobPost"("approvedBy");

-- CreateIndex
CREATE INDEX "SubmittedId_employeeId_idx" ON "SubmittedId"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "SubmittedId_employeeId_idType_key" ON "SubmittedId"("employeeId", "idType");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- AddForeignKey
ALTER TABLE "ApplicantScore" ADD CONSTRAINT "ApplicantScore_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Applicant" ADD CONSTRAINT "Applicant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Applicant" ADD CONSTRAINT "Applicant_jobPostId_fkey" FOREIGN KEY ("jobPostId") REFERENCES "JobPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthIdentity" ADD CONSTRAINT "AuthIdentity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CV" ADD CONSTRAINT "CV_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepartmentMember" ADD CONSTRAINT "DepartmentMember_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepartmentMember" ADD CONSTRAINT "DepartmentMember_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_departmentHeadId_fkey" FOREIGN KEY ("departmentHeadId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeDocumentStatus" ADD CONSTRAINT "EmployeeDocumentStatus_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiringRequest" ADD CONSTRAINT "HiringRequest_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiringRequest" ADD CONSTRAINT "HiringRequest_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_interviewerId_fkey" FOREIGN KEY ("interviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewEvaluation" ADD CONSTRAINT "InterviewEvaluation_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewEvaluation" ADD CONSTRAINT "InterviewEvaluation_evaluatorId_fkey" FOREIGN KEY ("evaluatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPost" ADD CONSTRAINT "JobPost_hiringRequestId_fkey" FOREIGN KEY ("hiringRequestId") REFERENCES "HiringRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPost" ADD CONSTRAINT "JobPost_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmittedId" ADD CONSTRAINT "SubmittedId_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
