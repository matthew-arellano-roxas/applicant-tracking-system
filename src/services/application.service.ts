// import { prisma } from '@/configs/prisma';
// import { env } from '@/configs';
// import { BUCKET, uploadFile } from '@/services/file-storage.service';
// import { parsePdfFromStorage } from '@/services/pdf-parser.service';
// import { evaluateApplicant } from '@/services/llm.service';
// import { sendRejectedEmail, sendShortlistedEmail } from '@/services/application-email.service';
// import { sendInterviewInvitation } from '@/services/interview-email.service';
// import type { ApplicantEvaluation } from '@/types/llm.types';

// export const STATUS = {
//   APPLIED: 'APPLIED',
//   SCREENED: 'SCREENED',
//   SHORTLISTED: 'SHORTLISTED',
//   INTERVIEW: 'INTERVIEW',
//   REJECTED: 'REJECTED',
// } as const;

// // ---------- 1. Apply ----------
// const saveCv = async (userId: string, file: Buffer): Promise<string> => {
//   const path = await uploadFile({
//     bucket: BUCKET.CV,
//     path: `${userId}/resume.pdf`,
//     file,
//     contentType: 'application/pdf',
//   });
//   await prisma.cV.upsert({
//     where: { user_id: userId },
//     update: { file_url: path },
//     create: { user_id: userId, file_url: path },
//   });
//   return path;
// };

// const createApplicant = (userId: string, jobPostId: string) =>
//   prisma.$transaction(async (tx) => {
//     const applicant = await tx.applicant.create({
//       data: { userId, jobPostId, status: STATUS.APPLIED },
//     });
//     await tx.jobPost.update({
//       where: { id: jobPostId },
//       data: { applicationCount: { increment: 1 } },
//     });
//     return applicant;
//   });

// export const submitApplication = async (userId: string, jobPostId: string, file: Buffer) => {
//   await saveCv(userId, file);
//   return createApplicant(userId, jobPostId);
// };

// // ---------- 2. Screen (PDF -> LLM -> score) ----------
// const loadForScreening = (applicantId: string) =>
//   prisma.applicant.findUniqueOrThrow({
//     where: { id: applicantId },
//     include: { user: { include: { cvs: true } }, jobPost: { include: { hiringRequest: true } } },
//   });

// const saveScore = (applicantId: string, r: ApplicantEvaluation) => {
//   const data = { ...r.weighted, totalScore: r.totalScore };
//   return prisma.$transaction([
//     prisma.applicantScore.upsert({
//       where: { applicantId },
//       update: data,
//       create: { applicantId, ...data },
//     }),
//     prisma.applicant.update({ where: { id: applicantId }, data: { status: STATUS.SCREENED } }),
//   ]);
// };

// export const screenApplicant = async (applicantId: string) => {
//   const a = await loadForScreening(applicantId);
//   if (!a.user.cvs) throw new Error('Applicant has no CV');
//   const text = await parsePdfFromStorage(BUCKET.CV, a.user.cvs.file_url);
//   const kind = a.jobPost.hiringRequest.isTeaching ? 'TEACHING' : 'NON_TEACHING';
//   const result = await evaluateApplicant(a.jobPost.requirements, text, kind);
//   await saveScore(applicantId, result);
//   return result;
// };

// // ---------- 3. Decisions ----------
// const setStatus = (applicantId: string, status: string) =>
//   prisma.applicant.update({
//     where: { id: applicantId },
//     data: { status },
//     include: { user: true, jobPost: true },
//   });

// const toEmailInput = (a: Awaited<ReturnType<typeof setStatus>>) => ({
//   to: a.user.email,
//   name: a.user.firstName,
//   jobTitle: a.jobPost.title,
//   applicationReference: a.id,
//   ctaUrl: `${env.APP_URL}/applications/${a.id}`,
// });

// export const shortlistApplicant = async (applicantId: string) =>
//   sendShortlistedEmail(toEmailInput(await setStatus(applicantId, STATUS.SHORTLISTED)));

// export const rejectApplicant = async (applicantId: string) =>
//   sendRejectedEmail(toEmailInput(await setStatus(applicantId, STATUS.REJECTED)));

// // ---------- 4. Interview ----------
// interface ScheduleInput {
//   applicantId: string;
//   stage: string;
//   type: string;
//   date: Date;
//   location?: string;
//   instructions?: string;
//   interviewerId?: string;
// }

// const createInterview = ({ applicantId, ...data }: ScheduleInput) =>
//   prisma.interview.create({ data: { applicantId, ...data } });

// export const scheduleInterview = async (input: ScheduleInput) => {
//   const interview = await createInterview(input);
//   const a = await setStatus(input.applicantId, STATUS.INTERVIEW);
//   await sendInterviewInvitation({
//     to: a.user.email,
//     name: a.user.firstName,
//     jobTitle: a.jobPost.title,
//     stage: interview.stage,
//     type: interview.type,
//     date: interview.date,
//     location: interview.location,
//     instructions: interview.instructions,
//     ctaUrl: `${env.APP_URL}/applications/${a.id}`,
//   });
//   return interview;
// };
