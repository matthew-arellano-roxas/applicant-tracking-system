import { PrismaClient } from '@/generated/prisma/client';

export type Applicant = {
  id: string;
  userId: string;
  jobPostId: string;
  status: string;
  applyDate: Date;
};

export type ApplicantWithDetails = Applicant & {
  user?: { id: string; firstName: string; lastName: string; email: string };
  jobPost?: { id: string; title: string };
  scores?: { totalScore: number } | null;
};

export type CreateApplicationInput = {
  userId: string;
  jobPostId: string;
};

export type ApplicationService = {
  createApplication: (input: CreateApplicationInput) => Promise<Applicant>;
  getApplication: (id: string) => Promise<ApplicantWithDetails>;
  listApplications: (filter?: {
    status?: string;
    jobPostId?: string;
    userId?: string;
    page?: number;
    pageSize?: number;
  }) => Promise<ApplicantWithDetails[]>;
  updateApplicationStatus: (id: string, status: string) => Promise<Applicant>;
  listApplicationsByJobPost: (jobPostId: string) => Promise<ApplicantWithDetails[]>;
  listApplicationsByUser: (userId: string) => Promise<ApplicantWithDetails[]>;
  getApplicationScore: (applicationId: string) => Promise<{ totalScore: number } | null>;
};

export const createApplicantService = (prisma: PrismaClient): ApplicationService => {
  async function createApplication(input: CreateApplicationInput): Promise<Applicant> {
    const user = await prisma.user.findUnique({ where: { id: input.userId } });
    if (!user) throw new Error('User not found');

    const jobPost = await prisma.jobPost.findFirst({
      where: { id: input.jobPostId, deletedAt: null },
    });
    if (!jobPost) throw new Error('Job post not found');

    const existing = await prisma.applicant.findFirst({
      where: { userId: input.userId, jobPostId: input.jobPostId },
    });
    if (existing) throw new Error('User has already applied for this job');

    // increment job post application count
    await prisma.jobPost.update({
      where: { id: input.jobPostId },
      data: { applicationCount: { increment: 1 } },
    });

    return prisma.applicant.create({
      data: {
        userId: input.userId,
        jobPostId: input.jobPostId,
        status: 'APPLIED',
      },
    });
  }

  async function getApplication(id: string): Promise<ApplicantWithDetails> {
    const applicant = await prisma.applicant.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        jobPost: { select: { id: true, title: true } },
        scores: { select: { totalScore: true } },
      },
    });
    if (!applicant) throw new Error('Application not found');
    return applicant;
  }

  async function listApplications(
    filter: {
      status?: string;
      jobPostId?: string;
      userId?: string;
      page?: number;
      pageSize?: number;
    } = {},
  ): Promise<ApplicantWithDetails[]> {
    const { page = 1, pageSize = 20, ...where } = filter;
    const skip = (page - 1) * pageSize;

    return prisma.applicant.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        jobPost: { select: { id: true, title: true } },
        scores: { select: { totalScore: true } },
      },
      orderBy: { applyDate: 'desc' },
      skip,
      take: pageSize,
    });
  }

  async function updateApplicationStatus(id: string, status: string): Promise<Applicant> {
    const applicant = await prisma.applicant.findUnique({ where: { id } });
    if (!applicant) throw new Error('Application not found');

    return prisma.applicant.update({
      where: { id },
      data: { status },
    });
  }

  async function listApplicationsByJobPost(jobPostId: string): Promise<ApplicantWithDetails[]> {
    return prisma.applicant.findMany({
      where: { jobPostId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        jobPost: { select: { id: true, title: true } },
        scores: { select: { totalScore: true } },
      },
      orderBy: { applyDate: 'desc' },
    });
  }

  async function listApplicationsByUser(userId: string): Promise<ApplicantWithDetails[]> {
    return prisma.applicant.findMany({
      where: { userId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        jobPost: { select: { id: true, title: true } },
        scores: { select: { totalScore: true } },
      },
      orderBy: { applyDate: 'desc' },
    });
  }

  async function getApplicationScore(
    applicationId: string,
  ): Promise<{ totalScore: number } | null> {
    const applicant = await prisma.applicant.findUnique({
      where: { id: applicationId },
      select: { scores: { select: { totalScore: true } } },
    });
    if (!applicant) throw new Error('Application not found');
    return applicant.scores;
  }

  return {
    createApplication,
    getApplication,
    listApplications,
    updateApplicationStatus,
    listApplicationsByJobPost,
    listApplicationsByUser,
    getApplicationScore,
  };
};
