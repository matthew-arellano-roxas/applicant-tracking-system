import { useEffect, useState } from 'react';
import { UserRole, type CurrentUser } from '@ats/shared-types';
import { api } from '@/lib/api';

type PageResponse<T> = {
  items: T[];
  pagination: { total: number };
};
type JobPost = { id: string; title: string; status: string; createdAt?: string };
type Application = {
  id: string;
  status: string;
  applyDate: string;
  jobPost?: { title: string };
  user?: { firstName: string; lastName: string };
};
type HiringRequest = { id: string; position: string; status: string; createdAt?: string };
type Interview = { id: string; stage: string; status: string; date: string; applicant?: { user?: { firstName: string; lastName: string } } };

type OverviewData = {
  openJobs: PageResponse<JobPost> | null;
  applications: PageResponse<Application> | null;
  pendingRequests: PageResponse<HiringRequest> | null;
  interviews: PageResponse<Interview> | null;
  isLoading: boolean;
  hasError: boolean;
};

const emptyData: OverviewData = {
  openJobs: null,
  applications: null,
  pendingRequests: null,
  interviews: null,
  isLoading: true,
  hasError: false,
};

async function loadOptional<T>(
  request: Promise<{ data: { pagination: { total: number }; [key: string]: unknown } }>,
  key: string,
): Promise<PageResponse<T> | null> {
  try {
    const { data } = await request;
    return { items: data[key] as T[], pagination: data.pagination };
  } catch {
    return null;
  }
}

export function useOverviewData(user: CurrentUser) {
  const [data, setData] = useState(emptyData);

  useEffect(() => {
    let isActive = true;

    async function loadDashboard() {
      setData(emptyData);
      const isApplicant = user.role === UserRole.Applicant;
      const canManage = user.role === UserRole.Admin || user.role === UserRole.Hr;
      const canViewRequests = user.role !== UserRole.Applicant;
      const canViewInterviews = isApplicant || user.role === UserRole.Employee || user.role === UserRole.DepartmentHead || user.role === UserRole.Dean || canManage;
      const upcomingInterviewParams = { status: 'SCHEDULED', dateFrom: new Date().toISOString(), page: 1, limit: 5 };

      const requests = await Promise.all([
        loadOptional<JobPost>(api.get('/job-posts', { params: { status: 'OPEN', page: 1, limit: 5 } }), 'jobPosts'),
        canManage
          ? loadOptional<Application>(api.get('/applications', { params: { page: 1, limit: 5 } }), 'applications')
          : isApplicant
            ? loadOptional<Application>(api.get('/applications/me', { params: { page: 1, limit: 5 } }), 'applications')
            : Promise.resolve(null),
        canViewRequests
          ? loadOptional<HiringRequest>(api.get('/hiring-requests', { params: { status: 'PENDING', page: 1, limit: 5 } }), 'hiringRequests')
          : Promise.resolve(null),
        canViewInterviews
          ? loadOptional<Interview>(api.get(isApplicant || !canManage ? '/interviews/me' : '/interviews', { params: upcomingInterviewParams }), 'interviews')
          : Promise.resolve(null),
      ]);

      if (!isActive) return;
      const [jobs, applications, pendingRequests, interviews] = requests;
      setData({
        openJobs: jobs,
        applications,
        pendingRequests,
        interviews,
        isLoading: false,
        hasError: requests.every((result) => result === null),
      });
    }

    void loadDashboard();
    return () => { isActive = false; };
  }, [user.id, user.role]);

  return data;
}
