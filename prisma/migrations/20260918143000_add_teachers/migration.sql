-- Add TEACHER role and technology teacher marketplace tables
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'TEACHER';

CREATE TABLE "Teacher" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "technologies" TEXT[] NOT NULL,
  "bio" TEXT,
  "status" "AgentStatus" NOT NULL DEFAULT 'PENDING',
  "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TeacherRequest" (
  "id" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "teacherId" TEXT NOT NULL,
  "technology" TEXT NOT NULL,
  "customerName" TEXT NOT NULL,
  "customerPhone" TEXT NOT NULL,
  "description" TEXT,
  "location" TEXT,
  "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TeacherRequest_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Teacher_userId_key" ON "Teacher"("userId");
CREATE INDEX "Teacher_status_verificationStatus_location_idx" ON "Teacher"("status", "verificationStatus", "location");
CREATE INDEX "TeacherRequest_teacherId_status_idx" ON "TeacherRequest"("teacherId", "status");
CREATE INDEX "TeacherRequest_technology_status_idx" ON "TeacherRequest"("technology", "status");

ALTER TABLE "Teacher"
  ADD CONSTRAINT "Teacher_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TeacherRequest"
  ADD CONSTRAINT "TeacherRequest_customerId_fkey"
  FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TeacherRequest"
  ADD CONSTRAINT "TeacherRequest_teacherId_fkey"
  FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;
