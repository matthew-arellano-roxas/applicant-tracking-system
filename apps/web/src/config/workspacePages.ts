import { UserRole, type UserRole as UserRoleValue } from '@ats/shared-types';

type Page = { key: string; label: string; path: string; roles: readonly UserRoleValue[]; access: string };
const applicant = [UserRole.Applicant] as const;
const hrAdmin = [UserRole.Hr, UserRole.Admin] as const;
const admin = [UserRole.Admin] as const;
const head = [UserRole.DepartmentHead] as const;
const dean = [UserRole.Dean] as const;
const employee = [UserRole.Employee] as const;

export const workspacePages: Page[] = [
  { key: 'a_jobs', label: 'Open jobs', path: '/a/jobs', roles: applicant, access: 'Browse open positions and apply using your own CV.' },
  { key: 'a_apps', label: 'My applications', path: '/a/applications', roles: applicant, access: 'View only your applications and their progress.' },
  { key: 'a_interviews', label: 'My interviews', path: '/a/interviews', roles: applicant, access: 'View your own interview schedule. Evaluations are private.' },
  { key: 'a_cv', label: 'My CV', path: '/a/cv', roles: applicant, access: 'Upload, replace, or download your own CV.' },
  { key: 'h_dash', label: 'Recruitment overview', path: '/h/dashboard', roles: hrAdmin, access: 'View recruitment activity and items needing attention.' },
  { key: 'h_apps', label: 'Applications', path: '/h/applications', roles: hrAdmin, access: 'Review all applications, advisory CV fit, and status.' },
  { key: 'h_requests', label: 'Hiring requests', path: '/h/job-posts', roles: hrAdmin, access: 'Review and manage hiring requests.' },
  { key: 'h_posts', label: 'Job posts', path: '/h/job-posts/published', roles: hrAdmin, access: 'Publish approved requests and manage published job posts.' },
  { key: 'h_interviews', label: 'Interviews', path: '/h/interviews', roles: hrAdmin, access: 'Schedule and manage interviews and evaluations.' },
  { key: 'h_employees', label: 'Employee documents', path: '/h/employees', roles: hrAdmin, access: 'Manage employee records and document checklists.' },
  { key: 'd_requests', label: 'Staffing requests', path: '/d/requests', roles: head, access: 'Create and track staffing requests for your department.' },
  { key: 'd_eval', label: 'My interview evaluations', path: '/d/evaluations', roles: head, access: 'Complete assigned interviews and submit private evaluations.' },
  { key: 'n_queue', label: 'Hiring approvals', path: '/n/approvals', roles: dean, access: 'Review and decide pending staffing requests.' },
  { key: 'm_users', label: 'Users and roles', path: '/m/users', roles: admin, access: 'View users and assign account roles.' },
  { key: 'm_depts', label: 'Departments', path: '/m/departments', roles: admin, access: 'Manage departments, heads, and membership.' },
  { key: 'e_interviews', label: 'My interviews', path: '/e/interviews', roles: employee, access: 'View interviews assigned to you and submit evaluations.' },
  { key: 'e_documents', label: 'My documents', path: '/e/documents', roles: employee, access: 'View your own employee document checklist.' },
];

export type WorkspacePageKey = (typeof workspacePages)[number]['key'];
export function getWorkspacePagesForRole(role: UserRoleValue) { return workspacePages.filter((page) => page.roles.includes(role)); }
export function canAccessWorkspacePage(pageKey: WorkspacePageKey, role: UserRoleValue) { return workspacePages.some((page) => page.key === pageKey && page.roles.includes(role)); }
export function getDefaultWorkspacePath(role: UserRoleValue) {
  if (role === UserRole.Admin) return '/m/users';
  if (role === UserRole.Hr) return '/h/dashboard';
  if (role === UserRole.DepartmentHead) return '/d/requests';
  if (role === UserRole.Dean) return '/n/approvals';
  if (role === UserRole.Employee) return '/e/interviews';
  return '/a/jobs';
}
export function getWorkspacePage(path: string) { return workspacePages.find((page) => page.path === path); }
