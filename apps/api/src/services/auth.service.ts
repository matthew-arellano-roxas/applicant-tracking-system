import bcrypt from 'bcrypt';
import { cache, logger, prisma } from '@/configs';
import { ApiError } from '@/utils/ApiError';
import { enqueueOtp } from '@/services/email-dispatch.service';
import { OTP_EXPIRY_MINUTES } from '@/services/email.service';
import type { PendingRegistration, RegistrationInput } from '@/types';
import { generateOtp } from '@/utils/generateOtp';

const MAX_ATTEMPTS = 5;
const SALT_ROUNDS = 10;
const TTL_SECONDS = OTP_EXPIRY_MINUTES * 60;

const pendingKey = (email: string): string => `registration:${email}`;

const normalizeEmail = (email: string): string => {
  const trimmed = email.trim();
  return trimmed.toLowerCase();
};

const maskEmail = (email: string): string => {
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return '[invalid email]';
  return `${localPart[0]}***@${domain}`;
};

const savePending = async (email: string, data: PendingRegistration): Promise<void> => {
  const json = JSON.stringify(data);
  await cache.set(pendingKey(email), json, 'EX', TTL_SECONDS);
};

// Same as savePending, but keeps the original expiry (used when counting attempts)
const updatePending = async (email: string, data: PendingRegistration): Promise<void> => {
  const json = JSON.stringify(data);
  await cache.set(pendingKey(email), json, 'KEEPTTL');
};

const loadPending = async (email: string): Promise<PendingRegistration | null> => {
  const json = await cache.get(pendingKey(email));
  if (!json) return null;
  return JSON.parse(json) as PendingRegistration;
};

const assertEmailIsFree = async (email: string): Promise<void> => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw ApiError.conflict('Email is already registered');
};

export const startRegistration = async (input: RegistrationInput): Promise<void> => {
  const email = normalizeEmail(input.email);
  const maskedEmail = maskEmail(email);
  logger.info({ email: maskedEmail }, 'Registration request received');

  try {
    const deleted = await cache.del(pendingKey(email));
    if (deleted) logger.info({ email: maskedEmail }, 'Previous registration OTP revoked');

    await assertEmailIsFree(email);

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, SALT_ROUNDS);
    const pending: PendingRegistration = {
      firstName: input.firstName,
      lastName: input.lastName,
      email,
      phoneNumber: input.phoneNumber,
      education: input.education,
      passwordHash,
      otpHash,
      attempts: 0,
    };

    await savePending(email, pending);
    logger.info({ email: maskedEmail }, 'Pending registration saved; queueing OTP email');

    try {
      await enqueueOtp(email, input.firstName, 'REGISTRATION', otp);
    } catch (error) {
      // Remove only this request's value if another request has replaced it meanwhile.
      const expected = JSON.stringify(pending);
      await cache.eval(
        "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end",
        1,
        pendingKey(email),
        expected,
      );
      throw error;
    }

    logger.info({ email: maskedEmail }, 'Registration OTP email queued');
  } catch (error) {
    logger.error({ err: error, email: maskedEmail }, 'Registration request failed');
    throw error;
  }
};

const rejectWrongOtp = async (email: string, pending: PendingRegistration): Promise<never> => {
  pending.attempts += 1;
  await updatePending(email, pending);
  throw ApiError.badRequest('Invalid code');
};

const checkOtp = async (
  email: string,
  pending: PendingRegistration,
  otp: string,
): Promise<void> => {
  if (pending.attempts >= MAX_ATTEMPTS) {
    await cache.del(pendingKey(email));
    throw ApiError.tooManyRequests('Too many attempts. Please register again.');
  }

  const isMatch = await bcrypt.compare(otp, pending.otpHash);
  if (isMatch) return;

  await rejectWrongOtp(email, pending);
};

const createUser = (email: string, pending: PendingRegistration) => {
  return prisma.user.create({
    data: {
      firstName: pending.firstName,
      lastName: pending.lastName,
      email,
      phoneNumber: pending.phoneNumber,
      education: pending.education,
      role: 'APPLICANT',
      authIdentities: {
        create: {
          provider: 'PASSWORD',
          providerUserId: email,
          hashPassword: pending.passwordHash,
        },
      },
    },
    select: { id: true, role: true },
  });
};

export const verifyRegistration = async (rawEmail: string, otp: string) => {
  const email = normalizeEmail(rawEmail);
  const maskedEmail = maskEmail(email);
  logger.info({ email: maskedEmail }, 'Registration OTP verification requested');

  const pending = await loadPending(email);
  if (!pending) {
    logger.warn({ email: maskedEmail }, 'Registration OTP missing or expired');
    throw ApiError.badRequest('Code expired. Please register again.');
  }

  try {
    await checkOtp(email, pending, otp);
  } catch (error) {
    logger.warn({ email: maskedEmail, attempts: pending.attempts + 1 }, 'Registration OTP verification failed');
    throw error;
  }

  const user = await createUser(email, pending);
  await cache.del(pendingKey(email));
  logger.info({ email: maskedEmail, userId: user.id }, 'Registration completed; pending OTP cache cleared');
  return user;
};
