import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';
import './index.css';
import { AppLayout } from './App.tsx';
import { AuthGuard } from './components/AuthGuard.tsx';
import { AuthSessionLoader } from './components/AuthSessionLoader.tsx';
import { PageAccessGuard, WorkspaceFallback } from './components/PageAccessGuard.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { RegisterPage } from './pages/RegisterPage.tsx';
import { ApplicantsPage } from './pages/ApplicantsPage.tsx';
import { JobsPage } from './pages/JobsPage.tsx';
import { TeamPage } from './pages/TeamPage.tsx';
import { InterviewsPage } from './pages/InterviewsPage.tsx';
import { HiringRequestsPage } from './pages/HiringRequestsPage.tsx';
import { JobPostsWorkspacePage } from './pages/JobPostsWorkspacePage.tsx';
import { HiringRequestDetailPage } from './pages/HiringRequestDetailPage.tsx';
import { DepartmentsPage } from './pages/DepartmentsPage.tsx';
import { useAuthStore } from './stores/authStore';
import { UserRole } from '@ats/shared-types';
import { getDefaultWorkspacePath } from './config/workspacePages';
import { AdminUsersPage, ApplicantApplicationsPage, ApplicantCvPage, ApplicantInterviewsPage, DeanApprovalsPage, EmployeeDocumentsPage, EmployeeInterviewsPage, HiringOverviewPage } from './pages/RolePages';

function HomeRedirect() { const role = useAuthStore(s => s.user?.role); return role ? <Navigate to={getDefaultWorkspacePath(role)} replace /> : null; }
const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> }, { path: '/register', element: <RegisterPage /> },
  { element: <AuthSessionLoader><AuthGuard><AppLayout /></AuthGuard></AuthSessionLoader>, children: [
    { index: true, element: <HomeRedirect /> },
    { path: 'a/jobs', element: <PageAccessGuard pageKey="a_jobs"><JobsPage /></PageAccessGuard> },
    { path: 'a/applications', element: <PageAccessGuard pageKey="a_apps"><ApplicantApplicationsPage /></PageAccessGuard> },
    { path: 'a/interviews', element: <PageAccessGuard pageKey="a_interviews"><ApplicantInterviewsPage /></PageAccessGuard> },
    { path: 'a/cv', element: <PageAccessGuard pageKey="a_cv"><ApplicantCvPage /></PageAccessGuard> },
    { path: 'h/dashboard', element: <PageAccessGuard pageKey="h_dash"><HiringOverviewPage /></PageAccessGuard> },
    { path: 'h/applications', element: <PageAccessGuard pageKey="h_apps"><ApplicantsPage /></PageAccessGuard> },
    { path: 'h/job-posts', element: <PageAccessGuard pageKey="h_requests"><JobPostsWorkspacePage /></PageAccessGuard> },
    { path: 'h/job-posts/published', element: <PageAccessGuard pageKey="h_posts"><JobPostsWorkspacePage /></PageAccessGuard> },
    { path: 'h/hiring-requests/:id', element: <PageAccessGuard pageKey="h_requests"><HiringRequestDetailPage /></PageAccessGuard> },
    { path: 'h/interviews', element: <PageAccessGuard pageKey="h_interviews"><InterviewsPage /></PageAccessGuard> },
    { path: 'h/employees', element: <PageAccessGuard pageKey="h_employees"><TeamPage /></PageAccessGuard> },
    { path: 'd/requests', element: <PageAccessGuard pageKey="d_requests"><HiringRequestsPage /></PageAccessGuard> },
    { path: 'd/requests/:id', element: <PageAccessGuard pageKey="d_requests"><HiringRequestDetailPage /></PageAccessGuard> },
    { path: 'd/evaluations', element: <PageAccessGuard pageKey="d_eval"><InterviewsPage /></PageAccessGuard> },
    { path: 'n/approvals', element: <PageAccessGuard pageKey="n_queue"><DeanApprovalsPage /></PageAccessGuard> },
    { path: 'm/users', element: <PageAccessGuard pageKey="m_users"><AdminUsersPage /></PageAccessGuard> },
    { path: 'm/departments', element: <PageAccessGuard pageKey="m_depts"><DepartmentsPage /></PageAccessGuard> },
    { path: 'e/interviews', element: <PageAccessGuard pageKey="e_interviews"><EmployeeInterviewsPage /></PageAccessGuard> },
    { path: 'e/documents', element: <PageAccessGuard pageKey="e_documents"><EmployeeDocumentsPage /></PageAccessGuard> },
    { path: 'jobs', element: <RoleRedirect applicant="/a/jobs" staff="/h/job-posts" /> },
    { path: 'applicants', element: <Navigate to="/h/applications" replace /> },
    { path: 'interviews', element: <RoleRedirect applicant="/a/interviews" employee="/e/interviews" staff="/h/interviews" /> },
    { path: 'employees', element: <RoleRedirect employee="/e/documents" staff="/h/employees" /> },
    { path: 'team', element: <Navigate to="/h/employees" replace /> },
    { path: 'hiring-requests', element: <RoleRedirect departmentHead="/d/requests" dean="/n/approvals" staff="/h/job-posts" /> },
    { path: 'departments', element: <Navigate to="/m/departments" replace /> },
    { path: '*', element: <WorkspaceFallback /> },
  ] },
]);
function RoleRedirect({ applicant, employee, departmentHead, dean, staff }: { applicant?: string; employee?: string; departmentHead?: string; dean?: string; staff?: string }) { const role=useAuthStore(s=>s.user?.role); const path=role===UserRole.Applicant?applicant:role===UserRole.Employee?employee:role===UserRole.DepartmentHead?departmentHead:role===UserRole.Dean?dean:staff; return path?<Navigate to={path} replace/>:<HomeRedirect/>; }

createRoot(document.getElementById('root')!).render(<StrictMode><RouterProvider router={router} /></StrictMode>);
