import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Building2, Search } from 'lucide-react';
import { UserRole } from '@ats/shared-types';
import { api } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/getApiErrorMessage';
import { useAuthStore } from '@/stores/authStore';

type Department = { id: string; name: string; departmentHeadId?: string | null };
type Employee = { id: string; user: { firstName: string; lastName: string; role: string } };
type DepartmentMember = { id: string; employeeId: string; employee: { position: string; user: { firstName: string; lastName: string; email: string } } };

export function DepartmentsPage() {
  const role = useAuthStore((state) => state.user?.role);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [headFilter, setHeadFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [membersFor, setMembersFor] = useState<Department | null>(null);
  const [members, setMembers] = useState<DepartmentMember[]>([]);
  const [employeeToAdd, setEmployeeToAdd] = useState('');
  const canManage = role === UserRole.Admin || role === UserRole.Hr;
  const canManageMembers = canManage || role === UserRole.DepartmentHead;
  const canAssignHead = canManage || role === UserRole.Dean;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [departmentResponse, employeeResponse] = await Promise.all([
        api.get<{ departments: Department[]; pagination?: { total: number; totalPages: number } }>('/departments', { params: { page, limit: 8, ...(search.trim() ? { search: search.trim() } : {}), ...(headFilter ? { hasDepartmentHead: headFilter } : {}) } }),
        api.get<{ employees: Employee[] }>('/employees', { params: { page: 1, limit: 100 } }),
      ]);
      setDepartments(departmentResponse.data.departments); setTotal(departmentResponse.data.pagination?.total ?? departmentResponse.data.departments.length); setTotalPages(departmentResponse.data.pagination?.totalPages ?? 0); setEmployees(employeeResponse.data.employees); setError('');
    } catch (requestError) { setError(getApiErrorMessage(requestError, 'Could not load departments.')); }
    finally { setLoading(false); }
  }, [search, headFilter, page]);
  useEffect(() => { void load(); }, [load]);

  async function createDepartment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const name = String(new FormData(form).get('name')).trim();
    try { await api.post('/departments', { name }); form.reset(); setError(''); await load(); }
    catch (requestError) { setError(getApiErrorMessage(requestError, 'Could not create department.')); }
  }
  async function renameDepartment(department: Department) {
    const name = window.prompt('Department name', department.name); if (!name?.trim()) return;
    try { await api.patch(`/departments/${department.id}`, { name: name.trim() }); await load(); }
    catch (requestError) { setError(getApiErrorMessage(requestError, 'Could not update department.')); }
  }
  async function deleteDepartment(department: Department) {
    if (!window.confirm(`Delete ${department.name}?`)) return;
    try { await api.delete(`/departments/${department.id}`); await load(); }
    catch (requestError) { setError(getApiErrorMessage(requestError, 'Could not delete department.')); }
  }
  async function assignHead(department: Department, employeeId: string) {
    try { if (employeeId) await api.patch(`/departments/${department.id}/head`, { employeeId }); else await api.delete(`/departments/${department.id}/head`); await load(); }
    catch (requestError) { setError(getApiErrorMessage(requestError, 'Could not update department head.')); }
  }
  async function showMembers(department: Department) {
    setMembersFor(department); setMembers([]);
    try { const { data } = await api.get<{ members: DepartmentMember[] }>(`/departments/${department.id}/members`, { params: { page: 1, limit: 100 } }); setMembers(data.members); }
    catch (requestError) { setError(getApiErrorMessage(requestError, 'Could not load department members.')); }
  }
  async function addMember() {
    if (!membersFor || !employeeToAdd) return;
    try { await api.post(`/departments/${membersFor.id}/members`, { employeeId: employeeToAdd }); setEmployeeToAdd(''); await showMembers(membersFor); }
    catch (requestError) { setError(getApiErrorMessage(requestError, 'Could not add member.')); }
  }
  async function removeMember(employeeId: string) {
    if (!membersFor) return;
    try { await api.delete(`/departments/${membersFor.id}/members/${employeeId}`); await showMembers(membersFor); }
    catch (requestError) { setError(getApiErrorMessage(requestError, 'Could not remove member.')); }
  }

  return (
    <div className="space-y-5">
      <header><h2 className="text-xl font-semibold">Departments</h2><p className="mt-1 text-sm text-muted-foreground">Manage department heads and employee membership.</p></header>
      {error && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>}
      {canManage && <form onSubmit={(event) => void createDepartment(event)} className="flex gap-2 rounded-xl border border-border bg-card p-4"><input name="name" required placeholder="New department name" className="h-10 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm" /><button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Create department</button></form>}
      <section className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-[minmax(0,1fr)_220px]"><label className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(event) => { setPage(1); setSearch(event.target.value); }} placeholder="Search departments" aria-label="Search departments" className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm" /></label><select value={headFilter} onChange={(event) => { setPage(1); setHeadFilter(event.target.value); }} aria-label="Filter by assigned department head" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">All departments</option><option value="true">Head assigned</option><option value="false">No head assigned</option></select></section>
      {loading ? <p className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">Loading departments…</p> : departments.length === 0 ? <p className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">No departments match these filters.</p> : <section className="grid gap-4 lg:grid-cols-2">{departments.map((department) => <article key={department.id} className="rounded-xl border border-border bg-card p-5 shadow-sm"><div className="flex items-start gap-3"><span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Building2 className="size-5" /></span><div className="min-w-0 flex-1"><h3 className="font-semibold">{department.name}</h3><p className="mt-1 text-xs text-muted-foreground">{employees.find((employee) => employee.id === department.departmentHeadId)?.user ? `Head: ${employees.find((employee) => employee.id === department.departmentHeadId)?.user.firstName} ${employees.find((employee) => employee.id === department.departmentHeadId)?.user.lastName}` : 'No department head assigned'}</p></div></div><div className="mt-4 flex flex-wrap items-center gap-2">{canAssignHead && <select aria-label={`Assign head for ${department.name}`} value={department.departmentHeadId ?? ''} onChange={(event) => void assignHead(department, event.target.value)} className="h-9 max-w-full rounded-md border border-input bg-background px-2 text-xs"><option value="">No department head</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.user.firstName} {employee.user.lastName}</option>)}</select>}<button onClick={() => void showMembers(department)} className="rounded-md border border-input px-3 py-2 text-xs hover:bg-accent">Members</button>{canManage && <><button onClick={() => void renameDepartment(department)} className="rounded-md border border-input px-3 py-2 text-xs hover:bg-accent">Rename</button>{role === UserRole.Admin && <button onClick={() => void deleteDepartment(department)} className="rounded-md border border-input px-3 py-2 text-xs text-destructive hover:bg-destructive/10">Delete</button>}</>}</div></article>)}</section>}
      <footer className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 text-xs text-muted-foreground"><span>{total === 0 ? '0 departments' : `${(page - 1) * 8 + 1}–${Math.min(page * 8, total)} of ${total} departments`}</span><div className="flex gap-2"><button disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)} className="rounded-md border border-input px-3 py-1.5 hover:bg-accent disabled:opacity-50">Previous</button><button disabled={page >= totalPages || loading} onClick={() => setPage((current) => current + 1)} className="rounded-md border border-input px-3 py-1.5 hover:bg-accent disabled:opacity-50">Next</button></div></footer>
      {membersFor && <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-4"><section className="max-h-[85dvh] w-full max-w-xl overflow-y-auto rounded-xl border border-border bg-card p-5 shadow-xl"><header className="flex justify-between"><div><h3 className="font-semibold">{membersFor.name} members</h3><p className="mt-1 text-xs text-muted-foreground">{members.length} employees</p></div><button onClick={() => setMembersFor(null)} aria-label="Close members">×</button></header>{canManageMembers && <div className="mt-4 flex gap-2"><select value={employeeToAdd} onChange={(event) => setEmployeeToAdd(event.target.value)} className="h-10 min-w-0 flex-1 rounded-md border border-input bg-background px-2 text-sm"><option value="">Add an employee…</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.user.firstName} {employee.user.lastName}</option>)}</select><button disabled={!employeeToAdd} onClick={() => void addMember()} className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-50">Add</button></div>}<div className="mt-3 divide-y divide-border">{members.map((member) => <div key={member.id} className="flex items-center justify-between gap-3 py-3"><div><p className="text-sm font-medium">{member.employee.user.firstName} {member.employee.user.lastName}</p><p className="text-xs text-muted-foreground">{member.employee.position} · {member.employee.user.email}</p></div>{canManageMembers && <button onClick={() => void removeMember(member.employeeId)} className="text-xs text-destructive hover:underline">Remove</button>}</div>)}{members.length === 0 && <p className="py-6 text-sm text-muted-foreground">No department members listed.</p>}</div></section></div>}
    </div>
  );
}
