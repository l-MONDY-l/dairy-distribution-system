-- CreateEnum
CREATE TYPE "BusinessType" AS ENUM ('SOLE_PROPRIETORSHIP', 'PARTNERSHIP', 'PRIVATE_LIMITED', 'PUBLIC_LIMITED', 'OTHER');

-- CreateEnum
CREATE TYPE "IndustryType" AS ENUM ('DAIRY_MANUFACTURING', 'DAIRY_DISTRIBUTION', 'DAIRY_MANUFACTURING_DISTRIBUTION', 'FOOD_PROCESSING', 'OTHER');

-- CreateTable
CREATE TABLE "company_profiles" (
    "id" TEXT NOT NULL,
    "companyCode" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "brandName" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "taxId" TEXT,
    "vatNumber" TEXT,
    "businessType" "BusinessType" NOT NULL,
    "industryType" "IndustryType" NOT NULL DEFAULT 'DAIRY_MANUFACTURING_DISTRIBUTION',
    "companyEmail" TEXT NOT NULL,
    "companyPhone" TEXT NOT NULL,
    "companyMobile" TEXT,
    "whatsappNumber" TEXT,
    "website" TEXT,
    "logoUrl" TEXT,
    "profileImageUrl" TEXT,
    "description" TEXT,
    "establishedDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "factoryName" TEXT,
    "factoryLicenseNumber" TEXT,
    "foodSafetyLicenseNumber" TEXT,
    "dairyBoardRegistrationNumber" TEXT,
    "processingCapacityLitersPerDay" INTEGER NOT NULL DEFAULT 0,
    "coldStorageCapacityLiters" INTEGER NOT NULL DEFAULT 0,
    "factoryPhone" TEXT,
    "factoryEmail" TEXT,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "street" TEXT,
    "city" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "ownerName" TEXT,
    "managingDirectorName" TEXT,
    "operationsManagerName" TEXT,
    "financeManagerName" TEXT,
    "factoryManagerName" TEXT,
    "primaryContactPerson" TEXT NOT NULL,
    "primaryContactEmail" TEXT,
    "primaryContactPhone" TEXT NOT NULL,
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "businessOpenTime" TEXT,
    "businessCloseTime" TEXT,
    "factoryOpenTime" TEXT,
    "factoryCloseTime" TEXT,
    "deliveryStartTime" TEXT,
    "deliveryEndTime" TEXT,
    "workingDays" TEXT[],
    "distributionRegions" TEXT[],
    "fleetSize" INTEGER NOT NULL DEFAULT 0,
    "numberOfDrivers" INTEGER NOT NULL DEFAULT 0,
    "numberOfAgents" INTEGER NOT NULL DEFAULT 0,
    "dailyDeliveryCapacity" INTEGER NOT NULL DEFAULT 0,
    "supportsIslandwideDelivery" BOOLEAN NOT NULL DEFAULT false,
    "hasSLS" BOOLEAN NOT NULL DEFAULT false,
    "hasISO22000" BOOLEAN NOT NULL DEFAULT false,
    "hasHACCP" BOOLEAN NOT NULL DEFAULT false,
    "hasISO9001" BOOLEAN NOT NULL DEFAULT false,
    "certificationNotes" TEXT,
    "bankName" TEXT,
    "bankBranch" TEXT,
    "accountName" TEXT,
    "accountNumber" TEXT,
    "swiftCode" TEXT,
    "paymentSupportEmail" TEXT,
    "billingEmail" TEXT,
    "defaultCurrency" TEXT NOT NULL DEFAULT 'LKR',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Colombo',
    "language" TEXT NOT NULL DEFAULT 'en',
    "invoicePrefix" TEXT NOT NULL DEFAULT 'INV-',
    "orderPrefix" TEXT NOT NULL DEFAULT 'ORD-',
    "clientPrefix" TEXT NOT NULL DEFAULT 'CLT-',
    "agentPrefix" TEXT NOT NULL DEFAULT 'AGT-',
    "driverPrefix" TEXT NOT NULL DEFAULT 'DRV-',
    "stockPrefix" TEXT NOT NULL DEFAULT 'STK-',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "company_profiles_companyCode_key" ON "company_profiles"("companyCode");

-- CreateIndex
CREATE INDEX "company_profiles_businessType_idx" ON "company_profiles"("businessType");

-- CreateIndex
CREATE INDEX "company_profiles_industryType_idx" ON "company_profiles"("industryType");
