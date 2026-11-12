// src/services/employee.service.ts
import { prisma } from '@/configs/prisma';

/* ----------------------------- Types ----------------------------- */

export type EmploymentType = 'FULL_TIME' | 'PART_TIME';
export type DocStatus = 'pending' | 'complete';

export interface CreateEmployeeInput {
  userId: string;
  position: string;
  employmentType: EmploymentType;
  isTeaching: boolean;
  departmentIds?: string[]; // departments to add the employee to as a member
}

export interface UpdateEmployeeInput {
  position?: string;
  employmentType?: EmploymentType;
  isTeaching?: boolean;
}

export interface ListEmployeesQuery {
  page?: number;
  limit?: number;
  search?: string; // matches name / email / position
  departmentId?: string;
  employmentType?: EmploymentType;
  isTeaching?: boolean;
}

export type EmployeeDocumentStatusInput = Partial<{
  validId: DocStatus;
  tin: DocStatus;
  sss: DocStatus;
  philhealth: DocStatus;
  pagIbig: DocStatus;
  medicalRecord: DocStatus;
  psa: DocStatus;
  birForm: DocStatus | null;
  nbiClearance: DocStatus;
}>;

export class EmployeeServiceError extends Error {
  constructor(
    message: string,
    public readonly status: number = 400,
  ) {
    super(message);
    this.name = 'EmployeeServiceError';
  }
}

/* --------------------------- Shared select --------------------------- */

const userSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phoneNumber: true,
  avatarUrl: true,
  role: true,
} as const;

const employeeInclude = {
  user: { select: userSelect },
  departmentMembers: { include: { department: true } },
  employeeDocsStatus: true,
} as const;

/* ------------------------------ Service ------------------------------ */

export const employeeService = {
  /** Create an employee from an existing user (e.g. after an applicant is hired). */
  async create(input: CreateEmployeeInput) {
    const { userId, departmentIds = [], ...data } = input;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new EmployeeServiceError('User not found', 404);

    const existing = await prisma.employee.findFirst({ where: { userId } });
    if (existing) throw new EmployeeServiceError('User is already an employee', 409);

    if (departmentIds.length) {
      const count = await prisma.department.count({ where: { id: { in: departmentIds } } });
      if (count !== new Set(departmentIds).size) {
        throw new EmployeeServiceError('One or more departments do not exist', 404);
      }
    }

    return prisma.$transaction(async (tx) => {
      const employee = await tx.employee.create({
        data: {
          userId,
          ...data,
          // seed the onboarding checklist so every employee starts as "pending"
          employeeDocsStatus: {
            create: {
              validId: 'pending',
              tin: 'pending',
              sss: 'pending',
              philhealth: 'pending',
              pagIbig: 'pending',
              medicalRecord: 'pending',
              psa: 'pending',
              nbiClearance: 'pending',
            },
          },
          departmentMembers: {
            create: [...new Set(departmentIds)].map((departmentId) => ({ departmentId })),
          },
        },
        include: employeeInclude,
      });

      // keep the user's role in sync
      await tx.user.update({
        where: { id: userId },
        data: { role: 'EMPLOYEE', updatedAt: new Date() },
      });

      return employee;
    });
  },

  async getById(id: string) {
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: employeeInclude,
    });
    if (!employee) throw new EmployeeServiceError('Employee not found', 404);
    return employee;
  },

  async list(query: ListEmployeesQuery = {}) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));

    const where = {
      ...(query.employmentType && { employmentType: query.employmentType }),
      ...(query.isTeaching !== undefined && { isTeaching: query.isTeaching }),
      AND: [
        ...(query.departmentId
          ? [
              {
                OR: [
                  { departmentMembers: { some: { departmentId: query.departmentId } } },
                  { departments: { some: { id: query.departmentId } } },
                ],
              },
            ]
          : []),
        ...(query.search
          ? [
              {
                OR: [
                  { position: { contains: query.search, mode: 'insensitive' as const } },
                  { user: { firstName: { contains: query.search, mode: 'insensitive' as const } } },
                  { user: { lastName: { contains: query.search, mode: 'insensitive' as const } } },
                  { user: { email: { contains: query.search, mode: 'insensitive' as const } } },
                ],
              },
            ]
          : []),
      ],
    };

    const [items, total] = await prisma.$transaction([
      prisma.employee.findMany({
        where,
        include: {
          user: { select: userSelect },
          departmentMembers: { include: { department: true } },
          employeeDocsStatus: true,
        },
        orderBy: { hiredAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.employee.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async update(id: string, input: UpdateEmployeeInput) {
    await this.getById(id);
    return prisma.employee.update({
      where: { id },
      data: input,
      include: employeeInclude,
    });
  },

  async remove(id: string) {
    await this.getById(id);
    // Department.departmentHead is onDelete: SetNull, members/docs cascade.
    await prisma.employee.delete({ where: { id } });
  },

  /* ---------------------------- Departments ---------------------------- */

  async addToDepartment(employeeId: string, departmentId: string) {
    await this.getById(employeeId);
    const department = await prisma.department.findUnique({ where: { id: departmentId } });
    if (!department) throw new EmployeeServiceError('Department not found', 404);

    return prisma.departmentMember.upsert({
      where: { departmentId_employeeId: { departmentId, employeeId } },
      update: {},
      create: { departmentId, employeeId },
      include: { department: true },
    });
  },

  async removeFromDepartment(employeeId: string, departmentId: string) {
    const result = await prisma.departmentMember.deleteMany({
      where: { employeeId, departmentId },
    });
    if (result.count === 0) {
      throw new EmployeeServiceError('Employee is not a member of this department', 404);
    }
  },

  /* ---------------------------- Documents ---------------------------- */

  /** Onboarding checklist (pending / complete per requirement). */
  async updateDocumentStatus(employeeId: string, input: EmployeeDocumentStatusInput) {
    await this.getById(employeeId);
    return prisma.employeeDocumentStatus.update({
      where: { employeeId },
      data: input,
    });
  },

};
