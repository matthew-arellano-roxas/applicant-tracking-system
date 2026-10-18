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
  {
    firstName: 'Alex',
    lastName: 'Morgan',
    email: 'alex.morgan@example.com',
    education: 'BSBA',
    role: 'APPLICANT',
  },
];

const departments = [
  'Human Resources',
  'Information Technology',
  'Finance',
  'Administration',
];

const campuses = [
  { name: 'MV', location: 'Quezon City' },
  { name: 'San Agustin', location: 'Quezon City' },
  { name: 'Main', location: 'Quezon City' },
  { name: 'Bulacan', location: 'San Jose Del Monte, Bulacan' },
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

  for (const name of departments) {
    const existing = await prisma.department.findFirst({
      where: { name },
    });

    if (existing) {
      console.log(`Department ${name} already exists, skipping`);
      continue;
    }

    const created = await prisma.department.create({ data: { name } });
    console.log(`Created department: ${created.name}`);
  }

  for (const campus of campuses) {
    const existing = await prisma.campus.findFirst({
      where: { name: campus.name, location: campus.location },
    });

    if (existing) {
      console.log(`Campus ${campus.name} already exists, skipping`);
      continue;
    }

    const created = await prisma.campus.create({ data: campus });
    console.log(`Created campus: ${created.name} (${created.location})`);
  }

  const hrUser = await prisma.user.findUnique({
    where: { email: 'matthewroxas83@gmail.com' },
  });
  const hrDepartment = await prisma.department.findFirst({
    where: { name: 'Human Resources' },
  });

  if (!hrUser || !hrDepartment) {
    throw new Error('HR seed user or Human Resources department was not found');
  }

  const existingEmployee = await prisma.employee.findFirst({
    where: { userId: hrUser.id },
  });

  if (existingEmployee) {
    console.log(`Employee for ${hrUser.email} already exists, skipping`);
  } else {
    const employee = await prisma.employee.create({
      data: {
        userId: hrUser.id,
        position: 'HR Manager',
        employmentType: 'FULL_TIME',
        isTeaching: false,
        departments: { connect: { id: hrDepartment.id } },
      },
    });
    console.log(`Created employee: ${employee.position} (${hrUser.email})`);
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
