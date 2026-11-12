import { prisma } from '../src/configs';

const campuses = [
  { name: 'MV', location: 'Quezon City' },
  { name: 'San Agustin', location: 'Quezon City' },
  { name: 'Main', location: 'Quezon City' },
  { name: 'Bulacan', location: 'San Jose Del Monte, Bulacan' },
];

async function seed() {
  for (const campusData of campuses) {
    const existing = await prisma.campus.findFirst({ where: { name: campusData.name } });

    if (existing) {
      await prisma.campus.update({ where: { id: existing.id }, data: campusData });
    } else {
      await prisma.campus.create({ data: campusData });
    }
  }

  console.log(`Seeded ${campuses.length} campuses.`);
}

seed()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
