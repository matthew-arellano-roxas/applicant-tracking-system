import { prisma } from '@/configs'; // adjust to wherever your shared PrismaClient lives
import type { CreateUserInput, UpdateUserInput } from '@/types';
import { UserRole } from '@/constants';

function normalizeEmail(email: string) {
  const trimmed = email.trim();
  return trimmed.toLowerCase();
}

async function getUserById(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error('User not found');
  return user;
}

async function getUserByEmail(email: string) {
  const normalized = normalizeEmail(email);
  return prisma.user.findUnique({ where: { email: normalized } });
}

async function createUser(input: CreateUserInput) {
  const email = normalizeEmail(input.email);
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('Email already in use');

  const role = input.role ?? 'APPLICANT';
  return prisma.user.create({ data: { ...input, email, role } });
}

async function listUsers(role?: string, page = 1, pageSize = 20) {
  const where = role ? { role } : {};
  const skip = (page - 1) * pageSize;

  return prisma.user.findMany({
    where,
    skip,
    take: pageSize,
    orderBy: { createdAt: 'desc' },
  });
}

async function updateUser(id: string, input: UpdateUserInput) {
  await getUserById(id);

  const data = { ...input, updatedAt: new Date() };
  if (input.email) data.email = normalizeEmail(input.email);

  return prisma.user.update({ where: { id }, data });
}

async function deleteUser(id: string) {
  await getUserById(id);

  const employeeCount = await prisma.employee.count({ where: { userId: id } });
  if (employeeCount > 0) throw new Error('Cannot delete a user who is an employee');

  return prisma.user.delete({ where: { id } });
}

function isValidRole(role: string) {
  const validRoles: string[] = Object.values(UserRole);
  return validRoles.includes(role);
}

async function promoteUser(id: string, newRole: UserRole) {
  if (!isValidRole(newRole)) throw new Error('Invalid role');

  const user = await getUserById(id);
  if (user.role === newRole) throw new Error(`User is already ${newRole}`);

  return prisma.user.update({
    where: { id },
    data: { role: newRole, updatedAt: new Date() },
  });
}

export const userService = {
  getUserById,
  getUserByEmail,
  createUser,
  listUsers,
  updateUser,
  deleteUser,
  promoteUser,
};
