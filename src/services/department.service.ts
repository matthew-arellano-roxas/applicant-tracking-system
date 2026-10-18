import { PrismaClient } from '@/generated/prisma/client';
import type { PaginationQuery } from '@/schemas/pagination.schema';
import { getPaginationMetadata } from '@/utils/pagination';
import { ApiError } from '@/utils/ApiError';

export type Department = {
  id: string;
  name: string;
  departmentHeadId: string | null;
  createdAt: Date;
};

export type DepartmentMember = {
  id: string;
  employeeId: string;
  departmentId: string;
};

export type CreateDepartmentInput = {
  name: string;
  departmentHeadId?: string | null;
};

export type UpdateDepartmentInput = Partial<CreateDepartmentInput>;

export type DepartmentService = {
  getDepartmentById: (id: string) => Promise<Department>;
  listDepartments: (pagination: PaginationQuery) => Promise<{ items: Department[]; pagination: ReturnType<typeof getPaginationMetadata> }>;
  createDepartment: (input: CreateDepartmentInput) => Promise<Department>;
  updateDepartment: (id: string, input: UpdateDepartmentInput) => Promise<Department>;
  deleteDepartment: (id: string) => Promise<Department>;
  listMembers: (departmentId: string, pagination: PaginationQuery) => Promise<{ items: DepartmentMember[]; pagination: ReturnType<typeof getPaginationMetadata> }>;
  addMember: (departmentId: string, employeeId: string) => Promise<DepartmentMember>;
  removeMember: (departmentId: string, employeeId: string) => Promise<{ count: number }>;
  assignDepartmentHead: (departmentId: string, employeeId: string) => Promise<Department>;
  removeDepartmentHead: (departmentId: string) => Promise<Department>;
};

export const createDepartmentService = (prisma: PrismaClient): DepartmentService => {
  async function assertEmployeeExists(employeeId: string) {
    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) throw ApiError.notFound('Employee not found');
  }

  async function getDepartmentById(id: string): Promise<Department> {
    const department = await prisma.department.findUnique({ where: { id } });
    if (!department) throw ApiError.notFound('Department not found');
    return department;
  }

  async function listDepartments(pagination: PaginationQuery) {
    const { page, limit } = pagination;
    const [items, total] = await Promise.all([
      prisma.department.findMany({
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.department.count(),
    ]);
    return { items, pagination: getPaginationMetadata(pagination, total) };
  }

  async function createDepartment(input: CreateDepartmentInput): Promise<Department> {
    const headId = input.departmentHeadId ?? null;
    if (headId) await assertEmployeeExists(headId);

    return prisma.department.create({
      data: { name: input.name, departmentHeadId: headId },
    });
  }

  async function updateDepartment(id: string, input: UpdateDepartmentInput): Promise<Department> {
    await getDepartmentById(id);
    if (input.departmentHeadId) await assertEmployeeExists(input.departmentHeadId);

    return prisma.department.update({ where: { id }, data: input });
  }

  async function deleteDepartment(id: string): Promise<Department> {
    await getDepartmentById(id);

    const requestCount = await prisma.hiringRequest.count({ where: { departmentId: id } });
    if (requestCount > 0) throw ApiError.conflict('Cannot delete a department with hiring requests');

    return prisma.department.delete({ where: { id } });
  }

  async function listMembers(departmentId: string, pagination: PaginationQuery) {
    await getDepartmentById(departmentId);
    const { page, limit } = pagination;
    const [items, total] = await Promise.all([
      prisma.departmentMember.findMany({
        where: { departmentId },
        orderBy: { id: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.departmentMember.count({ where: { departmentId } }),
    ]);
    return { items, pagination: getPaginationMetadata(pagination, total) };
  }

  async function addMember(departmentId: string, employeeId: string): Promise<DepartmentMember> {
    await getDepartmentById(departmentId);
    await assertEmployeeExists(employeeId);

    const existing = await prisma.departmentMember.findFirst({
      where: { departmentId, employeeId },
    });
    if (existing) throw ApiError.conflict('Employee is already a member');

    return prisma.departmentMember.create({ data: { departmentId, employeeId } });
  }

  async function removeMember(
    departmentId: string,
    employeeId: string,
  ): Promise<{ count: number }> {
    const result = await prisma.departmentMember.deleteMany({
      where: { departmentId, employeeId },
    });
    if (result.count === 0) throw ApiError.notFound('Membership not found');
    return result;
  }

  async function assignDepartmentHead(
    departmentId: string,
    employeeId: string,
  ): Promise<Department> {
    await getDepartmentById(departmentId);
    await assertEmployeeExists(employeeId);

    return prisma.$transaction(async (tx) => {
      // the head should also be a member of the department
      await tx.departmentMember.upsert({
        where: { departmentId_employeeId: { departmentId, employeeId } },
        update: {},
        create: { departmentId, employeeId },
      });

      return tx.department.update({
        where: { id: departmentId },
        data: { departmentHeadId: employeeId },
      });
    });
  }

  async function removeDepartmentHead(departmentId: string): Promise<Department> {
    await getDepartmentById(departmentId);

    return prisma.department.update({
      where: { id: departmentId },
      data: { departmentHeadId: null },
    });
  }

  return {
    getDepartmentById,
    listDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    listMembers,
    addMember,
    removeMember,
    assignDepartmentHead,
    removeDepartmentHead,
  };
};
