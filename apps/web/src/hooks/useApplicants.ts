import { useCallback, useEffect, useState } from 'react';
import type { ApplicantStatus } from '@ats/shared-types';
import { api } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/getApiErrorMessage';

export type ApplicantRecord = {
  id: string;
  status: ApplicantStatus;
  scoreStatus: string;
  applyDate: string;
  user?: { id: string; firstName: string; lastName: string; email: string };
  jobPost?: { id: string; title: string };
  scores?: { educationalBackground: number; skills: number; workExperience: number; certification: number; totalScore: number } | null;
};

type ApplicantsResponse = {
  applications: ApplicantRecord[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

const pageSize = 10;

export function useApplicants() {
  const [applications, setApplications] = useState<ApplicantRecord[]>([]);
  const [pagination, setPagination] = useState<ApplicantsResponse['pagination']>({ page: 1, limit: pageSize, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [scoreStatus, setScoreStatus] = useState(() => new URLSearchParams(window.location.search).get('scoreStatus') ?? '');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadApplicants = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const response = await api.get<ApplicantsResponse>('/applications', {
        params: { page, limit: pageSize, ...(search.trim() ? { search: search.trim() } : {}), ...(status ? { status } : {}), ...(departmentId ? { departmentId } : {}), ...(scoreStatus ? { scoreStatus } : {}) },
      });
      setApplications(response.data.applications);
      setPagination(response.data.pagination);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Unable to load applicants. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  }, [page, search, status, departmentId, scoreStatus]);

  useEffect(() => { void loadApplicants(); }, [loadApplicants]);

  async function updateStatus(applicationId: string, nextStatus: ApplicantStatus): Promise<boolean> {
    setUpdatingId(applicationId);
    setErrorMessage('');
    try {
      await api.patch(`/applications/${applicationId}/status`, { status: nextStatus });
      await loadApplicants();
      return true;
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Unable to update application status.'));
      return false;
    } finally {
      setUpdatingId(null);
    }
  }

  return {
    applications,
    pagination,
    search,
    setSearch: (value: string) => { setPage(1); setSearch(value); },
    status,
    setStatus: (value: string) => { setPage(1); setStatus(value); },
    departmentId,
    setDepartmentId: (value: string) => { setPage(1); setDepartmentId(value); },
    scoreStatus,
    setScoreStatus: (value: string) => { setPage(1); setScoreStatus(value); },
    page,
    setPage,
    isLoading,
    errorMessage,
    updatingId,
    updateStatus,
    reload: loadApplicants,
  };
}
