import type { RequestHandler } from 'express';
import type { z } from 'zod';

import { prisma } from '@/configs';
import { currentUserResponseSchema } from '@ats/shared-types/schemas/auth.schema';
import {
  changeCurrentUserPasswordBodySchema,
  updateCurrentUserBodySchema,
} from '@/schemas/user.schema';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@/services/token.service';
import { accessCookieOptions, refreshCookieOptions } from '@/configs/cookies';
import { ApiError } from '@/utils/ApiError';
import { asyncHandler } from '@/utils/asyncHandler';
import {
  changePassword,
  resetPassword,
  startPasswordReset,
  startRegistration,
  verifyRegistration,
} from '@/services/auth.service';

export const login: RequestHandler = asyncHandler((req, res) => {
  const user = req.user;

  if (!user) {
    throw ApiError.internal('Authenticated user is missing');
  }

  const payload = {
    sub: user.id,
    role: user.role,
    tokenUse: 'access' as const,
  };

  res.cookie('access_token', signAccessToken(payload), accessCookieOptions);

  res.cookie('refresh_token', signRefreshToken(payload), refreshCookieOptions);

  return res.status(200).json({
    message: 'Login successful',
    user: {
      id: user.id,
      role: user.role,
    },
  });
});

export const refresh: RequestHandler = asyncHandler(async (req, res) => {
  const token: string = req.cookies.refresh_token;

  const payload = verifyRefreshToken(token);

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      role: true,
    },
  });

  if (!user) {
    throw ApiError.unauthorized('User not found');
  }

  const newPayload = {
    sub: user.id,
    role: user.role,
    tokenUse: 'access' as const,
  };

  res.cookie('access_token', signAccessToken(newPayload), accessCookieOptions);

  res.cookie('refresh_token', signRefreshToken(newPayload), refreshCookieOptions);

  return res.status(200).json({
    message: 'Tokens refreshed',
  });
});

export const logout: RequestHandler = asyncHandler((_req, res) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  };

  res.clearCookie('access_token', cookieOptions);
  res.clearCookie('refresh_token', cookieOptions);

  return res.status(200).json({
    message: 'Logout successful',
  });
});

export const getMe: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw ApiError.unauthorized('Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      phoneNumber: true,
      education: true,
    },
  });

  if (!user) {
    throw ApiError.unauthorized('User not found');
  }

  return res.status(200).json(currentUserResponseSchema.parse({ user }));
});

export const updateMe: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) throw ApiError.unauthorized('Authentication required');

  const updates = req.body as z.output<typeof updateCurrentUserBodySchema>;
  const existingUser = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, email: true, authIdentities: { select: { provider: true } } },
  });
  if (!existingUser) throw ApiError.unauthorized('User not found');

  try {
    const user = await prisma.$transaction(async (transaction) => {
      if (updates.email && updates.email !== existingUser.email) {
        const emailOwner = await transaction.user.findUnique({
          where: { email: updates.email },
          select: { id: true },
        });
        if (emailOwner && emailOwner.id !== existingUser.id) {
          throw ApiError.conflict('Email is already registered');
        }
      }

      const updatedUser = await transaction.user.update({
        where: { id: existingUser.id },
        data: { ...updates, updatedAt: new Date() },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          phoneNumber: true,
          education: true,
        },
      });

      if (
        updates.email &&
        updates.email !== existingUser.email &&
        existingUser.authIdentities?.provider === 'PASSWORD'
      ) {
        await transaction.authIdentity.update({
          where: { userId: existingUser.id },
          data: { providerUserId: updates.email },
        });
      }

      return updatedUser;
    });

    return res.status(200).json(currentUserResponseSchema.parse({ user }));
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    ) {
      throw ApiError.conflict('Email is already registered');
    }
    throw error;
  }
});

export const changeMyPassword: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) throw ApiError.unauthorized('Authentication required');

  const { currentPassword, newPassword } = req.body as z.output<
    typeof changeCurrentUserPasswordBodySchema
  >;
  await changePassword(req.user.id, currentPassword, newPassword);
  return res.status(200).json({ message: 'Password updated successfully' });
});

// Register
export const register: RequestHandler = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, education, phoneNumber } = req.body;

  await startRegistration({
    firstName,
    lastName,
    email,
    password,
    education,
    phoneNumber: phoneNumber ?? null,
  });

  return res.status(202).json({ message: 'OTP sent. Please check your email.' });
});

export const verifyOtp: RequestHandler = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await verifyRegistration(email, String(otp));

  return res.status(201).json({ message: 'Registration successful', user });
});

export const requestPasswordReset: RequestHandler = asyncHandler(async (req, res) => {
  const { email } = req.body;
  await startPasswordReset(email);
  return res.status(202).json({ message: 'If an account exists for that email, a reset code has been sent.' });
});

export const completePasswordReset: RequestHandler = asyncHandler(async (req, res) => {
  const { email, otp, password } = req.body;
  await resetPassword(email, String(otp), password);
  return res.status(200).json({ message: 'Password updated. You can now sign in.' });
});
