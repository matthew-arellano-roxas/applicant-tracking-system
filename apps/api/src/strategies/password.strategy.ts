import { Strategy as LocalStrategy, type VerifyFunction } from 'passport-local';
import bcrypt from 'bcrypt';
import { prisma } from '@/configs';

const passwordStrategyCallback: VerifyFunction = async (
  email,
  password,
  done,
) => {
  try {
    const identity = await prisma.authIdentity.findFirst({
      where: {
        provider: 'PASSWORD',
        providerUserId: email.toLowerCase().trim(),
      },
      include: {
        user: true,
      },
    });

    if (!identity?.hashPassword) {
      return done(null, false);
    }

    const valid = await bcrypt.compare(password, identity.hashPassword);

    if (!valid) {
      return done(null, false);
    }

    return done(null, {
      id: identity.user.id,
      role: identity.user.role,
    });
  } catch (error) {
    return done(error);
  }
};

export const passwordStrategy = new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
    session: false,
  },
  passwordStrategyCallback,
);