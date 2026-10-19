import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { getApiErrorMessage } from '@/lib/getApiErrorMessage';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

type LoginLocationState = {
  from?: { pathname?: string };
  registeredEmail?: string;
};

export function useLoginForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const setChecking = useAuthStore((state) => state.setChecking);
  const locationState = location.state as LoginLocationState | null;
  const [email, setEmail] = useState(locationState?.registeredEmail ?? '');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await api.post('/login', { email: email.trim(), password });
      setChecking();
      const destination = locationState?.from?.pathname ?? '/';
      navigate(destination, { replace: true });
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'We could not sign you in. Check your connection and try again.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    passwordVisible,
    togglePasswordVisibility: () => setPasswordVisible((visible) => !visible),
    isSubmitting,
    errorMessage,
    registeredEmail: locationState?.registeredEmail,
    handleSubmit,
  };
}
