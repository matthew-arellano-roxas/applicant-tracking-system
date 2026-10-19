import type { ReactNode } from 'react';
import { useAuthSession } from '@/hooks/useAuthSession';

export function AuthSessionLoader({ children }: { children: ReactNode }) {
  useAuthSession();
  return children;
}
