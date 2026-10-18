import { prisma } from '@/configs'; // adjust to wherever your shared PrismaClient lives
import type { CreateDepartmentInput, UpdateDepartmentInput } from '@/types';

async function assertEmployeeExists(employeeId: string) {
  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!employee) throw new Error('Employee not found');
}

async function getDepartmentById(id: string) {
  const department = await prisma.department.findUnique({ where: { id } });
  if (!department) throw new Error('Department not found');
  return department;
}

async function listDepartments() {
  return prisma.department.findMany({ orderBy: { name: 'asc' } });
}

async function createDepartment(input: CreateDepartmentInput) {
  const headId = input.departmentHeadId ?? null;
  if (headId) await assertEmployeeExists(headId);

  return prisma.department.create({
    data: { name: input.name, departmentHeadId: headId },
  });
}

async function updateDepartment(id: string, input: UpdateDepartmentInput) {
  await getDepartmentById(id);
  if (input.departmentHeadId) await assertEmployeeExists(input.departmentHeadId);

  return prisma.department.update({ where: { id }, data: input });
}

async function deleteDepartment(id: string) {
  await getDepartmentById(id);

  const requestCount = await prisma.hiringRequest.count({ where: { departmentId: id } });
  if (requestCount > 0) throw new Error('Cannot delete a department with hiring requests');

  return prisma.department.delete({ where: { id } });
}

async function listMembers(departmentId: string) {
  await getDepartmentById(departmentId);
  return prisma.departmentMember.findMany({ where: { departmentId } });
}

async function addMember(departmentId: string, employeeId: string) {
  await getDepartmentById(departmentId);
  await assertEmployeeExists(employeeId);

  const existing = await prisma.departmentMember.findFirst({ where: { departmentId, employeeId } });
  if (existing) throw new Error('Employee is already a member');

  return prisma.departmentMember.create({ data: { departmentId, employeeId } });
}

async function removeMember(departmentId: string, employeeId: string) {
  const result = await prisma.departmentMember.deleteMany({ where: { departmentId, employeeId } });
  if (result.count === 0) throw new Error('Membership not found');
  return result;
}

export const departmentService = {
  getDepartmentById,
  listDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  listMembers,
  addMember,
  removeMember,
};
