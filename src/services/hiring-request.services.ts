import { Prisma, PrismaClient } from '@/generated/prisma/client';
import { ApiError } from '@/utils/ApiError';

type Status = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'FULFILLED' | 'CANCELLED';

// from -> allowed next statuses
const TRANSITIONS: Record<Status, Status[]> = {
  DRAFT: ['PENDING', 'CANCELLED'],
  PENDING: ['APPROVED', 'REJECTED', 'CANCELLED'],
  APPROVED: ['FULFILLED', 'CANCELLED'],
  REJECTED: ['DRAFT'],
  FULFILLED: [],
  CANCELLED: [],
};

export interface CreateHiringRequest {
  position: string;
  employmentType: 'FULL_TIME' | 'PART_TIME';
  isTeaching: boolean;
  requirements?: Prisma.InputJsonObject;
  departmentId: string;
  campusId: number;
}

export const createHiringRequestService = (db: PrismaClient) => {
  const get = async (id: string) => {
    const req = await db.hiringRequest.findUnique({ where: { id } });
    if (!req) throw ApiError.notFound('Hiring request not found');
    return req;
  };

  const create = (data: CreateHiringRequest) =>
    db.hiringRequest.create({ data: { ...data, status: 'DRAFT' } });

  const list = (filter: {
    status?: Status;
    departmentId?: string;
    campusId?: number;
    search?: string;
  } = {}) => {
    const { search, ...where } = filter;
    const searchTerm = search?.trim();

    return db.hiringRequest.findMany({
      where: {
        ...where,
        ...(searchTerm
          ? {
              OR: [
                { position: { contains: searchTerm, mode: 'insensitive' } },
                { department: { name: { contains: searchTerm, mode: 'insensitive' } } },
                { campus: { name: { contains: searchTerm, mode: 'insensitive' } } },
                { campus: { location: { contains: searchTerm, mode: 'insensitive' } } },
              ],
            }
          : {}),
      },
      orderBy: { id: 'desc' },
    });
  };

  /** Drafts only. */
  const update = async (id: string, data: Partial<Omit<CreateHiringRequest, 'departmentId'>>) => {
    const { count } = await db.hiringRequest.updateMany({
      where: { id, status: 'DRAFT' },
      data,
    });
    if (!count) {
      await get(id);
      throw ApiError.conflict('Only draft requests can be edited');
    }
    return get(id);
  };

  const setStatus = async (id: string, to: Status) => {
    const { status } = await get(id);
    if (!TRANSITIONS[status as Status]?.includes(to)) {
      throw ApiError.conflict(`Cannot move from ${status} to ${to}`);
    }
    // guard against concurrent changes
    const { count } = await db.hiringRequest.updateMany({
      where: { id, status },
      data: { status: to },
    });
    if (!count) throw ApiError.conflict('Request was modified, please retry');
    return get(id);
  };

  return { create, list, get, update, setStatus };
};

export type HiringRequestService = ReturnType<typeof createHiringRequestService>;
