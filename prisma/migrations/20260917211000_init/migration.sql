-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'AGENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "AgentStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'MATCHED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IremboService" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "institution" TEXT,
    "description" TEXT,
    "requirements" JSONB,
    "feeRwf" INTEGER,
    "processingTime" TEXT,
    "accountRequired" BOOLEAN,
    "officialUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "IremboService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IremboAgent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "serviceAreas" TEXT[] NOT NULL,
    "bio" TEXT,
    "status" "AgentStatus" NOT NULL DEFAULT 'PENDING',
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "IremboAgent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priceRwf" INTEGER NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "AgentPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentSubscription" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'PENDING',
    "startsAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "paymentRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AgentSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceRequest" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "agentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ServiceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "IremboService_slug_key" ON "IremboService"("slug");
CREATE UNIQUE INDEX "IremboAgent_userId_key" ON "IremboAgent"("userId");
CREATE UNIQUE INDEX "AgentPlan_name_key" ON "AgentPlan"("name");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE INDEX "Message_sessionId_createdAt_idx" ON "Message"("sessionId", "createdAt");
CREATE INDEX "IremboService_category_active_idx" ON "IremboService"("category", "active");
CREATE INDEX "IremboAgent_status_verificationStatus_location_idx" ON "IremboAgent"("status", "verificationStatus", "location");
CREATE INDEX "AgentSubscription_agentId_status_expiresAt_idx" ON "AgentSubscription"("agentId", "status", "expiresAt");
CREATE INDEX "ServiceRequest_serviceId_status_idx" ON "ServiceRequest"("serviceId", "status");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "IremboAgent" ADD CONSTRAINT "IremboAgent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AgentSubscription" ADD CONSTRAINT "AgentSubscription_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "IremboAgent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AgentSubscription" ADD CONSTRAINT "AgentSubscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "AgentPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "IremboService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "IremboAgent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
