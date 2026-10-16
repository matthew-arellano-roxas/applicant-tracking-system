import { prisma } from '@/configs/prisma';
import { signToken } from '@/services';

const loadUser = (id: string) =>
  prisma.user.findUniqueOrThrow({ where: { id }, select: { id: true, role: true } });

export const issueToken = async (userId: string): Promise<string> => {
  const user = await loadUser(userId);
  return signToken({ sub: user.id, role: user.role });
};
