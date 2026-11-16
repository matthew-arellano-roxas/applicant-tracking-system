import { Router } from 'express';
import { UserRole } from '@/constants';
import { listCampuses } from '@/controllers/campus.controller';
import { requireAuth, requireRole } from '@/middlewares/auth.middleware';
import { cacheGetResponse } from '@/middlewares/response-cache.middleware';

const campusRoute = Router();
campusRoute.use(requireAuth);
campusRoute.use(cacheGetResponse);
campusRoute.get('/', requireRole(UserRole.Admin, UserRole.Hr, UserRole.Dean, UserRole.DepartmentHead), listCampuses);

export { campusRoute };
