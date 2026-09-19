-- Add marketplace source and pricing metadata fields to Product.
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "sourceShop" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "sourceUrl" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMP(3);
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "priceStatus" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "priceSourceShop" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "priceSourceUrl" TEXT;
