export const UserRole = {
  Admin: 'ADMIN',
  DepartmentHead: 'DEPARTMENT_HEAD',
  Dean: 'DEAN',
  Hr: 'HUMAN_RESOURCE',
  Applicant: 'APPLICANT',
  Employee: 'EMPLOYEE',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
