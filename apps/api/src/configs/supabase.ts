// src/configs/supabase.ts (replace; fixes env name mismatch)
import { createClient } from '@supabase/supabase-js';
import { env } from './env';

export const supabase = createClient(env.SUPABASE_PROJECT_URL!, env.SUPABASE_SECRET_KEY!);
