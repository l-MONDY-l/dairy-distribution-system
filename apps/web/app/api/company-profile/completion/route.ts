import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type {
  CompanyProfileCompletionResponse,
  CompanyProfileCompletionSection,
} from '@/lib/types/company-profile';

const sectionFields: Record<CompanyProfileCompletionSection, (keyof any)[]> = {
  companyIdentity: [
    'companyCode',
    'legalName',
    'brandName',
    'registrationNumber',
    'companyEmail',
    'companyPhone',
    'businessType',
    'industryType',
  ],
  factoryInformation: [
    'factoryName',
    'factoryLicenseNumber',
    'foodSafetyLicenseNumber',
    'dairyBoardRegistrationNumber',
    'processingCapacityLitersPerDay',
    'coldStorageCapacityLiters',
    'factoryPhone',
    'factoryEmail',
  ],
  address: ['addressLine1', 'city', 'district', 'province', 'postalCode', 'country'],
  contacts: ['companyEmail', 'companyPhone', 'companyMobile', 'whatsappNumber', 'website'],
  management: [
    'ownerName',
    'managingDirectorName',
    'operationsManagerName',
    'financeManagerName',
    'factoryManagerName',
    'primaryContactPerson',
    'primaryContactPhone',
  ],
  businessHours: [
    'businessOpenTime',
    'businessCloseTime',
    'factoryOpenTime',
    'factoryCloseTime',
    'deliveryStartTime',
    'deliveryEndTime',
    'workingDays',
  ],
  distribution: [
    'distributionRegions',
    'fleetSize',
    'numberOfDrivers',
    'numberOfAgents',
    'dailyDeliveryCapacity',
  ],
  compliance: ['hasSLS', 'hasISO22000', 'hasHACCP', 'hasISO9001'],
  finance: ['bankName', 'accountNumber', 'defaultCurrency'],
  systemConfig: [
    'defaultCurrency',
    'timezone',
    'language',
    'invoicePrefix',
    'orderPrefix',
    'clientPrefix',
    'agentPrefix',
    'driverPrefix',
    'stockPrefix',
  ],
  profileMedia: ['logoUrl', 'profileImageUrl'],
};

export async function GET() {
  try {
    const profile = await prisma.companyProfile.findFirst();

    // No row yet – return empty completion, not an error
    if (!profile) {
      const empty: CompanyProfileCompletionResponse = {
        percentage: 0,
        completedSections: [],
        missingSections: Object.keys(sectionFields) as CompanyProfileCompletionSection[],
        missingFields: [],
      };
      return NextResponse.json(empty, { status: 200 });
    }

    const missingFields: string[] = [];
    const completedSections: CompanyProfileCompletionSection[] = [];
    const missingSections: CompanyProfileCompletionSection[] = [];

    (Object.keys(sectionFields) as CompanyProfileCompletionSection[]).forEach((section) => {
      const fields = sectionFields[section];
      const sectionMissing: string[] = [];

      fields.forEach((field) => {
        const value = (profile as any)[field];
        const isEmpty =
          value === null ||
          value === undefined ||
          (typeof value === 'string' && value.trim().length === 0) ||
          (Array.isArray(value) && value.length === 0) ||
          (typeof value === 'number' && Number.isNaN(value));

        const isBooleanFalseButFilled = typeof value === 'boolean' && value === false;

        if (isEmpty && !isBooleanFalseButFilled) {
          sectionMissing.push(field as string);
        }
      });

      if (sectionMissing.length === 0) {
        completedSections.push(section);
      } else {
        missingSections.push(section);
        missingFields.push(...sectionMissing.map((f) => `${section}.${f}`));
      }
    });

    const totalSections = Object.keys(sectionFields).length;
    const percentage =
      totalSections === 0 ? 100 : Math.round((completedSections.length / totalSections) * 100);

    const result: CompanyProfileCompletionResponse = {
      percentage,
      completedSections,
      missingSections,
      missingFields,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('GET /api/company-profile/completion error', error);
    return NextResponse.json(
      {
        message: 'Failed to compute profile completion',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}


