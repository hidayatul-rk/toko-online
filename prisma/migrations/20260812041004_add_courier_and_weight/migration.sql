-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "weight" INTEGER NOT NULL DEFAULT 200;

-- AlterTable
ALTER TABLE "ShippingMethod" ADD COLUMN     "courier" TEXT,
ADD COLUMN     "service" TEXT;
