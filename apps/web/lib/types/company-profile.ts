export type BusinessType =
  | 'SOLE_PROPRIETORSHIP'
  | 'PARTNERSHIP'
  | 'PRIVATE_LIMITED'
  | 'PUBLIC_LIMITED'
  | 'OTHER';

export type IndustryType =
  | 'DAIRY_MANUFACTURING'
  | 'DAIRY_DISTRIBUTION'
  | 'DAIRY_MANUFACTURING_DISTRIBUTION'
  | 'FOOD_PROCESSING'
  | 'OTHER';

export type CompanyProfile = {
  id: string;
  companyCode: string;
  legalName: string;
  brandName: string;
  registrationNumber: string;
  taxId?: string | null;
  vatNumber?: string | null;
  businessType: BusinessType;
  industryType: IndustryType;
  companyEmail: string;
  companyPhone: string;
  companyMobile?: string | null;
  whatsappNumber?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  profileImageUrl?: string | null;
  description?: string | null;
  establishedDate?: string | null;
  isActive: boolean;

  factoryName?: string | null;
  factoryLicenseNumber?: string | null;
  foodSafetyLicenseNumber?: string | null;
  dairyBoardRegistrationNumber?: string | null;
  processingCapacityLitersPerDay: number;
  coldStorageCapacityLiters: number;
  factoryPhone?: string | null;
  factoryEmail?: string | null;

  addressLine1: string;
  addressLine2?: string | null;
  street?: string | null;
  city: string;
  district: string;
  province: string;
  postalCode: string;
  country: string;
  latitude?: number | null;
  longitude?: number | null;

  ownerName?: string | null;
  managingDirectorName?: string | null;
  operationsManagerName?: string | null;
  financeManagerName?: string | null;
  factoryManagerName?: string | null;
  primaryContactPerson: string;
  primaryContactEmail?: string | null;
  primaryContactPhone: string;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;

  businessOpenTime?: string | null;
  businessCloseTime?: string | null;
  factoryOpenTime?: string | null;
  factoryCloseTime?: string | null;
  deliveryStartTime?: string | null;
  deliveryEndTime?: string | null;
  workingDays: string[];

  distributionRegions: string[];
  fleetSize: number;
  numberOfDrivers: number;
  numberOfAgents: number;
  dailyDeliveryCapacity: number;
  supportsIslandwideDelivery: boolean;

  hasSLS: boolean;
  hasISO22000: boolean;
  hasHACCP: boolean;
  hasISO9001: boolean;
  certificationNotes?: string | null;

  bankName?: string | null;
  bankBranch?: string | null;
  accountName?: string | null;
  accountNumber?: string | null;
  swiftCode?: string | null;
  paymentSupportEmail?: string | null;
  billingEmail?: string | null;

  defaultCurrency: string;
  timezone: string;
  language: string;
  invoicePrefix: string;
  orderPrefix: string;
  clientPrefix: string;
  agentPrefix: string;
  driverPrefix: string;
  stockPrefix: string;

  createdById?: string | null;
  updatedById?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateCompanyProfileInput = Omit<
  CompanyProfile,
  'id' | 'createdAt' | 'updatedAt' | 'createdById' | 'updatedById'
>;

export type UpdateCompanyProfileInput = Partial<CreateCompanyProfileInput>;

export type CompanyProfileCompletionSection =
  | 'companyIdentity'
  | 'factoryInformation'
  | 'address'
  | 'contacts'
  | 'management'
  | 'businessHours'
  | 'distribution'
  | 'compliance'
  | 'finance'
  | 'systemConfig'
  | 'profileMedia';

export type CompanyProfileCompletionResponse = {
  percentage: number;
  completedSections: CompanyProfileCompletionSection[];
  missingSections: CompanyProfileCompletionSection[];
  missingFields: string[];
};

