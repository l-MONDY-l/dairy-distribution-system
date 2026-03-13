import { z } from 'zod';

export const workingDaysOptions = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export const businessTypeOptions = [
  'SOLE_PROPRIETORSHIP',
  'PARTNERSHIP',
  'PRIVATE_LIMITED',
  'PUBLIC_LIMITED',
  'OTHER',
] as const;

export const industryTypeOptions = [
  'DAIRY_MANUFACTURING',
  'DAIRY_DISTRIBUTION',
  'DAIRY_MANUFACTURING_DISTRIBUTION',
  'FOOD_PROCESSING',
  'OTHER',
] as const;

export const companyProfileBaseSchema = z.object({
  companyCode: z.string().min(2, 'Company code is required').max(20),
  legalName: z.string().min(2, 'Legal name is required'),
  brandName: z.string().min(2, 'Brand name is required'),
  registrationNumber: z.string().min(2, 'Registration number is required'),
  taxId: z.string().optional().nullable(),
  vatNumber: z.string().optional().nullable(),
  businessType: z.enum(businessTypeOptions),
  industryType: z.enum(industryTypeOptions),
  companyEmail: z.string().email('Invalid company email'),
  companyPhone: z.string().min(3, 'Company phone is required'),
  companyMobile: z.string().optional().nullable(),
  whatsappNumber: z.string().optional().nullable(),
  website: z.string().url('Invalid URL').optional().nullable(),
  // Allow relative paths from local uploads as well as full URLs
  logoUrl: z.string().min(1).optional().nullable(),
  profileImageUrl: z.string().min(1).optional().nullable(),
  description: z.string().optional().nullable(),
  establishedDate: z.string().optional().nullable(),
  isActive: z.boolean().default(true),

  factoryName: z.string().optional().nullable(),
  factoryLicenseNumber: z.string().optional().nullable(),
  foodSafetyLicenseNumber: z.string().optional().nullable(),
  dairyBoardRegistrationNumber: z.string().optional().nullable(),
  processingCapacityLitersPerDay: z
    .number()
    .int()
    .min(0, 'Processing capacity must be >= 0')
    .default(0),
  coldStorageCapacityLiters: z
    .number()
    .int()
    .min(0, 'Cold storage capacity must be >= 0')
    .default(0),
  factoryPhone: z.string().optional().nullable(),
  factoryEmail: z.string().email('Invalid factory email').optional().nullable(),

  addressLine1: z.string().min(2, 'Address line 1 is required'),
  addressLine2: z.string().optional().nullable(),
  street: z.string().optional().nullable(),
  city: z.string().min(2, 'City is required'),
  district: z.string().min(2, 'District is required'),
  province: z.string().min(2, 'Province is required'),
  postalCode: z.string().min(2, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),

  ownerName: z.string().optional().nullable(),
  managingDirectorName: z.string().optional().nullable(),
  operationsManagerName: z.string().optional().nullable(),
  financeManagerName: z.string().optional().nullable(),
  factoryManagerName: z.string().optional().nullable(),
  primaryContactPerson: z.string().min(2, 'Primary contact person is required'),
  primaryContactEmail: z.string().email('Invalid email').optional().nullable(),
  primaryContactPhone: z.string().min(3, 'Primary contact phone is required'),
  emergencyContactName: z.string().optional().nullable(),
  emergencyContactPhone: z.string().optional().nullable(),

  businessOpenTime: z.string().optional().nullable(),
  businessCloseTime: z.string().optional().nullable(),
  factoryOpenTime: z.string().optional().nullable(),
  factoryCloseTime: z.string().optional().nullable(),
  deliveryStartTime: z.string().optional().nullable(),
  deliveryEndTime: z.string().optional().nullable(),
  workingDays: z.array(z.enum(workingDaysOptions)).default([]),

  distributionRegions: z.array(z.string()).default([]),
  fleetSize: z.number().int().min(0, 'Fleet size must be >= 0').default(0),
  numberOfDrivers: z.number().int().min(0, 'Number of drivers must be >= 0').default(0),
  numberOfAgents: z.number().int().min(0, 'Number of agents must be >= 0').default(0),
  dailyDeliveryCapacity: z
    .number()
    .int()
    .min(0, 'Daily delivery capacity must be >= 0')
    .default(0),
  supportsIslandwideDelivery: z.boolean().default(false),

  hasSLS: z.boolean().default(false),
  hasISO22000: z.boolean().default(false),
  hasHACCP: z.boolean().default(false),
  hasISO9001: z.boolean().default(false),
  certificationNotes: z.string().optional().nullable(),

  bankName: z.string().optional().nullable(),
  bankBranch: z.string().optional().nullable(),
  accountName: z.string().optional().nullable(),
  accountNumber: z.string().optional().nullable(),
  swiftCode: z.string().optional().nullable(),
  paymentSupportEmail: z.string().email('Invalid payment support email').optional().nullable(),
  billingEmail: z.string().email('Invalid billing email').optional().nullable(),

  defaultCurrency: z.string().min(1, 'Default currency is required').default('LKR'),
  timezone: z.string().min(1, 'Timezone is required').default('Asia/Colombo'),
  language: z.string().min(1).default('en'),
  invoicePrefix: z.string().min(1, 'Invoice prefix is required'),
  orderPrefix: z.string().min(1, 'Order prefix is required'),
  clientPrefix: z.string().default('CLT-'),
  agentPrefix: z.string().default('AGT-'),
  driverPrefix: z.string().default('DRV-'),
  stockPrefix: z.string().default('STK-'),
});

export const createCompanyProfileSchema = companyProfileBaseSchema;
export const updateCompanyProfileSchema = companyProfileBaseSchema.partial();
export type CompanyProfileSchemaInput = z.infer<typeof companyProfileBaseSchema>;

