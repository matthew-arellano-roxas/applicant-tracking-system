import { env } from '@/configs/env';
import { UserRole } from '@/constants/roles';
import { Prisma, PrismaClient } from '@/generated/prisma/client';
import { APPLICANT_STATUS } from '@/constants/status.constant';
import {
  getInterviewRubricCriteria,
  type InterviewRubricRoleType,
  type InterviewRubricStage,
} from '@/constants/interview-rubric.constant';
import { enqueueInterviewInvitation } from '@/services/email-dispatch.service';
import { ApiError } from '@/utils/ApiError';
import { getPaginationMetadata } from '@/utils/pagination';

export type InterviewStage = 'HR_SCREENING' | 'DEPARTMENT' | 'DEMO_TEACHING' | 'FINAL';
export type InterviewType = 'ONSITE' | 'ONLINE' | 'PHONE';
export type InterviewStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
export type InterviewRecommendation = 'STRONG_YES' | 'YES' | 'HOLD' | 'NO';

export type CreateInterviewInput = {
  applicantId: string;
  interviewerId?: string | null;
  stage: InterviewStage;
  date: Date;
  durationMinutes?: number;
  timeZone?: string;
  type: InterviewType;
  location?: string | null;
  meetingUrl?: string | null;
  instructions?: string | null;
};

export type UpdateInterviewInput = Partial<
  Pick<
    CreateInterviewInput,
    | 'interviewerId'
    | 'stage'
    | 'date'
    | 'durationMinutes'
    | 'timeZone'
    | 'type'
    | 'location'
    | 'meetingUrl'
    | 'instructions'
  >
> & {
  status?: 'COMPLETED' | 'NO_SHOW';
  notes?: string | null;
};

export type InterviewListFilter = {
  applicantId?: string;
  applicantUserId?: string;
  interviewerId?: string;
  stage?: InterviewStage;
  status?: InterviewStatus;
  type?: InterviewType;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
};

export type InterviewEvaluationInput = {
  ratings: Record<string, number>;
  recommendation: InterviewRecommendation;
  strengths?: string | null;
  concerns?: string | null;
  comments?: string | null;
};

type NotificationKind = 'SCHEDULED' | 'UPDATED' | 'CANCELLED';

const interviewInclude = {
  applicant: {
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
      jobPost: { select: { id: true, title: true } },
    },
  },
  interviewer: { select: { id: true, firstName: true, lastName: true, email: true } },
} satisfies Prisma.InterviewInclude;

const evaluationInclude = {
  evaluator: { select: { id: true, firstName: true, lastName: true, email: true } },
} satisfies Prisma.InterviewEvaluationInclude;

export type InterviewWithDetails = Prisma.InterviewGetPayload<{
  include: typeof interviewInclude;
}>;

export const createInterviewService = (db: PrismaClient) => {
  const get = async (id: string): Promise<InterviewWithDetails> => {
    const interview = await db.interview.findUnique({ where: { id }, include: interviewInclude });
    if (!interview) throw ApiError.notFound('Interview not found');
    return interview;
  };

  const assertInterviewerExists = async (
    tx: Prisma.TransactionClient,
    interviewerId: string,
  ): Promise<void> => {
    const employee = await tx.employee.findFirst({
      where: {
        userId: interviewerId,
        user: {
          role: {
            in: [
              UserRole.Admin,
              UserRole.Hr,
              UserRole.Dean,
              UserRole.DepartmentHead,
              UserRole.Employee,
            ],
          },
        },
      },
      select: { id: true },
    });
    if (!employee) throw ApiError.badRequest('Interviewer must be a staff member of the school');
  };

  const assertScheduleAvailable = async (
    tx: Prisma.TransactionClient,
    interviewerId: string,
    date: Date,
    durationMinutes: number,
    excludeId?: string,
  ): Promise<void> => {
    const newStart = date.getTime();
    const newEnd = newStart + durationMinutes * 60_000;
    const possibleConflicts = await tx.interview.findMany({
      where: {
        interviewerId,
        status: 'SCHEDULED',
        date: { lt: new Date(newEnd) },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true, date: true, durationMinutes: true },
    });

    const hasConflict = possibleConflicts.some((interview) => {
      const existingStart = interview.date.getTime();
      const existingEnd = existingStart + interview.durationMinutes * 60_000;
      return newStart < existingEnd && existingStart < newEnd;
    });

    if (hasConflict) throw ApiError.conflict('Interviewer already has an interview at that time');
  };

  const queueNotifications = async (
    interview: InterviewWithDetails,
    notificationKind: NotificationKind,
    formerInterviewer?: InterviewWithDetails['interviewer'],
  ) => {
    const frontendUrl = env.FRONTEND_URL?.replace(/\/$/, '');
    const ctaUrl = frontendUrl ? `${frontendUrl}/interviews/${interview.id}` : '';
    const applicantName = `${interview.applicant.user.firstName} ${interview.applicant.user.lastName}`;
    const invitationBase = {
      jobTitle: interview.applicant.jobPost.title,
      stage: interview.stage,
      type: interview.type,
      date: interview.date,
      durationMinutes: interview.durationMinutes,
      timeZone: interview.timeZone,
      location: interview.location,
      meetingUrl: interview.meetingUrl,
      instructions: interview.instructions,
      ctaUrl,
      applicantName,
      notificationKind,
    };

    const queueFor = async (
      recipient: { email: string; firstName: string; lastName: string },
      recipientRole: 'APPLICANT' | 'INTERVIEWER',
      kind = notificationKind,
    ): Promise<'QUEUED' | 'FAILED'> => {
      try {
        await enqueueInterviewInvitation({
          ...invitationBase,
          notificationKind: kind,
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

    const [applicant, interviewer, formerInterviewerStatus] = await Promise.all([
      queueFor(interview.applicant.user, 'APPLICANT'),
      interview.interviewer
        ? queueFor(interview.interviewer, 'INTERVIEWER')
        : Promise.resolve<'NOT_ASSIGNED'>('NOT_ASSIGNED'),
      formerInterviewer && formerInterviewer.id !== interview.interviewerId
        ? queueFor(formerInterviewer, 'INTERVIEWER', 'CANCELLED')
        : Promise.resolve<'NOT_REASSIGNED'>('NOT_REASSIGNED'),
    ]);

    return { applicant, interviewer, formerInterviewer: formerInterviewerStatus };
  };

  const create = async (input: CreateInterviewInput) => {
    if (input.date <= new Date()) throw ApiError.badRequest('Interview date must be in the future');

    const interview = await db.$transaction(async (tx) => {
      const applicant = await tx.applicant.findUnique({
        where: { id: input.applicantId },
        select: {
          id: true,
          status: true,
          jobPost: { select: { hiringRequest: { select: { isTeaching: true } } } },
        },
      });
      if (!applicant) throw ApiError.notFound('Application not found');
      const interviewEligibleStatuses: string[] = [
        APPLICANT_STATUS.APPLIED,
        APPLICANT_STATUS.SCREENED,
        APPLICANT_STATUS.SHORTLISTED,
        APPLICANT_STATUS.INTERVIEW,
      ];
      if (!interviewEligibleStatuses.includes(applicant.status)) {
        throw ApiError.conflict('Cannot schedule an interview for this application status');
      }
      if (input.stage === 'DEMO_TEACHING' && !applicant.jobPost.hiringRequest.isTeaching) {
        throw ApiError.badRequest('DEMO_TEACHING interviews are only for teaching positions');
      }

      if (input.interviewerId) {
        await assertInterviewerExists(tx, input.interviewerId);
        await assertScheduleAvailable(
          tx,
          input.interviewerId,
          input.date,
          input.durationMinutes ?? 60,
        );
      }

      if (applicant.status !== APPLICANT_STATUS.INTERVIEW) {
        await tx.applicant.update({
          where: { id: input.applicantId },
          data: { status: APPLICANT_STATUS.INTERVIEW },
        });
      }

      return tx.interview.create({
        data: {
          applicantId: input.applicantId,
          interviewerId: input.interviewerId ?? null,
          stage: input.stage,
          date: input.date,
          durationMinutes: input.durationMinutes ?? 60,
          timeZone: input.timeZone ?? 'Asia/Manila',
          type: input.type,
          location: input.location ?? null,
          meetingUrl: input.meetingUrl ?? null,
          instructions: input.instructions ?? null,
        },
        include: interviewInclude,
      });
    });

    return {
      interview,
      notifications: await queueNotifications(interview, 'SCHEDULED'),
    };
  };

  const list = async (filter: InterviewListFilter = {}) => {
    const { page = 1, limit = 20, applicantUserId, search, dateFrom, dateTo, ...filters } = filter;
    const where: Prisma.InterviewWhereInput = {
      ...filters,
      ...(applicantUserId ? { applicant: { userId: applicantUserId } } : {}),
      ...(dateFrom || dateTo
        ? {
            date: {
              ...(dateFrom ? { gte: dateFrom } : {}),
              ...(dateTo ? { lte: dateTo } : {}),
            },
          }
        : {}),
      ...(search
        ? {
            applicant: {
              ...(applicantUserId ? { userId: applicantUserId } : {}),
              OR: [
                { user: { is: { firstName: { contains: search, mode: 'insensitive' } } } },
                { user: { is: { lastName: { contains: search, mode: 'insensitive' } } } },
                { user: { is: { email: { contains: search, mode: 'insensitive' } } } },
                { jobPost: { is: { title: { contains: search, mode: 'insensitive' } } } },
              ],
            },
          }
        : {}),
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

    return { items, pagination: getPaginationMetadata({ page, limit }, total) };
  };

  const update = async (id: string, input: UpdateInterviewInput) => {
    const current = await get(id);
    const scheduleFields: (keyof UpdateInterviewInput)[] = [
      'interviewerId',
      'stage',
      'date',
      'durationMinutes',
      'timeZone',
      'type',
      'location',
      'meetingUrl',
      'instructions',
    ];
    const scheduleChanged = scheduleFields.some(
      (key) => input[key] !== undefined && input[key] !== current[key as keyof typeof current],
    );

    if (scheduleChanged && current.status !== 'SCHEDULED') {
      throw ApiError.conflict('Only scheduled interviews can be rescheduled or reassigned');
    }
    if (input.date && input.date <= new Date()) {
      throw ApiError.badRequest('Interview date must be in the future');
    }
    if (input.status && !['COMPLETED', 'NO_SHOW'].includes(input.status)) {
      throw ApiError.badRequest('Use the cancel endpoint to cancel an interview');
    }
    if (input.status && current.status !== 'SCHEDULED') {
      throw ApiError.conflict('Only scheduled interviews can be completed or marked as no-show');
    }
    if (input.stage === 'DEMO_TEACHING') {
      const application = await db.applicant.findUnique({
        where: { id: current.applicantId },
        select: { jobPost: { select: { hiringRequest: { select: { isTeaching: true } } } } },
      });
      if (!application?.jobPost.hiringRequest.isTeaching) {
        throw ApiError.badRequest('DEMO_TEACHING interviews are only for teaching positions');
      }
    }
    const resultingType = input.type ?? current.type;
    const resultingMeetingUrl =
      input.meetingUrl === undefined ? current.meetingUrl : input.meetingUrl;
    if (scheduleChanged && resultingType === 'ONLINE' && !resultingMeetingUrl) {
      throw ApiError.badRequest('Meeting URL is required for online interviews');
    }

    const updated = await db.$transaction(async (tx) => {
      const interviewerId =
        input.interviewerId === undefined ? current.interviewerId : input.interviewerId;
      const date = input.date ?? current.date;
      const durationMinutes = input.durationMinutes ?? current.durationMinutes;

      if (interviewerId) {
        await assertInterviewerExists(tx, interviewerId);
        if (scheduleChanged) {
          await assertScheduleAvailable(tx, interviewerId, date, durationMinutes, id);
        }
      }

      const result = await tx.interview.updateMany({
        where: { id, status: current.status },
        data: input,
      });
      if (result.count === 0) throw ApiError.conflict('Interview changed; reload and try again');
      return tx.interview.findUniqueOrThrow({ where: { id }, include: interviewInclude });
    });

    return {
      interview: updated,
      notifications: scheduleChanged
        ? await queueNotifications(
            updated,
            'UPDATED',
            input.interviewerId !== undefined && input.interviewerId !== current.interviewerId
              ? current.interviewer
              : undefined,
          )
        : null,
    };
  };

  const cancel = async (id: string) => {
    const current = await get(id);
    if (current.status !== 'SCHEDULED') {
      throw ApiError.conflict('Only scheduled interviews can be cancelled');
    }

    const interview = await db.$transaction(async (tx) => {
      const result = await tx.interview.updateMany({
        where: { id, status: 'SCHEDULED' },
        data: { status: 'CANCELLED' },
      });
      if (!result.count) throw ApiError.conflict('Interview changed; reload and try again');
      return tx.interview.findUniqueOrThrow({ where: { id }, include: interviewInclude });
    });
    return {
      interview,
      notifications: await queueNotifications(interview, 'CANCELLED'),
    };
  };

  const listEvaluations = async (interviewId: string) => {
    await get(interviewId);
    return db.interviewEvaluation.findMany({
      where: { interviewId },
      include: evaluationInclude,
      orderBy: { createdAt: 'asc' },
    });
  };

  const submitEvaluation = async (
    interviewId: string,
    evaluatorId: string,
    input: InterviewEvaluationInput,
  ) => {
    const interview = await get(interviewId);
    if (interview.status !== 'COMPLETED') {
      throw ApiError.conflict(
        'Interview feedback can be submitted after the interview is completed',
      );
    }

    const application = await db.applicant.findUnique({
      where: { id: interview.applicantId },
      select: { jobPost: { select: { hiringRequest: { select: { isTeaching: true } } } } },
    });
    if (!application) throw ApiError.notFound('Application not found');
    const roleType: InterviewRubricRoleType = application.jobPost.hiringRequest.isTeaching
      ? 'TEACHING'
      : 'NON_TEACHING';
    let criteria;
    try {
      criteria = getInterviewRubricCriteria(interview.stage as InterviewRubricStage, roleType);
    } catch {
      throw ApiError.badRequest('No rubric is configured for this interview stage');
    }
    const requiredCriterionIds = new Set<string>(criteria.map(({ id }) => id));
    const submittedCriterionIds = Object.keys(input.ratings);
    const missingCriteria = [...requiredCriterionIds].filter(
      (id) => !submittedCriterionIds.includes(id),
    );
    const unexpectedCriteria = submittedCriterionIds.filter((id) => !requiredCriterionIds.has(id));
    if (missingCriteria.length || unexpectedCriteria.length) {
      throw ApiError.badRequest(
        `Ratings must include exactly these criteria for ${interview.stage}: ${[...requiredCriterionIds].join(', ')}`,
      );
    }

    return db.interviewEvaluation.upsert({
      where: { interviewId_evaluatorId: { interviewId, evaluatorId } },
      create: {
        interviewId,
        evaluatorId,
        ratings: input.ratings as Prisma.InputJsonObject,
        recommendation: input.recommendation,
        strengths: input.strengths ?? null,
        concerns: input.concerns ?? null,
        comments: input.comments ?? null,
      },
      update: {
        ratings: input.ratings as Prisma.InputJsonObject,
        recommendation: input.recommendation,
        strengths: input.strengths ?? null,
        concerns: input.concerns ?? null,
        comments: input.comments ?? null,
      },
      include: evaluationInclude,
    });
  };

  const getEvaluation = async (interviewId: string, evaluatorId: string) => {
    await get(interviewId);
    const evaluation = await db.interviewEvaluation.findUnique({
      where: { interviewId_evaluatorId: { interviewId, evaluatorId } },
      include: evaluationInclude,
    });
    if (!evaluation) throw ApiError.notFound('Interview evaluation not found');
    return evaluation;
  };

  return { create, list, get, update, cancel, listEvaluations, submitEvaluation, getEvaluation };
};

export type InterviewService = ReturnType<typeof createInterviewService>;
