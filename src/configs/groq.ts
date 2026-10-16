import Groq from 'groq-sdk';
import { env } from '@/configs';

export const MODEL = 'llama-3.3-70b-versatile';
export const MAX_CHARS = 12000;

export const groq = new Groq({ apiKey: env.GROQ_API_KEY });
