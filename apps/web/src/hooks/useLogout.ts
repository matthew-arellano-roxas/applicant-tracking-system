import { useNavigate } from 'react-router';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

export function useLogout() {
  const navigate = useNavigate();
  const setAnonymous = useAuthStore((state) => state.setAnonymous);

  return async function logout() {
    try {
      await api.post('/logout');
    } catch {
      // Leave the page even if the API is temporarily unavailable.
    } finally {
      setAnonymous();
      navigate('/login', { replace: true });
    }
  };
}
