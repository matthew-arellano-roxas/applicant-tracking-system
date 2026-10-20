import { Router } from 'express';
import { UserRole } from '@/constants';
import { listCampuses } from '@/controllers/campus.controller';
import { requireAuth, requireRole } from '@/middlewares/auth.middleware';

const campusRoute = Router();
campusRoute.use(requireAuth);
campusRoute.get('/', requireRole(UserRole.Admin, UserRole.Hr, UserRole.Dean, UserRole.DepartmentHead), listCampuses);

export { campusRoute };
