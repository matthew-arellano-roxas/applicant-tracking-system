import 'dotenv/config';
import bcrypt from 'bcrypt';
import { prisma } from '../src/configs/prisma';

type UserFixture = {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  education: string;
  phoneNumber?: string | null;
};

const demoEmails = {
  admin: 'demo.admin@gmail.com',
  applicant: 'demo.applicant@gmail.com',
  hr: 'demo.hr@gmail.com',
  dean: 'demo.dean@gmail.com',
  computerStudiesHead: 'demo.departmenthead.cs@gmail.com',
  educationHead: 'demo.departmenthead.education@gmail.com',
  businessHead: 'demo.departmenthead.business@gmail.com',
  itEmployee: 'demo.employee.it@gmail.com',
  accountingEmployee: 'demo.employee.accounting@gmail.com',
  hrEmployee: 'demo.employee.hr@gmail.com',
  libraryEmployee: 'demo.employee.library@gmail.com',
} as const;

const demoAccounts: UserFixture[] = [
  {
    firstName: 'Demo',
    lastName: 'Administrator',
    email: demoEmails.admin,
    role: 'ADMIN',
    education: 'Demo account',
  },
  {
    firstName: 'Demo',
    lastName: 'Applicant',
    email: demoEmails.applicant,
    role: 'APPLICANT',
    education: 'Demo account',
  },
  {
    firstName: 'Demo',
    lastName: 'HR',
    email: demoEmails.hr,
    role: 'HUMAN_RESOURCE',
    education: 'Human Resource Management',
  },
  {
    firstName: 'Demo',
    lastName: 'Dean',
    email: demoEmails.dean,
    role: 'DEAN',
    education: 'Doctor of Education',
  },
  {
    firstName: 'Demo',
    lastName: 'CS Head',
    email: demoEmails.computerStudiesHead,
    role: 'DEPARTMENT_HEAD',
    education: 'Master of Science in Computer Science',
  },
  {
    firstName: 'Demo',
    lastName: 'Education Head',
    email: demoEmails.educationHead,
    role: 'DEPARTMENT_HEAD',
    education: 'Master of Arts in Education',
  },
  {
    firstName: 'Demo',
    lastName: 'Business Head',
    email: demoEmails.businessHead,
    role: 'DEPARTMENT_HEAD',
    education: 'Master of Business Administration',
  },
  {
    firstName: 'Demo',
    lastName: 'IT Employee',
    email: demoEmails.itEmployee,
    role: 'EMPLOYEE',
    education: 'Information Technology',
  },
  {
    firstName: 'Demo',
    lastName: 'Accounting Employee',
    email: demoEmails.accountingEmployee,
    role: 'EMPLOYEE',
    education: 'Business Administration',
  },
  {
    firstName: 'Demo',
    lastName: 'HR Employee',
    email: demoEmails.hrEmployee,
    role: 'EMPLOYEE',
    education: 'Office Administration',
  },
  {
    firstName: 'Demo',
    lastName: 'Library Employee',
    email: demoEmails.libraryEmployee,
    role: 'EMPLOYEE',
    education: 'Library and Information Science',
  },
];

const applicantProfiles = [
  ['Ana', 'Dela Cruz', 'Master of Education'],
  ['Miguel', 'Santos', 'Bachelor of Science in Information Technology'],
  ['Patricia', 'Reyes', 'Bachelor of Secondary Education'],
  ['Joshua', 'Garcia', 'Bachelor of Science in Computer Science'],
  ['Bea', 'Mendoza', 'Bachelor of Science in Accountancy'],
  ['Carlo', 'Villanueva', 'Master of Arts in English'],
  ['Sofia', 'Ramos', 'Bachelor of Elementary Education'],
  ['Daniel', 'Castillo', 'Bachelor of Science in Information Systems'],
  ['Andrea', 'Aquino', 'Bachelor of Arts in Psychology'],
  ['Gabriel', 'Cruz', 'Master of Science in Mathematics'],
  ['Nicole', 'Fernandez', 'Bachelor of Science in Business Administration'],
  ['Rafael', 'Gonzales', 'Bachelor of Science in Information Technology'],
  ['Jasmine', 'Lopez', 'Bachelor of Secondary Education'],
  ['Enzo', 'Rivera', 'Bachelor of Science in Computer Engineering'],
  ['Camila', 'Morales', 'Bachelor of Arts in Communication'],
  ['Adrian', 'Pascual', 'Master of Information Technology'],
  ['Trisha', 'Aquino', 'Bachelor of Science in Psychology'],
  ['Nathan', 'Domingo', 'Bachelor of Science in Mathematics'],
  ['Angela', 'Salazar', 'Bachelor of Science in Human Resource Development'],
  ['Luis', 'Manalo', 'Bachelor of Science in Accountancy'],
  ['Erika', 'Lim', 'Master of Arts in Education'],
  ['Francis', 'Tan', 'Bachelor of Science in Information Systems'],
  ['Maureen', 'Ocampo', 'Bachelor of Elementary Education'],
  ['Kevin', 'Soriano', 'Bachelor of Science in Computer Science'],
  ['Kyla', 'Pineda', 'Bachelor of Library and Information Science'],
  ['Mark', 'Velasco', 'Bachelor of Science in Business Administration'],
  ['Denise', 'Cabrera', 'Bachelor of Secondary Education'],
  ['John', 'Dizon', 'Bachelor of Science in Information Technology'],
  ['Leah', 'Abad', 'Bachelor of Arts in Psychology'],
  ['Oliver', 'Sarmiento', 'Master of Science in Computer Science'],
];

const campuses = [
  { name: 'MV', location: 'Quezon City' },
  { name: 'San Agustin', location: 'Quezon City' },
  { name: 'Main', location: 'Quezon City' },
  { name: 'Bulacan', location: 'San Jose del Monte, Bulacan' },
];

const departments = [
  { id: 'demo-department-computer-studies', name: 'College of Computer Studies' },
  { id: 'demo-department-education', name: 'College of Education' },
  { id: 'demo-department-business', name: 'Business Administration' },
  { id: 'demo-department-technology', name: 'Information Technology Services' },
  { id: 'demo-department-hr', name: 'Human Resources' },
];

const employeeFixtures = [
  {
    email: demoEmails.computerStudiesHead,
    departmentId: departments[0].id,
    position: 'Department Head, Computer Studies',
    isTeaching: true,
  },
  {
    email: demoEmails.educationHead,
    departmentId: departments[1].id,
    position: 'Department Head, Education',
    isTeaching: true,
  },
  {
    email: demoEmails.businessHead,
    departmentId: departments[2].id,
    position: 'Department Head, Business',
    isTeaching: true,
  },
  {
    email: demoEmails.itEmployee,
    departmentId: departments[3].id,
    position: 'IT Support Specialist',
    isTeaching: false,
  },
  {
    email: demoEmails.accountingEmployee,
    departmentId: departments[2].id,
    position: 'Accountant',
    isTeaching: false,
  },
  {
    email: demoEmails.hrEmployee,
    departmentId: departments[4].id,
    position: 'HR Coordinator',
    isTeaching: false,
  },
  {
    email: demoEmails.libraryEmployee,
    departmentId: departments[1].id,
    position: 'Library Assistant',
    isTeaching: false,
  },
];

const hiringRequestFixtures = [
  {
    position: 'Mathematics Instructor',
    employmentType: 'FULL_TIME',
    isTeaching: true,
    departmentId: departments[1].id,
    campus: 'Main',
    status: 'APPROVED',
    post: {
      title: 'Mathematics Instructor',
      description:
        'Teach general mathematics courses, prepare lesson plans, assess student progress, and participate in department activities.',
      status: 'OPEN',
      employmentType: 'FULL_TIME',
      salaryMin: 28000,
      salaryMax: 36000,
    },
  },
  {
    position: 'Computer Science Instructor',
    employmentType: 'FULL_TIME',
    isTeaching: true,
    departmentId: departments[0].id,
    campus: 'Main',
    status: 'APPROVED',
    post: {
      title: 'Computer Science Instructor',
      description:
        'Deliver programming and computer science courses, mentor students, and contribute to curriculum development.',
      status: 'OPEN',
      employmentType: 'FULL_TIME',
      salaryMin: 30000,
      salaryMax: 42000,
    },
  },
  {
    position: 'Software Support Specialist',
    employmentType: 'FULL_TIME',
    isTeaching: false,
    departmentId: departments[3].id,
    campus: 'MV',
    status: 'APPROVED',
    post: {
      title: 'Software Support Specialist',
      description:
        'Support campus systems, troubleshoot user issues, document incidents, and coordinate with the IT team.',
      status: 'OPEN',
      employmentType: 'FULL_TIME',
      salaryMin: 26000,
      salaryMax: 35000,
    },
  },
  {
    position: 'HR Assistant',
    employmentType: 'FULL_TIME',
    isTeaching: false,
    departmentId: departments[4].id,
    campus: 'Main',
    status: 'APPROVED',
    post: {
      title: 'HR Assistant',
      description:
        'Assist with recruitment coordination, employee files, interview schedules, and onboarding documentation.',
      status: 'OPEN',
      employmentType: 'FULL_TIME',
      salaryMin: 24000,
      salaryMax: 32000,
    },
  },
  {
    position: 'Accountant',
    employmentType: 'FULL_TIME',
    isTeaching: false,
    departmentId: departments[2].id,
    campus: 'San Agustin',
    status: 'APPROVED',
    post: {
      title: 'Accountant',
      description:
        'Maintain financial records, reconcile transactions, prepare reports, and support annual audit activities.',
      status: 'OPEN',
      employmentType: 'FULL_TIME',
      salaryMin: 28000,
      salaryMax: 38000,
    },
  },
  {
    position: 'Network Administrator',
    employmentType: 'FULL_TIME',
    isTeaching: false,
    departmentId: departments[3].id,
    campus: 'Main',
    status: 'FULFILLED',
    post: {
      title: 'Network Administrator',
      description:
        'Maintain network availability, monitor infrastructure, and assist with campus technology projects.',
      status: 'CLOSED',
      employmentType: 'FULL_TIME',
      salaryMin: 32000,
      salaryMax: 45000,
    },
  },
  {
    position: 'Admissions Coordinator',
    employmentType: 'FULL_TIME',
    isTeaching: false,
    departmentId: departments[1].id,
    campus: 'Bulacan',
    status: 'APPROVED',
    post: {
      title: 'Admissions Coordinator',
      description:
        'Guide prospective students through admissions, maintain accurate records, and coordinate enrollment activities.',
      status: 'OPEN',
      employmentType: 'FULL_TIME',
      salaryMin: 25000,
      salaryMax: 33000,
    },
  },
  {
    position: 'Library Assistant',
    employmentType: 'PART_TIME',
    isTeaching: false,
    departmentId: departments[1].id,
    campus: 'San Agustin',
    status: 'FULFILLED',
    post: {
      title: 'Library Assistant',
      description:
        'Support circulation, organize learning resources, and help students access library services.',
      status: 'CLOSED',
      employmentType: 'PART_TIME',
      salaryMin: 15000,
      salaryMax: 21000,
    },
  },
  {
    position: 'Guidance Counselor',
    employmentType: 'FULL_TIME',
    isTeaching: false,
    departmentId: departments[1].id,
    campus: 'Main',
    status: 'APPROVED',
    post: {
      title: 'Guidance Counselor',
      description:
        'Provide student guidance, conduct counseling sessions, and coordinate referrals with school personnel.',
      status: 'OPEN',
      employmentType: 'FULL_TIME',
      salaryMin: 28000,
      salaryMax: 38000,
    },
  },
  {
    position: 'Data Analyst',
    employmentType: 'FULL_TIME',
    isTeaching: false,
    departmentId: departments[2].id,
    campus: 'Main',
    status: 'APPROVED',
    post: {
      title: 'Data Analyst',
      description:
        'Prepare operational reports, validate datasets, and translate findings into clear recommendations.',
      status: 'OPEN',
      employmentType: 'FULL_TIME',
      salaryMin: 30000,
      salaryMax: 42000,
    },
  },
  {
    position: 'Senior English Instructor',
    employmentType: 'FULL_TIME',
    isTeaching: true,
    departmentId: departments[1].id,
    campus: 'MV',
    status: 'FULFILLED',
    post: {
      title: 'Senior English Instructor',
      description:
        'Teach English courses, develop assessments, and mentor students in academic communication.',
      status: 'CLOSED',
      employmentType: 'FULL_TIME',
      salaryMin: 32000,
      salaryMax: 44000,
    },
  },
  {
    position: 'Admissions Records Clerk',
    employmentType: 'FULL_TIME',
    isTeaching: false,
    departmentId: departments[1].id,
    campus: 'Bulacan',
    status: 'APPROVED',
    post: {
      title: 'Admissions Records Clerk',
      description:
        'Maintain admissions records, verify submitted documents, and respond to student inquiries.',
      status: 'OPEN',
      employmentType: 'FULL_TIME',
      salaryMin: 22000,
      salaryMax: 29000,
    },
  },
  {
    position: 'Laboratory Technician',
    employmentType: 'FULL_TIME',
    isTeaching: false,
    departmentId: departments[0].id,
    campus: 'Main',
    status: 'PENDING',
  },
  {
    position: 'Student Affairs Officer',
    employmentType: 'FULL_TIME',
    isTeaching: false,
    departmentId: departments[2].id,
    campus: 'San Agustin',
    status: 'PENDING',
  },
  {
    position: 'Research Methods Instructor',
    employmentType: 'PART_TIME',
    isTeaching: true,
    departmentId: departments[0].id,
    campus: 'MV',
    status: 'DRAFT',
  },
  {
    position: 'Office Clerk',
    employmentType: 'FULL_TIME',
    isTeaching: false,
    departmentId: departments[4].id,
    campus: 'Main',
    status: 'REJECTED',
  },
  {
    position: 'Marketing Assistant',
    employmentType: 'FULL_TIME',
    isTeaching: false,
    departmentId: departments[2].id,
    campus: 'Bulacan',
    status: 'PENDING',
  },
  {
    position: 'Physics Instructor',
    employmentType: 'FULL_TIME',
    isTeaching: true,
    departmentId: departments[0].id,
    campus: 'Main',
    status: 'REJECTED',
  },
];

const applicationStatuses = [
  'APPLIED',
  'SCREENED',
  'SHORTLISTED',
  'INTERVIEW',
  'REJECTED',
  'HIRED',
];

function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

async function upsertUser(fixture: UserFixture, seedPassword: string) {
  const user = await prisma.user.upsert({
    where: { email: fixture.email },
    update: {
      firstName: fixture.firstName,
      lastName: fixture.lastName,
      role: fixture.role,
      education: fixture.education,
      phoneNumber: fixture.phoneNumber ?? null,
      updatedAt: new Date(),
    },
    create: { ...fixture, phoneNumber: fixture.phoneNumber ?? null },
  });
  const hashPassword = await bcrypt.hash(seedPassword, 10);

  await prisma.authIdentity.upsert({
    where: { userId: user.id },
    update: { provider: 'PASSWORD', providerUserId: user.email, hashPassword },
    create: { userId: user.id, provider: 'PASSWORD', providerUserId: user.email, hashPassword },
  });

  return user;
}

async function upsertEmployee(
  id: string,
  userId: string,
  position: string,
  isTeaching: boolean,
  hiredAt: Date,
) {
  const employee = await prisma.employee.upsert({
    where: { id },
    update: { userId, position, employmentType: 'FULL_TIME', isTeaching, hiredAt },
    create: { id, userId, position, employmentType: 'FULL_TIME', isTeaching, hiredAt },
  });

  await prisma.employeeDocumentStatus.upsert({
    where: { employeeId: employee.id },
    update: {
      validId: 'complete',
      tin: 'complete',
      sss: 'complete',
      philhealth: 'pending',
      pagIbig: 'complete',
      medicalRecord: 'pending',
      psa: 'complete',
      birForm: 'pending',
      nbiClearance: 'pending',
    },
    create: {
      employeeId: employee.id,
      validId: 'complete',
      tin: 'complete',
      sss: 'complete',
      philhealth: 'pending',
      pagIbig: 'complete',
      medicalRecord: 'pending',
      psa: 'complete',
      birForm: 'pending',
      nbiClearance: 'pending',
    },
  });

  return employee;
}

async function seed() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Demo seeding is disabled when NODE_ENV is production.');
  }

  const seedPassword = process.env.SEED_PASSWORD;
  if (!seedPassword || seedPassword.length < 8) {
    throw new Error('Set SEED_PASSWORD to a demo password with at least 8 characters.');
  }

  const usersByEmail = new Map<string, Awaited<ReturnType<typeof upsertUser>>>();
  for (const fixture of demoAccounts) {
    usersByEmail.set(fixture.email, await upsertUser(fixture, seedPassword));
  }

  const applicantUsers = [];
  for (const [index, [firstName, lastName, education]] of applicantProfiles.entries()) {
    const email = `candidate${String(index + 1).padStart(2, '0')}@example.com`;
    const user = await upsertUser(
      {
        firstName,
        lastName,
        email,
        role: 'APPLICANT',
        education,
      },
      seedPassword,
    );
    applicantUsers.push(user);
    usersByEmail.set(email, user);
  }

  const demoApplicant = usersByEmail.get(demoEmails.applicant);
  const admin = usersByEmail.get(demoEmails.admin);
  const hr = usersByEmail.get(demoEmails.hr);
  if (!demoApplicant || !admin || !hr) throw new Error('Seed demo accounts were not created.');

  const campusIds = new Map<string, number>();
  for (const campus of campuses) {
    const existing = await prisma.campus.findFirst({ where: { name: campus.name } });
    const saved = existing
      ? await prisma.campus.update({ where: { id: existing.id }, data: campus })
      : await prisma.campus.create({ data: campus });
    campusIds.set(campus.name, saved.id);
  }

  for (const department of departments) {
    await prisma.department.upsert({
      where: { id: department.id },
      update: { name: department.name },
      create: department,
    });
  }

  const employeesByEmail = new Map<string, Awaited<ReturnType<typeof upsertEmployee>>>();
  for (const [index, fixture] of employeeFixtures.entries()) {
    const user = usersByEmail.get(fixture.email);
    if (!user) throw new Error(`Missing demo staff user: ${fixture.email}`);
    const employee = await upsertEmployee(
      `demo-employee-${String(index + 1).padStart(2, '0')}`,
      user.id,
      fixture.position,
      fixture.isTeaching,
      daysFromNow(-365 - index * 120),
    );
    employeesByEmail.set(fixture.email, employee);
  }

  const departmentHeadEmails = [
    demoEmails.computerStudiesHead,
    demoEmails.educationHead,
    demoEmails.businessHead,
  ];
  const departmentHeadById = new Map([
    [departments[0].id, departmentHeadEmails[0]],
    [departments[1].id, departmentHeadEmails[1]],
    [departments[2].id, departmentHeadEmails[2]],
  ]);
  for (const [index, department] of departments.slice(0, 3).entries()) {
    const head = employeesByEmail.get(departmentHeadEmails[index]);
    if (!head) throw new Error(`Missing department head for ${department.name}`);
    await prisma.department.update({
      where: { id: department.id },
      data: { departmentHeadId: head.id },
    });
  }

  for (const fixture of employeeFixtures) {
    const employee = employeesByEmail.get(fixture.email);
    if (!employee) continue;
    await prisma.departmentMember.upsert({
      where: {
        departmentId_employeeId: { departmentId: fixture.departmentId, employeeId: employee.id },
      },
      update: {},
      create: { departmentId: fixture.departmentId, employeeId: employee.id },
    });
  }
  for (const [index, department] of departments.slice(0, 3).entries()) {
    const employee = employeesByEmail.get(departmentHeadEmails[index]);
    if (!employee) continue;
    await prisma.departmentMember.upsert({
      where: { departmentId_employeeId: { departmentId: department.id, employeeId: employee.id } },
      update: {},
      create: { departmentId: department.id, employeeId: employee.id },
    });
  }

  const jobPosts = [];
  for (const [index, fixture] of hiringRequestFixtures.entries()) {
    const requestId = `demo-hiring-request-${String(index + 1).padStart(2, '0')}`;
    const campusId = campusIds.get(fixture.campus);
    if (!campusId) throw new Error(`Missing campus: ${fixture.campus}`);

    await prisma.hiringRequest.upsert({
      where: { id: requestId },
      update: {
        status: fixture.status,
        position: fixture.position,
        employmentType: fixture.employmentType,
        isTeaching: fixture.isTeaching,
        departmentId: fixture.departmentId,
        campusId,
        requirements: {
          education: fixture.isTeaching
            ? 'Relevant degree; teaching experience preferred'
            : 'Relevant degree or equivalent experience',
          experience: fixture.isTeaching
            ? 'At least 2 years of related experience'
            : 'At least 1 year of related experience',
          skills: fixture.isTeaching
            ? ['communication', 'lesson planning', 'subject knowledge']
            : ['communication', 'organization', 'computer literacy'],
        },
      },
      create: {
        id: requestId,
        status: fixture.status,
        position: fixture.position,
        employmentType: fixture.employmentType,
        isTeaching: fixture.isTeaching,
        departmentId: fixture.departmentId,
        campusId,
        requirements: {
          education: fixture.isTeaching
            ? 'Relevant degree; teaching experience preferred'
            : 'Relevant degree or equivalent experience',
          experience: fixture.isTeaching
            ? 'At least 2 years of related experience'
            : 'At least 1 year of related experience',
          skills: fixture.isTeaching
            ? ['communication', 'lesson planning', 'subject knowledge']
            : ['communication', 'organization', 'computer literacy'],
        },
      },
    });

    if (!fixture.post) continue;
    const job = await prisma.jobPost.upsert({
      where: { hiringRequestId: requestId },
      update: {
        title: fixture.post.title,
        description: fixture.post.description,
        status: fixture.post.status,
        employmentType: fixture.post.employmentType,
        approvedBy: hr.id,
        salaryMin: fixture.post.salaryMin,
        salaryMax: fixture.post.salaryMax,
        deletedAt: null,
      },
      create: {
        id: `demo-job-post-${String(index + 1).padStart(2, '0')}`,
        hiringRequestId: requestId,
        title: fixture.post.title,
        description: fixture.post.description,
        status: fixture.post.status,
        employmentType: fixture.post.employmentType,
        approvedBy: hr.id,
        salaryMin: fixture.post.salaryMin,
        salaryMax: fixture.post.salaryMax,
      },
    });
    jobPosts.push({ job, request: fixture });
  }

  const applicants = [demoApplicant, ...applicantUsers];
  const applicationFixtures: Array<{
    id: string;
    user: (typeof applicants)[number];
    job: (typeof jobPosts)[number];
    status: string;
    applyDate: Date;
    scoreStatus: string;
    index: number;
  }> = [];
  let applicationNumber = 0;

  for (const [candidateIndex, user] of applicants.entries()) {
    const firstJobIndex = candidateIndex % jobPosts.length;
    const secondJobIndex = (firstJobIndex + 3 + (candidateIndex % 4)) % jobPosts.length;
    for (const [slot, jobIndex] of [firstJobIndex, secondJobIndex].entries()) {
      const job = jobPosts[jobIndex];
      if (job.job.status !== 'OPEN') continue;

      let status =
        applicationStatuses[
          (candidateIndex * 2 + slot * 3 + jobIndex) % applicationStatuses.length
        ];
      if (user.id === demoApplicant.id) status = slot === 0 ? 'APPLIED' : 'INTERVIEW';
      if ((candidateIndex === 5 && slot === 1) || (candidateIndex === 13 && slot === 0))
        status = 'HIRED';

      applicationNumber += 1;
      const id = `demo-application-${String(applicationNumber).padStart(3, '0')}`;
      const scoreStatus =
        status === 'APPLIED' && applicationNumber % 3 === 0
          ? 'PENDING'
          : applicationNumber % 19 === 0
            ? 'FAILED'
            : 'COMPLETED';
      const applyDate = daysFromNow(-(3 + ((candidateIndex * 7 + slot * 5) % 70)));

      await prisma.applicant.upsert({
        where: { id },
        update: {
          userId: user.id,
          jobPostId: job.job.id,
          status,
          scoreStatus,
          applyDate,
        },
        create: {
          id,
          userId: user.id,
          jobPostId: job.job.id,
          status,
          scoreStatus,
          applyDate,
        },
      });

      if (scoreStatus === 'COMPLETED') {
        const educationalBackground = 15 + ((candidateIndex * 3 + slot) % 11);
        const workExperience = 10 + ((candidateIndex * 5 + slot * 2) % 16);
        const skills = 12 + ((candidateIndex * 7 + slot) % 14);
        const certification = 8 + ((candidateIndex * 2 + slot * 4) % 13);
        await prisma.applicantScore.upsert({
          where: { applicantId: id },
          update: {
            educationalBackground,
            workExperience,
            skills,
            certification,
            totalScore: educationalBackground + workExperience + skills + certification,
          },
          create: {
            applicantId: id,
            educationalBackground,
            workExperience,
            skills,
            certification,
            totalScore: educationalBackground + workExperience + skills + certification,
          },
        });
      } else {
        await prisma.applicantScore.deleteMany({ where: { applicantId: id } });
      }

      applicationFixtures.push({
        id,
        user,
        job,
        status,
        applyDate,
        scoreStatus,
        index: candidateIndex,
      });
    }
  }

  const hiredApplicants = new Map<
    string,
    { userId: string; job: (typeof jobPosts)[number]; index: number }
  >();
  for (const application of applicationFixtures) {
    if (application.status === 'HIRED') {
      hiredApplicants.set(application.user.id, {
        userId: application.user.id,
        job: application.job,
        index: application.index,
      });
    }

    if (application.status !== 'INTERVIEW' && application.status !== 'HIRED') continue;
    const headEmail = departmentHeadById.get(application.job.request.departmentId);
    const interviewer = (headEmail && usersByEmail.get(headEmail)) || hr;
    const scheduled = application.status === 'INTERVIEW';
    const interviewId = `demo-interview-${application.id}`;
    const stage =
      scheduled && application.job.request.isTeaching
        ? 'DEMO_TEACHING'
        : scheduled
          ? 'DEPARTMENT'
          : 'FINAL';
    const interviewDate = scheduled
      ? daysFromNow(1 + (application.index % 14))
      : daysFromNow(-(2 + (application.index % 30)));

    const interview = await prisma.interview.upsert({
      where: { id: interviewId },
      update: {
        applicantId: application.id,
        interviewerId: interviewer.id,
        stage,
        date: interviewDate,
        durationMinutes: stage === 'DEMO_TEACHING' ? 45 : 60,
        timeZone: 'Asia/Manila',
        type: application.index % 2 === 0 ? 'ONSITE' : 'ONLINE',
        status: scheduled ? 'SCHEDULED' : 'COMPLETED',
        location: application.index % 2 === 0 ? 'Human Resources Conference Room' : null,
        meetingUrl: application.index % 2 === 0 ? null : 'https://meet.example.com/demo-interview',
        instructions: scheduled
          ? 'Please bring a valid ID and arrive 10 minutes before your scheduled time.'
          : 'Interview completed.',
        notes: scheduled
          ? null
          : 'Candidate demonstrated relevant experience and clear communication.',
      },
      create: {
        id: interviewId,
        applicantId: application.id,
        interviewerId: interviewer.id,
        stage,
        date: interviewDate,
        durationMinutes: stage === 'DEMO_TEACHING' ? 45 : 60,
        timeZone: 'Asia/Manila',
        type: application.index % 2 === 0 ? 'ONSITE' : 'ONLINE',
        status: scheduled ? 'SCHEDULED' : 'COMPLETED',
        location: application.index % 2 === 0 ? 'Human Resources Conference Room' : null,
        meetingUrl: application.index % 2 === 0 ? null : 'https://meet.example.com/demo-interview',
        instructions: scheduled
          ? 'Please bring a valid ID and arrive 10 minutes before your scheduled time.'
          : 'Interview completed.',
        notes: scheduled
          ? null
          : 'Candidate demonstrated relevant experience and clear communication.',
      },
    });

    if (!scheduled) {
      await prisma.interviewEvaluation.upsert({
        where: {
          interviewId_evaluatorId: { interviewId: interview.id, evaluatorId: interviewer.id },
        },
        update: {
          ratings: {
            communication: 4,
            relevantExperience: 4,
            motivation: 5,
            professionalism: 4,
            studentSafetyAwareness: 4,
          },
          recommendation: application.index % 2 === 0 ? 'STRONG_YES' : 'YES',
          strengths: 'Relevant experience, thoughtful answers, and a professional approach.',
          concerns: null,
          comments: 'Recommended to proceed based on the completed interview.',
        },
        create: {
          interviewId: interview.id,
          evaluatorId: interviewer.id,
          ratings: {
            communication: 4,
            relevantExperience: 4,
            motivation: 5,
            professionalism: 4,
            studentSafetyAwareness: 4,
          },
          recommendation: application.index % 2 === 0 ? 'STRONG_YES' : 'YES',
          strengths: 'Relevant experience, thoughtful answers, and a professional approach.',
          concerns: null,
          comments: 'Recommended to proceed based on the completed interview.',
        },
      });
    }
  }

  const hiredUsers = new Map<string, Awaited<ReturnType<typeof upsertEmployee>>>();
  for (const [index, hire] of [...hiredApplicants.values()].entries()) {
    const employee = await upsertEmployee(
      `demo-employee-hired-${String(index + 1).padStart(2, '0')}`,
      hire.userId,
      hire.job.request.position,
      hire.job.request.isTeaching,
      daysFromNow(-(30 + (hire.index % 180))),
    );
    hiredUsers.set(hire.userId, employee);
    await prisma.user.update({
      where: { id: hire.userId },
      data: { role: 'EMPLOYEE', updatedAt: new Date() },
    });
    await prisma.departmentMember.upsert({
      where: {
        departmentId_employeeId: {
          departmentId: hire.job.request.departmentId,
          employeeId: employee.id,
        },
      },
      update: {},
      create: { departmentId: hire.job.request.departmentId, employeeId: employee.id },
    });
  }

  for (const { job } of jobPosts) {
    const applicationCount = applicationFixtures.filter(
      ({ job: applicationJob }) => applicationJob.job.id === job.id,
    ).length;
    await prisma.jobPost.update({ where: { id: job.id }, data: { applicationCount } });
  }

  console.log(
    `Seeded ${campuses.length} campuses, ${departments.length} departments, ${demoAccounts.length + applicantProfiles.length} accounts, ${employeeFixtures.length + hiredUsers.size} employee records, ${hiringRequestFixtures.length} hiring requests, ${jobPosts.length} job posts, ${applicationFixtures.length} applications, and interview demo records.`,
  );
  console.log(
    `Demo logins: ${demoAccounts.map(({ email, role }) => `${email} (${role})`).join(', ')}`,
  );
  console.log('All demo accounts use the local SEED_PASSWORD value.');
}

seed()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
