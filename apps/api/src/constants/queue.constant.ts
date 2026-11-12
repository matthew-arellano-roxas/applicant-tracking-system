export const QUEUE = {
  EMAIL: 'email',
  LLM: 'llm',
  FILE_STORAGE: 'storage',
};

export const EMAIL_JOB = {
  SEND: 'send',
} as const;

export const LLM_JOB = {
  SCORE_APPLICATION: 'score-application',
} as const;
