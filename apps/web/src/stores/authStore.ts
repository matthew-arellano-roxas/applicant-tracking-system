import { create } from 'zustand';
import type { CurrentUser } from '@ats/shared-types';

export type SessionStatus = 'checking' | 'authenticated' | 'anonymous';

type AuthState = {
  status: SessionStatus;
  user: CurrentUser | null;
  setChecking: () => void;
  setAuthenticated: (user: CurrentUser) => void;
  setAnonymous: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  status: 'checking',
  user: null,
  setChecking: () => set({ user: null, status: 'checking' }),
  setAuthenticated: (user) => set({ user, status: 'authenticated' }),
  setAnonymous: () => set({ user: null, status: 'anonymous' }),
}));
