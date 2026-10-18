// Matches the Department and DepartmentMember models
export type Department = {
  id: string;
  name: string;
  departmentHeadId: string | null;
  createdAt: Date;
};

export type DepartmentMember = {
  id: string;
  employeeId: string;
  departmentId: string;
};

export type CreateDepartmentInput = {
  name: string;
  departmentHeadId?: string | null;
};

export type UpdateDepartmentInput = Partial<CreateDepartmentInput>;

export type DepartmentService = {
  getDepartmentById: (id: string) => Promise<Department>;
  listDepartments: () => Promise<Department[]>;
  createDepartment: (input: CreateDepartmentInput) => Promise<Department>;
  updateDepartment: (id: string, input: UpdateDepartmentInput) => Promise<Department>;
  deleteDepartment: (id: string) => Promise<Department>;
  listMembers: (departmentId: string) => Promise<DepartmentMember[]>;
  addMember: (departmentId: string, employeeId: string) => Promise<DepartmentMember>;
  removeMember: (departmentId: string, employeeId: string) => Promise<{ count: number }>;
};
