import { User } from '@/generated/prisma/client';

export type CreateUserInput = {
  firstName: string;
  lastName: string;
  email: string;
  education: string;
  phoneNumber?: string;
  avatarUrl?: string;
  role?: string;
};

export type UserService = {
  getUserById: (id: string) => Promise<User>;
  getUserByEmail: (email: string) => Promise<User | null>;
  createUser: (input: CreateUserInput) => Promise<User>;
  listUsers: (role?: string, page?: number, pageSize?: number) => Promise<User[]>;
  updateUser: (id: string, input: UpdateUserInput) => Promise<User>;
  deleteUser: (id: string) => Promise<User>;
};

export type UpdateUserInput = Partial<CreateUserInput>;
