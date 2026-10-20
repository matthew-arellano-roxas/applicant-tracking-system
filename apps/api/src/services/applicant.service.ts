import { Prisma, PrismaClient } from '@/generated/prisma/client';
import { llmQueue } from '@/queues/llm.queue';
import { LLM_JOB } from '@/constants';
import { ApiError } from '@/utils/ApiError';
import { getPaginationMetadata } from '@/utils/pagination';

export type Applicant = {
  id: string;
  userId: string;
  jobPostId: string;
  status: string;
  scoreStatus: string;
  applyDate: Date;
};

export type ApplicantWithDetails = Applicant & {
  user?: { id: string; firstName: string; lastName: string; email: string };
  jobPost?: { id: string; title: string };
  scores?: {
    educationalBackground: number;
    skills: number;
    workExperience: number;
    certification: number;
    totalScore: number;
  } | null;
};

export type CreateApplicationInput = {
  userId: string;
  jobPostId: string;
};

export type ApplicationListFilter = {
  status?: string;
  scoreStatus?: string;
  jobPostId?: string;
  departmentId?: string;
  userId?: string;
  search?: string;
  minScore?: number;
  maxScore?: number;
  page?: number;
  limit?: number;
};

export type ApplicationService = {
  createApplication: (input: CreateApplicationInput) => Promise<Applicant>;
  retryScoring: (id: string) => Promise<void>;
  getApplication: (id: string) => Promise<ApplicantWithDetails>;
  listApplications: (filter?: ApplicationListFilter) => Promise<{
    items: ApplicantWithDetails[];
    pagination: ReturnType<typeof getPaginationMetadata>;
  }>;
  updateApplicationStatus: (id: string, status: string) => Promise<Applicant>;
  listApplicationsByJobPost: (jobPostId: string) => Promise<ApplicantWithDetails[]>;
  listApplicationsByUser: (userId: string) => Promise<ApplicantWithDetails[]>;
  getApplicationScore: (applicationId: string) => Promise<{ totalScore: number } | null>;
};

export const createApplicantService = (prisma: PrismaClient): ApplicationService => {
  async function createApplication(input: CreateApplicationInput): Promise<Applicant> {
    const applicant = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: input.userId },
        select: { id: true, cvs: { select: { file_url: true } } },
      });
      if (!user) throw ApiError.notFound('User not found');
      if (!user.cvs) throw ApiError.badRequest('Upload a CV before applying');
      if (!user.cvs.file_url.toLowerCase().endsWith('.pdf')) {
        throw ApiError.badRequest('CV scoring currently supports PDF files only');
      }

      const jobPost = await tx.jobPost.findFirst({
        where: { id: input.jobPostId, deletedAt: null, status: 'OPEN' },
        select: { id: true },
      });
      if (!jobPost) throw ApiError.notFound('Open job post not found');

      const existing = await tx.applicant.findFirst({
        where: { userId: input.userId, jobPostId: input.jobPostId },
      });
      if (existing) throw ApiError.conflict('You have already applied for this job');

      const created = await tx.applicant.create({
        data: {
          userId: input.userId,
          jobPostId: input.jobPostId,
          status: 'APPLIED',
          scoreStatus: 'PENDING',
        },
        select: {
          id: true,
          userId: true,
          jobPostId: true,
          status: true,
          scoreStatus: true,
          applyDate: true,
        },
      });
      await tx.jobPost.update({
        where: { id: input.jobPostId },
        data: { applicationCount: { increment: 1 } },
      });
      return created;
    });

    try {
      await llmQueue.add(
        LLM_JOB.SCORE_APPLICATION,
        { applicantId: applicant.id },
        { jobId: applicant.id },
      );
    } catch (error) {
      await prisma.applicant.update({
        where: { id: applicant.id },
        data: { scoreStatus: 'FAILED' },
      });
      console.error('Could not queue application CV scoring:', error);
      return { ...applicant, scoreStatus: 'FAILED' };
    }

    return applicant;
  }

  async function getApplication(id: string): Promise<ApplicantWithDetails> {
    const applicant = await prisma.applicant.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        jobPost: { select: { id: true, title: true } },
        scores: {
          select: {
            educationalBackground: true,
            skills: true,
            workExperience: true,
            certification: true,
            totalScore: true,
          },
        },
      },
    });
    if (!applicant) throw ApiError.notFound('Application not found');
    return applicant;
  }

  async function retryScoring(id: string): Promise<void> {
    const applicant = await prisma.applicant.findUnique({
      where: { id },
      select: { id: true, scoreStatus: true },
    });
    if (!applicant) throw ApiError.notFound('Application not found');
    if (applicant.scoreStatus !== 'FAILED') {
      throw ApiError.conflict('Only applications with failed CV scoring can be retried');
    }

    await prisma.applicant.update({ where: { id }, data: { scoreStatus: 'PENDING' } });
    try {
      await llmQueue.add(
        LLM_JOB.SCORE_APPLICATION,
        { applicantId: id },
        { jobId: `${id}-retry-${Date.now()}` },
      );
    } catch (error) {
      await prisma.applicant.update({ where: { id }, data: { scoreStatus: 'FAILED' } });
      throw error;
    }
  }

  async function listApplications(filter: ApplicationListFilter = {}): Promise<{
    items: ApplicantWithDetails[];
    pagination: ReturnType<typeof getPaginationMetadata>;
  }> {
    const { page = 1, limit = 20, search, minScore, maxScore, departmentId, ...filters } = filter;
    const where: Prisma.ApplicantWhereInput = {
      ...filters,
      ...(departmentId ? { jobPost: { hiringRequest: { departmentId } } } : {}),
      ...(search
        ? {
            OR: [
              { user: { firstName: { contains: search, mode: 'insensitive' } } },
              { user: { lastName: { contains: search, mode: 'insensitive' } } },
              { user: { email: { contains: search, mode: 'insensitive' } } },
              { jobPost: { title: { contains: search, mode: 'insensitive' } } },
            ],
          }
        : {}),
      ...(minScore === undefined && maxScore === undefined
        ? {}
        : {
            scores: {
              is: {
                totalScore: {
                  ...(minScore === undefined ? {} : { gte: minScore }),
                  ...(maxScore === undefined ? {} : { lte: maxScore }),
                },
              },
            },
          }),
    };
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.applicant.findMany({
        where,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          jobPost: { select: { id: true, title: true } },
          scores: {
            select: {
              educationalBackground: true,
              skills: true,
              workExperience: true,
              certification: true,
              totalScore: true,
            },
          },
        },
        orderBy: { applyDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.applicant.count({ where }),
    ]);

    return { items, pagination: getPaginationMetadata({ page, limit }, total) };
  }

  async function updateApplicationStatus(id: string, status: string): Promise<Applicant> {
    const applicant = await prisma.applicant.findUnique({ where: { id } });
    if (!applicant) throw ApiError.notFound('Application not found');

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
        scores: {
          select: {
            educationalBackground: true,
            skills: true,
            workExperience: true,
            certification: true,
            totalScore: true,
          },
        },
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
        scores: {
          select: {
            educationalBackground: true,
            skills: true,
            workExperience: true,
            certification: true,
            totalScore: true,
          },
        },
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
    if (!applicant) throw ApiError.notFound('Application not found');
    return applicant.scores;
  }

  return {
    createApplication,
    retryScoring,
    getApplication,
    listApplications,
    updateApplicationStatus,
    listApplicationsByJobPost,
    listApplicationsByUser,
    getApplicationScore,
  };
};
