import { useState, type FormEvent } from 'react';
import { api } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/getApiErrorMessage';

export function usePasswordResetForm() {
  const [step, setStep] = useState<'email' | 'reset' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function requestCode(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.post('/forgot-password', { email: email.trim().toLowerCase() });
      setStep('reset');
      setMessage('If an account exists for that email, a reset code has been sent. Check your inbox.');
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Could not send a reset code. Please try again.'));
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      await api.post('/forgot-password/reset', {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        password,
      });
      setStep('success');
      setMessage('Your password has been updated. You can now sign in with your new password.');
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Could not reset your password. Please try again.'));
    } finally {
      setBusy(false);
    }
  }

  function changeEmail() {
    setStep('email');
    setOtp('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setMessage('');
  }

  return {
    step, email, setEmail, otp, setOtp, password, setPassword,
    confirmPassword, setConfirmPassword, busy, error, message,
    requestCode, resetPassword, changeEmail,
  };
}
