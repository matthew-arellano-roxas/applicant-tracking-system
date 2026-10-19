export interface AuthResult {
  userId: string;
}

export type TokenPayload = {
  sub: string;
  role: string;
  tokenUse: 'access';
};

export type PendingRegistration = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  education: string;
  passwordHash: string;
  otpHash: string;
  attempts: number;
};

export interface RegistrationInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  education: string;
  phoneNumber: string | null;
}
