// Seed script: adds the starting data. Safe to run many times (uses upsert,
// so it updates existing rows instead of creating duplicates).
//
// Adds: Nigeria, Akure (active, Food only) with its fee settings, and the
// first admin user from ADMIN_PHONE. Test vendors come in Phase 4.
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

// International phone format: "+", country code, then the number (8 to 15 digits).
const E164 = /^\+[1-9]\d{7,14}$/;

async function main() {
  const adminPhone = process.env.ADMIN_PHONE?.trim();
  if (!adminPhone || !E164.test(adminPhone)) {
    throw new Error(
      'ADMIN_PHONE is missing or invalid in apps/api/.env. Use international format, e.g. +2348012345678',
    );
  }
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DIRECT_URL / DATABASE_URL is missing in apps/api/.env');
  }

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  try {
    const nigeria = await prisma.country.upsert({
      where: { code: 'NG' },
      update: {},
      create: {
        code: 'NG',
        name: 'Nigeria',
        currencyCode: 'NGN',
        dialCode: '+234',
        timezone: 'Africa/Lagos',
        defaultLanguage: 'en',
        isActive: true,
      },
    });

    const akure = await prisma.city.upsert({
      where: { countryId_slug: { countryId: nigeria.id, slug: 'akure' } },
      update: {},
      create: {
        countryId: nigeria.id,
        name: 'Akure',
        slug: 'akure',
        isActive: true,
        enabledCategories: ['FOOD'],
        centerLat: 7.2571,
        centerLng: 5.2058,
        // The service area map boundary is drawn later from the admin panel.
      },
    });

    // Starting fees for Akure. Amounts are in kobo (100 kobo = ₦1).
    // These are only defaults; the admin edits them later.
    await prisma.cityFeeSettings.upsert({
      where: { cityId: akure.id },
      update: {},
      create: {
        cityId: akure.id,
        currencyCode: nigeria.currencyCode,
        baseDeliveryFeeMinor: 50_000, // ₦500
        perKmFeeMinor: 10_000, // ₦100 per km
        serviceFeeMinor: 10_000, // ₦100
        commissionBps: 1_500, // 15%
        riderShareBps: 8_000, // 80% of the delivery fee
      },
    });

    const admin = await prisma.user.upsert({
      where: { phone: adminPhone },
      update: { role: 'ADMIN' },
      create: { phone: adminPhone, name: 'Admin', role: 'ADMIN' },
    });

    // Only show the last 4 digits of the phone number in logs.
    const maskedPhone = `${admin.phone.slice(0, 4)}…${admin.phone.slice(-4)}`;
    console.log(`Seeded ${nigeria.name}, ${akure.name} (active), admin ${maskedPhone}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
