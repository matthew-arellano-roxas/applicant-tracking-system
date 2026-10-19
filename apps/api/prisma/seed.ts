import bcrypt from 'bcrypt';
import { prisma } from '../src/configs';

// These accounts are for local development/testing only. They all use this password.
const seedPassword = 'MatthewRoxas55!';

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
    role: 'HUMAN_RESOURCE',
  },
  {
    firstName: 'Matthew',
    lastName: 'Roxas',
    email: 'matthewroxasyt@gmail.com',
    education: 'BSCPE',
    role: 'EMPLOYEE',
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
  {
    firstName: 'Jordan',
    lastName: 'Reyes',
    email: 'dean@example.edu',
    education: 'EdD',
    role: 'DEAN',
  },
  {
    firstName: 'Taylor',
    lastName: 'Santos',
    email: 'department.head@example.edu',
    education: 'BSCS',
    role: 'DEPARTMENT_HEAD',
  },
];

const campuses = [
  { name: 'MV', location: 'Quezon City' },
  { name: 'San Agustin', location: 'Quezon City' },
  { name: 'Main', location: 'Quezon City' },
  { name: 'Bulacan', location: 'San Jose Del Monte, Bulacan' },
];

const departmentNames = [
  'Human Resources',
  'College of Information Technology',
  'College of Education',
  "Registrar's Office",
  'Finance Office',
  'Student Affairs',
];

// Requirements use a TipTap-style document, matching the rich-text editor data
// stored by hiring requests and consumed by the CV scoring service.
const richTextRequirements = (lines: string[]) => ({
  type: 'doc',
  content: lines.map((text) => ({
    type: 'paragraph',
    content: [{ type: 'text', text }],
  })),
});

async function seed() {
  const passwordHash = await bcrypt.hash(seedPassword, 10);
  const userByEmail = new Map<string, { id: string; role: string }>();

  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        education: userData.education,
        role: userData.role,
      },
      create: userData,
    });

    await prisma.authIdentity.upsert({
      where: { userId: user.id },
      update: {
        provider: 'PASSWORD',
        providerUserId: user.email.toLowerCase(),
        hashPassword: passwordHash,
      },
      create: {
        userId: user.id,
        provider: 'PASSWORD',
        providerUserId: user.email.toLowerCase(),
        hashPassword: passwordHash,
      },
    });

    userByEmail.set(user.email, { id: user.id, role: user.role });
  }

  const campusByName = new Map<string, { id: number; name: string; location: string }>();
  for (const campusData of campuses) {
    const existing = await prisma.campus.findFirst({ where: { name: campusData.name } });
    const campus = existing
      ? await prisma.campus.update({ where: { id: existing.id }, data: campusData })
      : await prisma.campus.create({ data: campusData });
    campusByName.set(campus.name, campus);
  }

  const departmentByName = new Map<string, { id: string; name: string }>();
  for (const name of departmentNames) {
    const existing = await prisma.department.findFirst({ where: { name } });
    const department = existing
      ? await prisma.department.update({ where: { id: existing.id }, data: { name } })
      : await prisma.department.create({ data: { name } });
    departmentByName.set(name, department);
  }

  const employeeSeeds = [
    {
      email: 'matthewroxas83@gmail.com',
      position: 'Human Resources Manager',
      isTeaching: false,
      department: 'Human Resources',
      idTypes: ['PHILIPPINE_NATIONAL_ID', 'PASSPORT'],
    },
    {
      email: 'matthewroxasyt@gmail.com',
      position: 'IT Faculty Interviewer',
      isTeaching: false,
      department: 'College of Information Technology',
      idTypes: ['PASSPORT', 'DRIVERS_LICENSE'],
    },
    {
      email: 'dean@example.edu',
      position: 'Dean of the College of Education',
      isTeaching: true,
      department: 'College of Education',
      idTypes: ['PRC_ID', 'PHILIPPINE_NATIONAL_ID'],
    },
    {
      email: 'department.head@example.edu',
      position: 'IT Department Chair',
      isTeaching: false,
      department: 'College of Information Technology',
      idTypes: ['UMID'],
    },
  ] as const;

  const employeeByEmail = new Map<string, { id: string }>();
  for (const employeeData of employeeSeeds) {
    const user = userByEmail.get(employeeData.email);
    const department = departmentByName.get(employeeData.department);
    if (!user || !department)
      throw new Error(`Missing seed user or department for ${employeeData.email}`);

    const existing = await prisma.employee.findFirst({ where: { userId: user.id } });
    const employee = existing
      ? await prisma.employee.update({
          where: { id: existing.id },
          data: {
            position: employeeData.position,
            employmentType: 'FULL_TIME',
            isTeaching: employeeData.isTeaching,
          },
        })
      : await prisma.employee.create({
          data: {
            userId: user.id,
            position: employeeData.position,
            employmentType: 'FULL_TIME',
            isTeaching: employeeData.isTeaching,
          },
        });

    employeeByEmail.set(employeeData.email, { id: employee.id });

    await prisma.departmentMember.upsert({
      where: { departmentId_employeeId: { departmentId: department.id, employeeId: employee.id } },
      update: {},
      create: { departmentId: department.id, employeeId: employee.id },
    });

    // Seed a mix of checklist statuses; Taylor has one of the required two IDs so HR can test adding the second.
    const validIdStatus = employeeData.idTypes.length === 2 ? 'complete' : 'pending';
    await prisma.employeeDocumentStatus.upsert({
      where: { employeeId: employee.id },
      update: {
        validId: validIdStatus,
        tin: 'complete',
        sss: 'complete',
        philhealth: 'complete',
        pagIbig: 'complete',
        medicalRecord: 'pending',
        psa: 'pending',
        birForm: 'pending',
        nbiClearance: 'pending',
      },
      create: {
        employeeId: employee.id,
        validId: validIdStatus,
        tin: 'complete',
        sss: 'complete',
        philhealth: 'complete',
        pagIbig: 'complete',
        medicalRecord: 'pending',
        psa: 'pending',
        birForm: 'pending',
        nbiClearance: 'pending',
      },
    });
    await prisma.submittedId.deleteMany({ where: { employeeId: employee.id } });
    await prisma.submittedId.createMany({
      data: employeeData.idTypes.map((idType) => ({
        employeeId: employee.id,
        idType,
        notes: 'Seed test record: original ID presented and checked in person.',
      })),
    });
  }

  const hrEmployee = employeeByEmail.get('matthewroxas83@gmail.com');
  const itHead = employeeByEmail.get('department.head@example.edu');
  const academicDean = employeeByEmail.get('dean@example.edu');
  if (!hrEmployee || !itHead || !academicDean)
    throw new Error('Could not create department leadership employees');

  await prisma.department.update({
    where: { id: departmentByName.get('Human Resources')!.id },
    data: { departmentHeadId: hrEmployee.id },
  });
  await prisma.department.update({
    where: { id: departmentByName.get('College of Information Technology')!.id },
    data: { departmentHeadId: itHead.id },
  });
  await prisma.department.update({
    where: { id: departmentByName.get('College of Education')!.id },
    data: { departmentHeadId: academicDean.id },
  });

  const hiringRequestSeeds = [
    {
      key: 'hr-assistant',
      position: 'Human Resources Assistant',
      status: 'APPROVED',
      employmentType: 'FULL_TIME',
      isTeaching: false,
      department: 'Human Resources',
      campus: 'Main',
      requirements: richTextRequirements([
        'Education: Bachelor’s degree in Human Resources, Psychology, Business Administration, or a related field.',
        'Skills: Communication, record keeping, organization, and Microsoft Office.',
        'Experience: School or office administrative experience is preferred.',
      ]),
    },
    {
      key: 'it-support',
      position: 'IT Support Specialist',
      status: 'APPROVED',
      employmentType: 'FULL_TIME',
      isTeaching: false,
      department: 'College of Information Technology',
      campus: 'MV',
      requirements: richTextRequirements([
        'Education: Bachelor’s degree in Information Technology, Computer Science, or a related field.',
        'Skills: Computer troubleshooting, networking basics, Windows, and technical support.',
        'Experience: Supporting computer laboratories or educational technology is preferred.',
      ]),
    },
    {
      key: 'faculty-instructor',
      position: 'Computer Science Instructor',
      status: 'APPROVED',
      employmentType: 'FULL_TIME',
      isTeaching: true,
      department: 'College of Education',
      campus: 'San Agustin',
      requirements: richTextRequirements([
        'Education: Bachelor’s degree in Computer Science or a related field.',
        'Certification: Professional teaching certification is preferred.',
        'Skills: Programming, lesson planning, classroom management, and student assessment.',
        'Experience: Teaching or tutoring programming is preferred.',
      ]),
    },
    {
      key: 'registrar-assistant',
      position: 'Registrar Assistant',
      status: 'DRAFT',
      employmentType: 'FULL_TIME',
      isTeaching: false,
      department: "Registrar's Office",
      campus: 'Bulacan',
      requirements: richTextRequirements([
        'Education: Bachelor’s degree in Business Administration, Information Management, or a related field.',
        'Skills: Student records management, attention to detail, and customer service.',
        'Experience: Registrar or school office experience is preferred.',
      ]),
    },
  ];

  const requestByKey = new Map<string, { id: string; position: string }>();
  for (const requestData of hiringRequestSeeds) {
    const department = departmentByName.get(requestData.department);
    const campus = campusByName.get(requestData.campus);
    if (!department || !campus)
      throw new Error(`Missing department or campus for ${requestData.key}`);

    const existing = await prisma.hiringRequest.findFirst({
      where: { position: requestData.position, departmentId: department.id, campusId: campus.id },
    });
    const request = existing
      ? await prisma.hiringRequest.update({
          where: { id: existing.id },
          data: {
            status: requestData.status,
            employmentType: requestData.employmentType,
            isTeaching: requestData.isTeaching,
            requirements: requestData.requirements,
          },
        })
      : await prisma.hiringRequest.create({
          data: {
            status: requestData.status,
            position: requestData.position,
            employmentType: requestData.employmentType,
            isTeaching: requestData.isTeaching,
            requirements: requestData.requirements,
            departmentId: department.id,
            campusId: campus.id,
          },
        });
    requestByKey.set(requestData.key, { id: request.id, position: request.position });
  }

  const hrUser = userByEmail.get('matthewroxas83@gmail.com');
  if (!hrUser) throw new Error('Missing HR account');
  const jobPostSeeds = [
    {
      requestKey: 'hr-assistant',
      title: 'Human Resources Assistant',
      status: 'OPEN',
      salaryMin: 22000,
      salaryMax: 30000,
    },
    {
      requestKey: 'it-support',
      title: 'IT Support Specialist',
      status: 'OPEN',
      salaryMin: 30000,
      salaryMax: 50000,
    },
    {
      requestKey: 'faculty-instructor',
      title: 'Computer Science Instructor',
      status: 'CLOSED',
      salaryMin: 28000,
      salaryMax: 45000,
    },
  ];

  const jobPostByKey = new Map<string, { id: string; title: string }>();
  for (const postData of jobPostSeeds) {
    const request = requestByKey.get(postData.requestKey);
    if (!request) throw new Error(`Missing hiring request ${postData.requestKey}`);
    const post = await prisma.jobPost.upsert({
      where: { hiringRequestId: request.id },
      update: {
        title: postData.title,
        description: `Join the school team as a ${postData.title}.`,
        status: postData.status,
        employmentType: 'FULL_TIME',
        approvedBy: hrUser.id,
        salaryMin: postData.salaryMin,
        salaryMax: postData.salaryMax,
        deletedAt: null,
      },
      create: {
        hiringRequestId: request.id,
        title: postData.title,
        description: `Join the school team as a ${postData.title}.`,
        status: postData.status,
        employmentType: 'FULL_TIME',
        approvedBy: hrUser.id,
        salaryMin: postData.salaryMin,
        salaryMax: postData.salaryMax,
      },
    });
    jobPostByKey.set(postData.requestKey, { id: post.id, title: post.title });
  }

  const applicantSeeds = [
    {
      email: 'matthewroxas63@gmail.com',
      postKey: 'it-support',
      status: 'SHORTLISTED',
      score: [18, 16, 19, 15],
    },
    {
      email: '107159100350.roxas11ictcp@gmail.com',
      postKey: 'faculty-instructor',
      status: 'INTERVIEW',
      score: [17, 18, 16, 14],
    },
    {
      email: 'alex.morgan@example.com',
      postKey: 'hr-assistant',
      status: 'APPLIED',
      score: [15, 12, 16, 13],
    },
  ];

  for (const [index, applicantData] of applicantSeeds.entries()) {
    const user = userByEmail.get(applicantData.email);
    const post = jobPostByKey.get(applicantData.postKey);
    if (!user || !post)
      throw new Error(`Missing applicant account or job post for ${applicantData.email}`);

    const existing = await prisma.applicant.findFirst({
      where: { userId: user.id, jobPostId: post.id },
    });
    const applicant = existing
      ? await prisma.applicant.update({
          where: { id: existing.id },
          data: { status: applicantData.status, scoreStatus: 'COMPLETED' },
        })
      : await prisma.applicant.create({
          data: {
            userId: user.id,
            jobPostId: post.id,
            status: applicantData.status,
            scoreStatus: 'COMPLETED',
          },
        });

    const [educationalBackground, workExperience, skills, certification] = applicantData.score;
    await prisma.applicantScore.upsert({
      where: { applicantId: applicant.id },
      update: {
        educationalBackground,
        workExperience,
        skills,
        certification,
        totalScore: educationalBackground + workExperience + skills + certification,
      },
      create: {
        applicantId: applicant.id,
        educationalBackground,
        workExperience,
        skills,
        certification,
        totalScore: educationalBackground + workExperience + skills + certification,
      },
    });

    await prisma.cV.upsert({
      where: { user_id: user.id },
      // Placeholder object key only; upload a real PDF to Supabase before
      // testing the asynchronous CV parser/scorer with this account.
      update: { file_url: `seed-placeholder/${applicantData.email.split('@')[0]}-cv.pdf` },
      create: {
        user_id: user.id,
        file_url: `seed-placeholder/${applicantData.email.split('@')[0]}-cv.pdf`,
      },
    });

    if (index < 2) {
      const interviewer = userByEmail.get('matthewroxasyt@gmail.com');
      if (!interviewer) throw new Error('Missing interviewer account');
      const stage = index === 0 ? 'HR_SCREENING' : 'DEPARTMENT';
      const existingInterview = await prisma.interview.findFirst({
        where: { applicantId: applicant.id, stage },
      });
      const interviewData = {
        interviewerId: interviewer.id,
        date: new Date(Date.now() + (index + 2) * 24 * 60 * 60 * 1000),
        type: index === 0 ? 'ONLINE' : 'ONSITE',
        status: 'SCHEDULED',
        location: index === 0 ? 'Video conference' : 'Main Campus, Quezon City',
        instructions:
          'Please bring a valid ID and be ready to discuss your experience in education.',
      };
      if (existingInterview) {
        await prisma.interview.update({ where: { id: existingInterview.id }, data: interviewData });
      } else {
        await prisma.interview.create({
          data: { applicantId: applicant.id, stage, ...interviewData },
        });
      }
    }
  }

  for (const [key, post] of jobPostByKey) {
    const applicationCount = await prisma.applicant.count({ where: { jobPostId: post.id } });
    await prisma.jobPost.update({ where: { id: post.id }, data: { applicationCount } });
    console.log(`Seeded job post ${key}: ${post.title} (${applicationCount} applicants)`);
  }

  console.log(
    `Seeded ${users.length} users with password auth, ${campuses.length} campuses, ${departmentNames.length} departments, employees, hiring requests, job posts, applicants, and related records.`,
  );
  console.log(
    'Employee checklist examples: sign in as matthewroxasyt@gmail.com to test GET /employees/me/document-status; sign in as matthewroxas83@gmail.com to add Taylor Santos’s second ID with POST /employees/{employeeId}/document-status/id-records.',
  );
  console.log(`Development password for seeded accounts: ${seedPassword}`);
}

seed()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
