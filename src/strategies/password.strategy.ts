import bcrypt from 'bcryptjs';
import { Strategy as LocalStrategy } from 'passport-local';
import { prisma } from '@/configs/prisma';
import { ApiError } from '@/utils/ApiError';
import type { AuthResult } from '@/types';

export const PASSWORD_STRATEGY = 'password';
const SALT_ROUNDS = 12;

const invalidCredentials = () => ApiError.unauthorized('Invalid credentials');

const findIdentity = (email: string) =>
  prisma.authIdentity.findUnique({
    where: {
      provider_providerUserId: {
        provider: PASSWORD_STRATEGY,
        providerUserId: email.toLowerCase(),
      },
    },
  });

const assertMatches = async (password: string, hash: string | null): Promise<void> => {
  if (!hash || !(await bcrypt.compare(password, hash))) throw invalidCredentials();
};

const verifyPassword = async (email: string, password: string): Promise<AuthResult> => {
  const identity = await findIdentity(email);
  if (!identity) throw invalidCredentials();
  await assertMatches(password, identity.hashPassword);
  return { userId: identity.userId };
};

export const hashPassword = (password: string): Promise<string> =>
  bcrypt.hash(password, SALT_ROUNDS);

export const passwordStrategy = new LocalStrategy(
  { usernameField: 'email', passwordField: 'password' },
  (email, password, done) => {
    verifyPassword(email, password).then((user) => done(null, user), done);
  },
);
