import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { getApiErrorMessage } from '@/lib/getApiErrorMessage';
import { api } from '@/lib/api';

export function useRegistrationForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'details' | 'verification'>('details');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [education, setEducation] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function submitDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/register', {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phoneNumber: phoneNumber.trim() || null,
        education: education.trim(),
        password,
      });
      setStep('verification');
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'The service could not be reached. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function verifyEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      await api.post('/register/verify', { email: normalizedEmail, otp: otp.trim() });
      navigate('/login', { replace: true, state: { registeredEmail: normalizedEmail } });
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'The service could not be reached. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  function returnToDetails() {
    setStep('details');
    setErrorMessage('');
  }

  return {
    step,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    phoneNumber,
    setPhoneNumber,
    education,
    setEducation,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    otp,
    setOtp,
    isSubmitting,
    errorMessage,
    submitDetails,
    verifyEmail,
    returnToDetails,
  };
}
