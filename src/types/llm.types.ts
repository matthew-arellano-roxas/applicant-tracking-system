export type EmployeeKind = 'TEACHING' | 'NON_TEACHING';

export type CriterionKey = 'educationalBackground' | 'skills' | 'workExperience' | 'certification';

export interface CriterionResult {
  score: number; // 0-100 raw match
  supported: boolean; // is the claim backed by evidence in the CV
  reason: string;
}

export type ScoreBreakdown = Record<CriterionKey, CriterionResult>;

export interface ApplicantEvaluation {
  breakdown: ScoreBreakdown;
  weighted: Record<CriterionKey, number>;
  totalScore: number; // 0-100
}

export interface ParsedCv {
  education: string[];
  workExperience: string[];
  skills: string[];
  certifications: string[];
}
