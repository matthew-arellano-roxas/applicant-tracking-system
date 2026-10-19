import { PrismaClient } from '@/generated/prisma/client';
import { UserRole } from '@/constants';

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  avatarUrl: string | null;
  role: string;
  education: string;
  createdAt: Date;
  updatedAt: Date | null;
};

export type CreateUserInput = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  avatarUrl?: string;
  role?: string;
  education: string;
};

export type UpdateUserInput = Partial<Omit<CreateUserInput, 'role'>>;

export type UserService = {
  getUserById: (id: string) => Promise<User>;
  getUserByEmail: (email: string) => Promise<User | null>;
  createUser: (input: CreateUserInput) => Promise<User>;
  listUsers: (role?: string, page?: number, pageSize?: number) => Promise<User[]>;
  updateUser: (id: string, input: UpdateUserInput) => Promise<User>;
  deleteUser: (id: string) => Promise<User>;
  assignUser: (id: string, newRole: UserRole) => Promise<User>;
};

export const createUserService = (prisma: PrismaClient): UserService => {
  function normalizeEmail(email: string) {
    const trimmed = email.trim();
    return trimmed.toLowerCase();
  }

  async function getUserById(id: string): Promise<User> {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error('User not found');
    return user;
  }

  async function getUserByEmail(email: string): Promise<User | null> {
    const normalized = normalizeEmail(email);
    return prisma.user.findUnique({ where: { email: normalized } });
  }

  async function createUser(input: CreateUserInput): Promise<User> {
    const email = normalizeEmail(input.email);
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error('Email already in use');

    const role = input.role ?? 'APPLICANT';
    return prisma.user.create({ data: { ...input, email, role } });
  }

  async function listUsers(role?: string, page = 1, pageSize = 20): Promise<User[]> {
    const where = role ? { role } : {};
    const skip = (page - 1) * pageSize;

    return prisma.user.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    });
  }

  async function updateUser(id: string, input: UpdateUserInput): Promise<User> {
    await getUserById(id);

    const updateData = {
      ...input,
      updatedAt: new Date(),
      ...(input.email && { email: normalizeEmail(input.email) }),
    };

    return prisma.user.update({ where: { id }, data: updateData });
  }

  async function deleteUser(id: string): Promise<User> {
    await getUserById(id);

    const employeeCount = await prisma.employee.count({ where: { userId: id } });
    if (employeeCount > 0) throw new Error('Cannot delete a user who is an employee');

    return prisma.user.delete({ where: { id } });
  }

  function isValidRole(role: string) {
    const validRoles: string[] = Object.values(UserRole);
    return validRoles.includes(role);
  }

  async function assignUser(id: string, newRole: UserRole): Promise<User> {
    if (!isValidRole(newRole)) throw new Error('Invalid role');

    const user = await getUserById(id);
    if (user.role === newRole) throw new Error(`User is already ${newRole}`);

    return prisma.user.update({
      where: { id },
      data: { role: newRole, updatedAt: new Date() },
    });
  }

  return {
    getUserById,
    getUserByEmail,
    createUser,
    listUsers,
    updateUser,
    deleteUser,
    assignUser,
  };
};
