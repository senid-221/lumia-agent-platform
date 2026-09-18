-- LUMIA marketplace, partners and platform services
CREATE TYPE "PartnerStatus" AS ENUM ('PENDING','APPROVED','REJECTED','SUSPENDED');
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT','ACTIVE','OUT_OF_STOCK','ARCHIVED');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING','CONFIRMED','PROCESSING','READY','COMPLETED','CANCELLED');

CREATE TABLE "PlatformService" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PlatformService_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PlatformService_slug_key" ON "PlatformService"("slug");
CREATE UNIQUE INDEX "PlatformService_name_key" ON "PlatformService"("name");

CREATE TABLE "Partner" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "businessName" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "description" TEXT,
  "status" "PartnerStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Partner_userId_key" ON "Partner"("userId");
CREATE INDEX "Partner_status_location_idx" ON "Partner"("status","location");
ALTER TABLE "Partner" ADD CONSTRAINT "Partner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Product" (
  "id" TEXT NOT NULL,
  "partnerId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "description" TEXT,
  "priceRwf" INTEGER,
  "imageUrl" TEXT,
  "productUrl" TEXT,
  "stock" INTEGER NOT NULL DEFAULT 0,
  "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Product_category_status_idx" ON "Product"("category","status");
CREATE INDEX "Product_partnerId_status_idx" ON "Product"("partnerId","status");
ALTER TABLE "Product" ADD CONSTRAINT "Product_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "MarketplaceOrder" (
  "id" TEXT NOT NULL,
  "partnerId" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "customerName" TEXT NOT NULL,
  "customerPhone" TEXT NOT NULL,
  "deliveryLocation" TEXT NOT NULL,
  "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MarketplaceOrder_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "MarketplaceOrder_partnerId_status_idx" ON "MarketplaceOrder"("partnerId","status");
CREATE INDEX "MarketplaceOrder_customerId_createdAt_idx" ON "MarketplaceOrder"("customerId","createdAt");
ALTER TABLE "MarketplaceOrder" ADD CONSTRAINT "MarketplaceOrder_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MarketplaceOrder" ADD CONSTRAINT "MarketplaceOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "MarketplaceOrderItem" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "unitPrice" INTEGER,
  CONSTRAINT "MarketplaceOrderItem_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "MarketplaceOrderItem_orderId_productId_key" ON "MarketplaceOrderItem"("orderId","productId");
ALTER TABLE "MarketplaceOrderItem" ADD CONSTRAINT "MarketplaceOrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "MarketplaceOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketplaceOrderItem" ADD CONSTRAINT "MarketplaceOrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
