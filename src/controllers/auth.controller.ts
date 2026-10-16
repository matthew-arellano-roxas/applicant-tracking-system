import type { RequestHandler } from 'express';

import { logger, prisma } from '@/configs';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@/services/token.service';
import { accessCookieOptions, refreshCookieOptions } from '@/configs/cookies';
import { ApiError } from '@/utils/ApiError';
import { asyncHandler } from '@/utils/asyncHandler';
import { startRegistration, verifyRegistration } from '@/services/auth.service';

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
  const token: unknown = req.cookies?.refresh_token;

  if (typeof token !== 'string') {
    throw ApiError.unauthorized('Refresh token required');
  }

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

export const getMe: RequestHandler = asyncHandler((req, res) => {
  return res.status(200).json({
    user: req.user,
  });
});

// Register
export const register: RequestHandler = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, education, phoneNumber } = req.body ?? {};

  if (!firstName || !lastName || !email || !password || !education) {
    throw ApiError.badRequest('Missing required fields');
  }
  if (typeof password !== 'string' || password.length < 8) {
    throw ApiError.badRequest('Password must be at least 8 characters');
  }

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
  const { email, otp } = req.body ?? {};

  if (!email || !otp) {
    logger.warn(
      {
        contentType: req.get('content-type'),
        bodyKeys: req.body && typeof req.body === 'object' ? Object.keys(req.body) : [],
        hasEmail: Boolean(email),
        hasOtp: Boolean(otp),
      },
      'Registration verification request is missing email or OTP',
    );
    throw ApiError.badRequest('Email and OTP are required');
  }

  const user = await verifyRegistration(email, String(otp));

  return res.status(201).json({ message: 'Registration successful', user });
});
