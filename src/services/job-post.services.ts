import { PrismaClient } from '@/generated/prisma/client';
import { ApiError } from '@/utils/ApiError';

type Status = 'OPEN' | 'CLOSED';
type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'BOTH AVAILABLE';

export interface CreateJobPost {
  hiringRequestId: string;
  approvedBy: string; // User.id
  title?: string; // defaults to the hiring request's position
  description?: string | null;
  employmentType?: EmploymentType; // defaults to the hiring request's type
  salaryMin?: number | null;
  salaryMax?: number | null;
}

export type JobPostService = ReturnType<typeof createJobPostService>;


const checkSalary = (min?: number | null, max?: number | null) => {
  if (min != null && max != null && min > max) {
    throw ApiError.badRequest('salaryMin cannot be greater than salaryMax');
  }
};

export const createJobPostService = (db: PrismaClient) => {
  const get = async (id: string) => {
    const post = await db.jobPost.findFirst({ where: { id, deletedAt: null } });
    if (!post) throw ApiError.notFound('Job post not found');
    return post;
  };

  /** Requires an APPROVED hiring request with no existing post (one post per request). */
  const create = async ({ hiringRequestId, approvedBy, ...data }: CreateJobPost) => {
    checkSalary(data.salaryMin, data.salaryMax);

    const request = await db.hiringRequest.findUnique({ where: { id: hiringRequestId } });
    if (!request) throw ApiError.notFound('Hiring request not found');
    if (request.status !== 'APPROVED') throw ApiError.conflict('Hiring request is not approved');

    const existing = await db.jobPost.findUnique({ where: { hiringRequestId } });
    if (existing) throw ApiError.conflict('A job post already exists for this hiring request');

    return db.jobPost.create({
      data: {
        hiringRequestId,
        approvedBy,
        title: data.title ?? request.position,
        employmentType: data.employmentType ?? request.employmentType,
        description: data.description,
        salaryMin: data.salaryMin,
        salaryMax: data.salaryMax,
        status: 'OPEN',
      },
    });
  };

  const list = (filter: { status?: Status } = {}) =>
    db.jobPost.findMany({
      where: { ...filter, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });

  const update = async (
    id: string,
    data: Partial<
      Pick<CreateJobPost, 'title' | 'description' | 'employmentType' | 'salaryMin' | 'salaryMax'>
    >,
  ) => {
    const current = await get(id);
    checkSalary(data.salaryMin ?? current.salaryMin, data.salaryMax ?? current.salaryMax);
    return db.jobPost.update({ where: { id }, data });
  };

  const setStatus = async (id: string, status: Status) => {
    await get(id);
    return db.jobPost.update({ where: { id }, data: { status } });
  };

  /** Soft delete. */
  const remove = async (id: string) => {
    await get(id);
    await db.jobPost.update({ where: { id }, data: { deletedAt: new Date() } });
  };

  return { create, list, get, update, setStatus, remove };
};
