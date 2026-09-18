CREATE TABLE "ProviderRequest" (
  "id" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "serviceId" TEXT NOT NULL,
  "customerName" TEXT NOT NULL,
  "customerPhone" TEXT NOT NULL,
  "details" TEXT NOT NULL,
  "location" TEXT,
  "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
  "providerId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProviderRequest_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ProviderRequest_serviceId_status_idx" ON "ProviderRequest"("serviceId","status");
CREATE INDEX "ProviderRequest_providerId_status_idx" ON "ProviderRequest"("providerId","status");
CREATE INDEX "ProviderRequest_customerId_createdAt_idx" ON "ProviderRequest"("customerId","createdAt");
ALTER TABLE "ProviderRequest" ADD CONSTRAINT "ProviderRequest_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProviderRequest" ADD CONSTRAINT "ProviderRequest_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "PlatformService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProviderRequest" ADD CONSTRAINT "ProviderRequest_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "IremboAgent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
