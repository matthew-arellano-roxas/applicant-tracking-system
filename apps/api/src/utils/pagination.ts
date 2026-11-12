import type { PaginationQuery } from '@/schemas/pagination.schema';

export type { PaginationQuery } from '@/schemas/pagination.schema';

export const getPaginationMetadata = ({ page, limit }: PaginationQuery, total: number) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});
