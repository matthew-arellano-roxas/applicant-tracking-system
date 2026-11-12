import type { CriterionKey, EmployeeKind } from '@/types/llm.types';

export const CRITERIA: CriterionKey[] = [
  'educationalBackground',
  'skills',
  'workExperience',
  'certification',
];

export const WEIGHTS: Record<EmployeeKind, Record<CriterionKey, number>> = {
  TEACHING: { educationalBackground: 30, skills: 25, workExperience: 30, certification: 15 },
  NON_TEACHING: { educationalBackground: 25, skills: 30, workExperience: 30, certification: 15 },
};
