import { useEffect } from 'react';
import type { CurrentUser } from '@ats/shared-types';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

export function useAuthSession() {
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const setAnonymous = useAuthStore((state) => state.setAnonymous);

  useEffect(() => {
    let isActive = true;

    async function loadCurrentUser() {
      try {
        const response = await api.get<{ user: CurrentUser }>('/me');
        if (isActive) {
          setAuthenticated(response.data.user);
        }
        return;
      } catch {
        // Try refreshing in case only the short-lived access token expired.
      }

      try {
        await api.post('/refresh');
        const response = await api.get<{ user: CurrentUser }>('/me');
        if (isActive) {
          setAuthenticated(response.data.user);
        }
      } catch {
        if (isActive) setAnonymous();
      }
    }

    void loadCurrentUser();
    return () => {
      isActive = false;
    };
  }, [setAnonymous, setAuthenticated]);
}
