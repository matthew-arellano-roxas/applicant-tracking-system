import { prisma } from '@/configs/prisma';
import { Prisma } from '@/generated/prisma/client';
import { ApiError } from '@/utils/ApiError';
import type { AcceptedIdType, EmployeeDocumentType } from '@/schemas/employee-document.schema';
const STATUS_FIELD = {
  VALID_ID: 'validId',
  TIN: 'tin',
  SSS: 'sss',
  PHILHEALTH: 'philhealth',
  PAG_IBIG: 'pagIbig',
  MEDICAL_RECORD: 'medicalRecord',
  PSA: 'psa',
  BIR_FORM: 'birForm',
  NBI_CLEARANCE: 'nbiClearance',
} as const;

const getEmployee = async (employeeId: string) => {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { id: true, userId: true },
  });
  if (!employee) throw ApiError.notFound('Employee not found');
  return employee;
};

const getEmployeeForUser = async (userId: string) => {
  const employee = await prisma.employee.findFirst({
    where: { userId },
    select: { id: true, userId: true },
  });
  if (!employee) throw ApiError.notFound('Employee record not found for this account');
  return employee;
};

const updateStatus = async (
  tx: Prisma.TransactionClient,
  employeeId: string,
  documentType: EmployeeDocumentType,
  status: 'pending' | 'complete',
) => {
  const statusData = {
    [STATUS_FIELD[documentType]]: status,
  } as Prisma.EmployeeDocumentStatusUpdateInput;
  await tx.employeeDocumentStatus.upsert({
    where: { employeeId },
    update: statusData,
    create: {
      employeeId,
      validId: 'pending',
      tin: 'pending',
      sss: 'pending',
      philhealth: 'pending',
      pagIbig: 'pending',
      medicalRecord: 'pending',
      psa: 'pending',
      nbiClearance: 'pending',
      ...statusData,
    } as Prisma.EmployeeDocumentStatusCreateInput,
  });
};

export const employeeDocumentService = {
  async list(employeeId: string) {
    await getEmployee(employeeId);
    const [status, idRecords] = await Promise.all([
      prisma.employeeDocumentStatus.findUnique({ where: { employeeId } }),
      prisma.submittedId.findMany({ where: { employeeId }, orderBy: { presentedAt: 'asc' } }),
    ]);
    return { employeeId, status, idRecords };
  },

  async recordId(employeeId: string, input: { idType: AcceptedIdType; notes?: string }) {
    await getEmployee(employeeId);
    return prisma.$transaction(async (tx) => {
      const existing = await tx.submittedId.findUnique({
        where: {
          employeeId_idType: {
            employeeId,
            idType: input.idType as Prisma.SubmittedIdCreateInput['idType'],
          },
        },
      });
      if (!existing) {
        const existingCount = await tx.submittedId.count({ where: { employeeId } });
        if (existingCount >= 2) {
          throw ApiError.conflict('An employee can have at most two accepted ID records');
        }
      }

      const idRecord = existing
        ? await tx.submittedId.update({
            where: { id: existing.id },
            data: { notes: input.notes ?? null, presentedAt: new Date() },
          })
        : await tx.submittedId.create({
            data: {
              employeeId,
              idType: input.idType as Prisma.SubmittedIdCreateInput['idType'],
              notes: input.notes,
            },
          });
      const idCount = await tx.submittedId.count({ where: { employeeId } });
      if (idCount >= 2) await updateStatus(tx, employeeId, 'VALID_ID', 'complete');
      return { idRecord, idCount, validIdStatus: idCount >= 2 ? 'complete' : 'pending' };
    });
  },

  async review(
    employeeId: string,
    documentType: EmployeeDocumentType,
    status: 'pending' | 'complete',
  ) {
    await getEmployee(employeeId);
    if (documentType === 'VALID_ID' && status === 'complete') {
      const idCount = await prisma.submittedId.count({ where: { employeeId } });
      if (idCount < 2) {
        throw ApiError.conflict(
          'Record both accepted ID types before marking the ID checklist complete',
        );
      }
    }
    await prisma.$transaction((tx) => updateStatus(tx, employeeId, documentType, status));
    return { employeeId, documentType, status };
  },

  getEmployeeForUser,
};
