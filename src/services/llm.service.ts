import { CRITERIA, WEIGHTS } from '@/constants';
import { richTextToPlain } from '@/utils/richText';
import type {
  ApplicantEvaluation,
  CriterionKey,
  CriterionResult,
  EmployeeKind,
  ParsedCv,
  ScoreBreakdown,
} from '@/types';
import { groq, MAX_CHARS, MODEL } from '@/configs';

const clamp = (n: number): number => Math.min(100, Math.max(0, Math.round(n)));

const complete = async (system: string, user: string): Promise<string> => {
  const res = await groq.chat.completions.create({
    model: MODEL,
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user.slice(0, MAX_CHARS) },
    ],
  });
  return res.choices[0]?.message?.content ?? '{}';
};

// extract CV
const toStringArray = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];

const normalizeCv = (raw: Record<string, unknown>): ParsedCv => ({
  education: toStringArray(raw.education),
  workExperience: toStringArray(raw.workExperience),
  skills: toStringArray(raw.skills),
  certifications: toStringArray(raw.certifications),
});

const EXTRACT_PROMPT =
  'Extract resume data. Reply JSON only: ' +
  '{"education":string[],"workExperience":string[],"skills":string[],"certifications":string[]}. ' +
  'Use only information present in the text. Empty arrays for missing sections.';

export const extractCv = async (cvText: string): Promise<ParsedCv> =>
  normalizeCv(JSON.parse(await complete(EXTRACT_PROMPT, cvText)));

// compare CV and job post
const COMPARE_PROMPT =
  'You are an HR screening assistant. Compare the applicant CV to the job post. ' +
  'For each criterion (educationalBackground, skills, workExperience, certification) give: ' +
  'score 0-100 (how well the CV meets what the job post requires), ' +
  'supported (true only if the CV gives concrete evidence such as institutions, employers, dates, named certificates), ' +
  'reason (one short sentence). If the job post does not require a criterion, score by general relevance. ' +
  'Reply JSON only: {"educationalBackground":{"score":0,"supported":true,"reason":""},"skills":{...},"workExperience":{...},"certification":{...}}';

const normalizeCriterion = (raw: unknown): CriterionResult => {
  const r = (raw ?? {}) as Partial<CriterionResult>;
  return {
    score: clamp(Number(r.score) || 0),
    supported: Boolean(r.supported),
    reason: typeof r.reason === 'string' ? r.reason : '',
  };
};

const normalizeBreakdown = (raw: Record<string, unknown>): ScoreBreakdown =>
  Object.fromEntries(CRITERIA.map((k) => [k, normalizeCriterion(raw[k])])) as ScoreBreakdown;

const buildComparePrompt = (jobText: string, cv: ParsedCv): string =>
  `JOB POST:\n${jobText}\n\nAPPLICANT CV (extracted):\n${JSON.stringify(cv)}`;

export const compareCvToJob = async (jobPostJson: unknown, cv: ParsedCv): Promise<ScoreBreakdown> =>
  normalizeBreakdown(
    JSON.parse(
      await complete(COMPARE_PROMPT, buildComparePrompt(richTextToPlain(jobPostJson), cv)),
    ),
  );

// Scoring
const weightedScore = (result: CriterionResult, weight: number): number =>
  Math.round((result.score * weight) / 100);

const applyWeights = (
  breakdown: ScoreBreakdown,
  kind: EmployeeKind,
): Record<CriterionKey, number> =>
  Object.fromEntries(
    CRITERIA.map((k) => [k, weightedScore(breakdown[k], WEIGHTS[kind][k])]),
  ) as Record<CriterionKey, number>;

const sum = (weighted: Record<CriterionKey, number>): number =>
  CRITERIA.reduce((total, k) => total + weighted[k], 0);

export const evaluateApplicant = async (
  jobPostJson: unknown,
  cvText: string,
  kind: EmployeeKind,
): Promise<ApplicantEvaluation> => {
  const cv = await extractCv(cvText);
  const breakdown = await compareCvToJob(jobPostJson, cv);
  const weighted = applyWeights(breakdown, kind);
  return { breakdown, weighted, totalScore: sum(weighted) };
};
