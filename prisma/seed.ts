import { prisma } from '../src/configs';

const users = [
  {
    firstName: 'Matthew',
    lastName: 'Roxas',
    email: 'matthewroxas29@gmail.com',
    education: 'BSCPE',
    role: 'ADMIN',
  },
  {
    firstName: 'Matthew',
    lastName: 'Roxas',
    email: 'matthewroxas83@gmail.com',
    education: 'BSCPE',
    role: 'HR',
  },
  {
    firstName: 'Matthew',
    lastName: 'Roxas',
    email: 'matthewroxasyt@gmail.com',
    education: 'BSCPE',
    role: 'INTERVIEWER',
  },
  {
    firstName: 'Matthew',
    lastName: 'Roxas',
    email: 'matthewroxas63@gmail.com',
    education: 'BSCPE',
    role: 'APPLICANT',
  },
  {
    firstName: 'Matthew',
    lastName: 'Roxas',
    email: '107159100350.roxas11ictcp@gmail.com',
    education: 'BSCPE',
    role: 'APPLICANT',
  },
];

async function seed() {
  for (const user of users) {
    const existing = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (existing) {
      console.log(`User ${user.email} already exists, skipping`);
      continue;
    }

    const created = await prisma.user.create({ data: user });
    console.log(`Created user: ${created.email} (${created.role})`);
  }
}

seed()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
