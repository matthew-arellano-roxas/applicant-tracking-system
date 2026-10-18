import Groq from 'groq-sdk';
import { env } from '@/configs';

export const MODEL = 'openai/gpt-oss-120b';
export const MAX_CHARS = 12000;

export const groq = new Groq({ apiKey: env.GROQ_API_KEY });
