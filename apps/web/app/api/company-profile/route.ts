import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateCompanyProfileSchema } from '@/lib/validations/company-profile';

export async function GET() {
  try {
    const profile = await prisma.companyProfile.findFirst();

    if (!profile) {
      return NextResponse.json(
        { message: 'Company profile not found', error: null },
        { status: 404 },
      );
    }

    return NextResponse.json(profile, { status: 200 });
  } catch (error) {
    console.error('GET /api/company-profile error', error);
    return NextResponse.json(
      {
        message: 'Failed to load company profile',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const existing = await prisma.companyProfile.findFirst();
    if (existing) {
      return NextResponse.json(
        {
          message: 'Company profile already exists. Use PUT to update.',
          error: null,
        },
        { status: 400 },
      );
    }

    const body = (await req.json()) as Record<string, unknown>;

    // Minimal, safe defaults so we can create a row from a partial section
    const data = {
      companyCode: String(body.companyCode ?? ''),
      legalName: String(body.legalName ?? ''),
      brandName: String(body.brandName ?? ''),
      registrationNumber: String(body.registrationNumber ?? ''),
      taxId: (body.taxId as string | null) ?? null,
      vatNumber: (body.vatNumber as string | null) ?? null,
      businessType: (body.businessType as string) ?? 'PRIVATE_LIMITED',
      industryType:
        (body.industryType as string) ?? 'DAIRY_MANUFACTURING_DISTRIBUTION',
      companyEmail: String(body.companyEmail ?? ''),
      companyPhone: String(body.companyPhone ?? ''),
      companyMobile: (body.companyMobile as string | null) ?? null,
      whatsappNumber: (body.whatsappNumber as string | null) ?? null,
      website: (body.website as string | null) ?? null,
      logoUrl: (body.logoUrl as string | null) ?? null,
      profileImageUrl: (body.profileImageUrl as string | null) ?? null,
      description: (body.description as string | null) ?? null,
      establishedDate: body.establishedDate
        ? new Date(String(body.establishedDate))
        : null,
      isActive: (body.isActive as boolean) ?? true,

      factoryName: (body.factoryName as string | null) ?? null,
      factoryLicenseNumber: (body.factoryLicenseNumber as string | null) ?? null,
      foodSafetyLicenseNumber:
        (body.foodSafetyLicenseNumber as string | null) ?? null,
      dairyBoardRegistrationNumber:
        (body.dairyBoardRegistrationNumber as string | null) ?? null,
      processingCapacityLitersPerDay:
        typeof body.processingCapacityLitersPerDay === 'number'
          ? (body.processingCapacityLitersPerDay as number)
          : 0,
      coldStorageCapacityLiters:
        typeof body.coldStorageCapacityLiters === 'number'
          ? (body.coldStorageCapacityLiters as number)
          : 0,
      factoryPhone: (body.factoryPhone as string | null) ?? null,
      factoryEmail: (body.factoryEmail as string | null) ?? null,

      addressLine1: String(body.addressLine1 ?? ''),
      addressLine2: (body.addressLine2 as string | null) ?? null,
      street: (body.street as string | null) ?? null,
      city: String(body.city ?? ''),
      district: String(body.district ?? ''),
      province: String(body.province ?? ''),
      postalCode: String(body.postalCode ?? ''),
      country: String(body.country ?? ''),
      latitude:
        typeof body.latitude === 'number' ? (body.latitude as number) : null,
      longitude:
        typeof body.longitude === 'number' ? (body.longitude as number) : null,

      ownerName: (body.ownerName as string | null) ?? null,
      managingDirectorName: (body.managingDirectorName as string | null) ?? null,
      operationsManagerName:
        (body.operationsManagerName as string | null) ?? null,
      financeManagerName: (body.financeManagerName as string | null) ?? null,
      factoryManagerName: (body.factoryManagerName as string | null) ?? null,
      primaryContactPerson: String(body.primaryContactPerson ?? ''),
      primaryContactEmail: (body.primaryContactEmail as string | null) ?? null,
      primaryContactPhone: String(body.primaryContactPhone ?? ''),
      emergencyContactName: (body.emergencyContactName as string | null) ?? null,
      emergencyContactPhone:
        (body.emergencyContactPhone as string | null) ?? null,

      businessOpenTime: (body.businessOpenTime as string | null) ?? null,
      businessCloseTime: (body.businessCloseTime as string | null) ?? null,
      factoryOpenTime: (body.factoryOpenTime as string | null) ?? null,
      factoryCloseTime: (body.factoryCloseTime as string | null) ?? null,
      deliveryStartTime: (body.deliveryStartTime as string | null) ?? null,
      deliveryEndTime: (body.deliveryEndTime as string | null) ?? null,
      workingDays: Array.isArray(body.workingDays)
        ? (body.workingDays as string[])
        : [],

      distributionRegions: Array.isArray(body.distributionRegions)
        ? (body.distributionRegions as string[])
        : [],
      fleetSize:
        typeof body.fleetSize === 'number' ? (body.fleetSize as number) : 0,
      numberOfDrivers:
        typeof body.numberOfDrivers === 'number'
          ? (body.numberOfDrivers as number)
          : 0,
      numberOfAgents:
        typeof body.numberOfAgents === 'number'
          ? (body.numberOfAgents as number)
          : 0,
      dailyDeliveryCapacity:
        typeof body.dailyDeliveryCapacity === 'number'
          ? (body.dailyDeliveryCapacity as number)
          : 0,
      supportsIslandwideDelivery:
        (body.supportsIslandwideDelivery as boolean) ?? false,

      hasSLS: (body.hasSLS as boolean) ?? false,
      hasISO22000: (body.hasISO22000 as boolean) ?? false,
      hasHACCP: (body.hasHACCP as boolean) ?? false,
      hasISO9001: (body.hasISO9001 as boolean) ?? false,
      certificationNotes: (body.certificationNotes as string | null) ?? null,

      bankName: (body.bankName as string | null) ?? null,
      bankBranch: (body.bankBranch as string | null) ?? null,
      accountName: (body.accountName as string | null) ?? null,
      accountNumber: (body.accountNumber as string | null) ?? null,
      swiftCode: (body.swiftCode as string | null) ?? null,
      paymentSupportEmail:
        (body.paymentSupportEmail as string | null) ?? null,
      billingEmail: (body.billingEmail as string | null) ?? null,

      defaultCurrency: String(body.defaultCurrency ?? 'LKR'),
      timezone: String(body.timezone ?? 'Asia/Colombo'),
      language: String(body.language ?? 'en'),
      invoicePrefix: String(body.invoicePrefix ?? 'INV-'),
      orderPrefix: String(body.orderPrefix ?? 'ORD-'),
      clientPrefix: String(body.clientPrefix ?? 'CLT-'),
      agentPrefix: String(body.agentPrefix ?? 'AGT-'),
      driverPrefix: String(body.driverPrefix ?? 'DRV-'),
      stockPrefix: String(body.stockPrefix ?? 'STK-'),
    };

    const created = await prisma.companyProfile.create({ data });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('POST /api/company-profile error', error);
    return NextResponse.json(
      {
        message: 'Failed to create company profile',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const existing = await prisma.companyProfile.findFirst();
    if (!existing) {
      return NextResponse.json(
        {
          message: 'Company profile does not exist. Use POST to create.',
          error: null,
        },
        { status: 404 },
      );
    }

    const body = await req.json();
    const parsed = updateCompanyProfileSchema.safeParse(body);

    if (!parsed.success) {
      const flattened = parsed.error.flatten();
      const firstFieldError =
        Object.values(flattened.fieldErrors)
          .flat()
          .find((msg) => !!msg) ?? 'Validation failed';

      return NextResponse.json(
        {
          message: 'Validation failed',
          error: firstFieldError,
          details: flattened,
        },
        { status: 400 },
      );
    }

    const updated = await prisma.companyProfile.update({
      where: { id: existing.id },
      data: parsed.data,
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('PUT /api/company-profile error', error);
    return NextResponse.json(
      {
        message: 'Failed to update company profile',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

