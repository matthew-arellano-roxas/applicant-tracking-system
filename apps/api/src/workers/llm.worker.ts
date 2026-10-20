import { Worker, type Job } from 'bullmq';
import { prisma, queueConnection, supabase } from '@/configs';
import { LLM_JOB, QUEUE } from '@/constants';
import { scoreApplicant } from '@/services/applicant-scoring.service';
import { pdfToText } from '@/utils/pdfToText';

type ScoreApplicationJob = { applicantId: string };

const processScoringJob = async (job: Job<ScoreApplicationJob>) => {
  if (job.name !== LLM_JOB.SCORE_APPLICATION) {
    throw new Error(`Unknown LLM job: ${job.name}`);
  }

  const { applicantId } = job.data;
  const applicant = await prisma.applicant.findUnique({
    where: { id: applicantId },
    select: { id: true, user: { select: { cvs: { select: { file_url: true } } } } },
  });
  if (!applicant) throw new Error('Application not found');
  const cvPath = applicant.user.cvs?.file_url;
  if (!cvPath) throw new Error('Applicant has no uploaded CV');
  if (!cvPath.toLowerCase().endsWith('.pdf')) {
    throw new Error('Automatic scoring currently supports PDF CVs only');
  }

  await prisma.applicant.update({
    where: { id: applicantId },
    data: { scoreStatus: 'PROCESSING' },
  });

  const { data: file, error } = await supabase.storage.from('cvs').download(cvPath);
  if (error || !file) throw new Error('Could not download the uploaded CV');

  const cvText = await pdfToText(new Uint8Array(await file.arrayBuffer()));
  if (!cvText.trim()) throw new Error('No text could be extracted from the CV PDF');

  const result = await scoreApplicant(applicantId, cvText);
  await prisma.applicant.update({ where: { id: applicantId }, data: { scoreStatus: 'COMPLETED' } });
  await prisma.applicant.updateMany({
    where: { id: applicantId, status: 'APPLIED' },
    data: { status: 'SCREENED' },
  });
  return result;
};

export const createLlmWorker = () => {
  const worker = new Worker<ScoreApplicationJob>(QUEUE.LLM, processScoringJob, {
    connection: queueConnection,
    concurrency: 3,
  });

  worker.on('completed', (job) =>
    console.log(`CV scoring completed for application ${job.data.applicantId}`),
  );
  worker.on('failed', (job, error) => {
    console.error(
      `CV scoring attempt failed for ${job?.data.applicantId ?? 'unknown'}: ${error.message}`,
    );
    if (job && job.attemptsMade >= Number(job.opts.attempts ?? 1)) {
      void prisma.applicant
        .update({ where: { id: job.data.applicantId }, data: { scoreStatus: 'FAILED' } })
        .catch((updateError: unknown) =>
          console.error('Could not mark CV scoring failed:', updateError),
        );
    }
  });
  worker.on('error', (error) => console.error('LLM worker error:', error));
  return worker;
};
