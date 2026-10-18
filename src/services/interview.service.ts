import { Prisma, PrismaClient } from '@/generated/prisma/client';
import { env } from '@/configs/env';
import { enqueueInterviewInvitation } from '@/services/email-dispatch.service';
import { ApiError } from '@/utils/ApiError';
import { getPaginationMetadata } from '@/utils/pagination';

export type InterviewStage = 'HR_SCREENING' | 'DEPARTMENT' | 'DEMO_TEACHING' | 'FINAL';
export type InterviewType = 'ONSITE' | 'ONLINE' | 'PHONE';
export type InterviewStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export type CreateInterviewInput = {
  applicantId: string;
  interviewerId?: string | null;
  stage: InterviewStage;
  date: Date;
  type: InterviewType;
  location?: string | null;
  instructions?: string | null;
};

export type UpdateInterviewInput = Partial<
  Pick<
    CreateInterviewInput,
    'interviewerId' | 'stage' | 'date' | 'type' | 'location' | 'instructions'
  >
> & {
  status?: InterviewStatus;
  notes?: string | null;
};

export type InterviewListFilter = {
  applicantId?: string;
  applicantUserId?: string;
  interviewerId?: string;
  stage?: InterviewStage;
  status?: InterviewStatus;
  page?: number;
  limit?: number;
};

const interviewInclude = {
  applicant: {
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
      jobPost: { select: { id: true, title: true } },
    },
  },
  interviewer: { select: { id: true, firstName: true, lastName: true, email: true } },
} satisfies Prisma.InterviewInclude;

export type InterviewWithDetails = Prisma.InterviewGetPayload<{
  include: typeof interviewInclude;
}>;

export const createInterviewService = (db: PrismaClient) => {
  const queueNotifications = async (interview: InterviewWithDetails) => {
    const frontendUrl = env.FRONTEND_URL?.replace(/\/$/, '');
    const ctaUrl = frontendUrl ? `${frontendUrl}/interviews/${interview.id}` : '';
    const applicantName = `${interview.applicant.user.firstName} ${interview.applicant.user.lastName}`;
    const invitationBase = {
      jobTitle: interview.applicant.jobPost.title,
      stage: interview.stage,
      type: interview.type,
      date: interview.date,
      location: interview.location,
      instructions: interview.instructions,
      ctaUrl,
      applicantName,
    };

    const queueFor = async (
      recipient: { email: string; firstName: string; lastName: string },
      recipientRole: 'APPLICANT' | 'INTERVIEWER',
    ): Promise<'QUEUED' | 'FAILED'> => {
      try {
        await enqueueInterviewInvitation({
          ...invitationBase,
          to: recipient.email,
          name: `${recipient.firstName} ${recipient.lastName}`,
          recipientRole,
        });
        return 'QUEUED';
      } catch (error) {
        console.error(`Could not queue ${recipientRole.toLowerCase()} interview email:`, error);
        return 'FAILED';
      }
    };

    const [applicant, interviewer] = await Promise.all([
      queueFor(interview.applicant.user, 'APPLICANT'),
      interview.interviewer
        ? queueFor(interview.interviewer, 'INTERVIEWER')
        : Promise.resolve<'NOT_ASSIGNED'>('NOT_ASSIGNED'),
    ]);

    return { applicant, interviewer };
  };

  const get = async (id: string): Promise<InterviewWithDetails> => {
    const interview = await db.interview.findUnique({
      where: { id },
      include: interviewInclude,
    });
    if (!interview) throw ApiError.notFound('Interview not found');
    return interview;
  };

  const assertApplicantExists = async (applicantId: string): Promise<void> => {
    const applicant = await db.applicant.findUnique({
      where: { id: applicantId },
      select: { id: true },
    });
    if (!applicant) throw ApiError.notFound('Application not found');
  };

  const assertInterviewerExists = async (interviewerId: string): Promise<void> => {
    const interviewer = await db.user.findUnique({
      where: { id: interviewerId },
      select: { id: true },
    });
    if (!interviewer) throw ApiError.notFound('Interviewer not found');
  };

  const create = async (input: CreateInterviewInput) => {
    await assertApplicantExists(input.applicantId);
    if (input.interviewerId) await assertInterviewerExists(input.interviewerId);

    const interview = await db.interview.create({
      data: {
        applicantId: input.applicantId,
        interviewerId: input.interviewerId ?? null,
        stage: input.stage,
        date: input.date,
        type: input.type,
        location: input.location ?? null,
        instructions: input.instructions ?? null,
      },
      include: interviewInclude,
    });

    const notifications = await queueNotifications(interview);
    return { interview, notifications };
  };

  const list = async (filter: InterviewListFilter = {}) => {
    const { page = 1, limit = 20, applicantUserId, ...filters } = filter;
    const where: Prisma.InterviewWhereInput = {
      ...filters,
      ...(applicantUserId ? { applicant: { userId: applicantUserId } } : {}),
    };

    const [items, total] = await Promise.all([
      db.interview.findMany({
        where,
        include: interviewInclude,
        orderBy: { date: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.interview.count({ where }),
    ]);

    return {
      items,
      pagination: getPaginationMetadata({ page, limit }, total),
    };
  };

  const update = async (id: string, input: UpdateInterviewInput): Promise<InterviewWithDetails> => {
    await get(id);
    if (input.interviewerId) await assertInterviewerExists(input.interviewerId);

    return db.interview.update({
      where: { id },
      data: input,
      include: interviewInclude,
    });
  };

  const cancel = async (id: string): Promise<InterviewWithDetails> => {
    const interview = await get(id);
    if (interview.status === 'CANCELLED') {
      throw ApiError.conflict('Interview is already cancelled');
    }

    return db.interview.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: interviewInclude,
    });
  };

  return { create, list, get, update, cancel };
};

export type InterviewService = ReturnType<typeof createInterviewService>;
