import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { CheckCircle2, Clock3, MoreHorizontal, Search, X } from 'lucide-react';
import { useSearchParams } from 'react-router';
import { UserRole } from '@ats/shared-types';
import { api } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/getApiErrorMessage';
import { useAuthStore } from '@/stores/authStore';

type Employee = { id: string; position: string; employmentType: string; isTeaching: boolean; user: { id: string; firstName: string; lastName: string; email: string; role: string }; departments?: { id: string; name: string }[] };
type AvailableUser = { id: string; firstName: string; lastName: string; email: string; role: string };
type DocumentChecklist = { employeeId: string; status: Record<string, string> | null; idRecords: { id: string; idType: string; notes?: string | null }[] };
const documentLabels: Record<string, string> = { validId: 'Valid IDs', tin: 'TIN', sss: 'SSS', philhealth: 'PhilHealth', pagIbig: 'Pag-IBIG', medicalRecord: 'Medical record', psa: 'PSA', birForm: 'BIR form', nbiClearance: 'NBI clearance' };
const documentTypes: Record<string, string> = { validId: 'VALID_ID', tin: 'TIN', sss: 'SSS', philhealth: 'PHILHEALTH', pagIbig: 'PAG_IBIG', medicalRecord: 'MEDICAL_RECORD', psa: 'PSA', birForm: 'BIR_FORM', nbiClearance: 'NBI_CLEARANCE' };
const acceptedIdTypes = ['PHILIPPINE_NATIONAL_ID', 'PASSPORT', 'DRIVERS_LICENSE', 'UMID', 'PRC_ID', 'VOTERS_ID', 'POSTAL_ID'];

export function TeamPage() {
  const role = useAuthStore((state) => state.user?.role);
  const [searchParams, setSearchParams] = useSearchParams();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AvailableUser | null>(null);
  const [loadingAvailableUsers, setLoadingAvailableUsers] = useState(false);
  const [userLookupError, setUserLookupError] = useState('');
  const [positionInput, setPositionInput] = useState('');
  const [checklist, setChecklist] = useState<DocumentChecklist | null>(null);
  const [employeeForChecklist, setEmployeeForChecklist] = useState<Employee | null>(null);
  const [employeeActionMenu, setEmployeeActionMenu] = useState<{ employee: Employee; top: number; left: number } | null>(null);
  const [employeeEditDraft, setEmployeeEditDraft] = useState<{ employee: Employee; position: string; employmentType: string; isTeaching: boolean; departmentIds: string[] } | null>(null);
  const [savingEmployeeEdit, setSavingEmployeeEdit] = useState(false);
  const [ownChecklist, setOwnChecklist] = useState<DocumentChecklist | null>(null);
  const [ownChecklistError, setOwnChecklistError] = useState('');
  const [ownChecklistLoading, setOwnChecklistLoading] = useState(true);
  const [checklistError, setChecklistError] = useState('');
  const [recordedIdType, setRecordedIdType] = useState('');
  const [recordedIdNotes, setRecordedIdNotes] = useState('');
  const [recordingId, setRecordingId] = useState(false);
  const [employeeDraft, setEmployeeDraft] = useState<{ userId: string; name: string; position: string; employmentType: string; isTeaching: boolean; departmentId: string } | null>(null);
  const [draftDepartments, setDraftDepartments] = useState<{ id: string; name: string }[]>([]);
  const canManage = role === UserRole.Admin || role === UserRole.Hr;

  useEffect(() => {
    if (role !== UserRole.Employee) return;
    void api.get<DocumentChecklist>('/employees/me/document-status')
      .then(({ data }) => setOwnChecklist(data))
      .catch((requestError: unknown) => setOwnChecklistError(getApiErrorMessage(requestError, 'Could not load your document checklist.')))
      .finally(() => setOwnChecklistLoading(false));
  }, [role]);

  const load = useCallback(async () => {
    if (role === UserRole.Employee) return;
    try {
      const [employeeResponse, departmentResponse] = await Promise.all([
        api.get<{ employees: Employee[] }>('/employees', { params: { page: 1, limit: 100, ...(search.trim() ? { search: search.trim() } : {}) } }),
        canManage ? api.get<{ departments: { id: string; name: string }[] }>('/departments', { params: { page: 1, limit: 100 } }) : Promise.resolve(null),
      ]);
      setEmployees(employeeResponse.data.employees);
      if (departmentResponse) setDraftDepartments(departmentResponse.data.departments);
      setError('');
    }
    catch (requestError) { setError(getApiErrorMessage(requestError, 'Could not load the hiring team.')); }
  }, [role, search, canManage]);
  useEffect(() => { if (role !== UserRole.Employee) void load(); }, [load, role]);

  useEffect(() => {
    const query = userSearch.trim();
    if (!canManage || query.length < 2 || selectedUser) {
      setAvailableUsers([]);
      setLoadingAvailableUsers(false);
      return;
    }
    let active = true;
    const timeout = window.setTimeout(() => {
      setLoadingAvailableUsers(true);
      setUserLookupError('');
      void api.get<{ users: AvailableUser[] }>('/employees/available-users', { params: { search: query, page: 1, limit: 20 } })
        .then(({ data }) => { if (active) setAvailableUsers(data.users); })
        .catch((requestError: unknown) => { if (active) setUserLookupError(getApiErrorMessage(requestError, 'Could not search for users.')); })
        .finally(() => { if (active) setLoadingAvailableUsers(false); });
    }, 250);
    return () => { active = false; window.clearTimeout(timeout); };
  }, [canManage, userSearch, selectedUser]);

  useEffect(() => {
    const applicationId = searchParams.get('applicationId');
    if (!applicationId || !canManage) return;
    let active = true;
    void (async () => {
      try {
        const [{ data: appData }, { data: departmentData }] = await Promise.all([
          api.get<{ application: { user?: { id: string; firstName: string; lastName: string }; jobPost?: { id: string; title: string } } }>(`/applications/${applicationId}`),
          api.get<{ departments: { id: string; name: string }[] }>('/departments', { params: { page: 1, limit: 100 } }),
        ]);
        const application = appData.application;
        if (!application.user?.id || !application.jobPost?.id) throw new Error('Application details are missing employee information.');
        const { data: jobData } = await api.get<{ jobPost: { title: string; hiringRequestId: string } }>(`/job-posts/${application.jobPost.id}`);
        const { data: requestData } = await api.get<{ hiringRequest: { position: string; employmentType: string; isTeaching: boolean; departmentId: string } }>(`/hiring-requests/${jobData.jobPost.hiringRequestId}`);
        if (!active) return;
        setDraftDepartments(departmentData.departments);
        setEmployeeDraft({ userId: application.user.id, name: `${application.user.firstName} ${application.user.lastName}`, position: requestData.hiringRequest.position || jobData.jobPost.title, employmentType: requestData.hiringRequest.employmentType, isTeaching: requestData.hiringRequest.isTeaching, departmentId: requestData.hiringRequest.departmentId });
      } catch (requestError) { if (active) setError(getApiErrorMessage(requestError, 'Could not prepare the employee record.')); }
    })();
    return () => { active = false; };
  }, [canManage, searchParams]);

  async function submitEmployeeDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!employeeDraft) return;
    try {
      await api.post('/employees', { userId: employeeDraft.userId, position: employeeDraft.position.trim(), employmentType: employeeDraft.employmentType, isTeaching: employeeDraft.isTeaching, ...(employeeDraft.departmentId ? { departmentIds: [employeeDraft.departmentId] } : {}) });
      setEmployeeDraft(null);
      setSearchParams({}, { replace: true });
      await load();
    } catch (requestError) { setError(getApiErrorMessage(requestError, 'Could not create the employee record.')); }
  }

  async function createEmployee() {
    if (!selectedUser) return;
    try { await api.post('/employees', { userId: selectedUser.id, position: positionInput.trim(), employmentType: 'FULL_TIME', isTeaching: false }); setSelectedUser(null); setUserSearch(''); setPositionInput(''); await load(); }
    catch (requestError) { setError(getApiErrorMessage(requestError, 'Could not create the employee record. Check the user ID.')); }
  }
  async function updateEmployee(employee: Employee) {
    setEmployeeEditDraft({
      employee,
      position: employee.position,
      employmentType: employee.employmentType,
      isTeaching: employee.isTeaching,
      departmentIds: employee.departments?.map(({ id }) => id) ?? [],
    });
  }
  async function saveEmployeeEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!employeeEditDraft) return;
    setSavingEmployeeEdit(true);
    setError('');
    try {
      await api.patch(`/employees/${employeeEditDraft.employee.id}`, {
        position: employeeEditDraft.position.trim(),
        employmentType: employeeEditDraft.employmentType,
        isTeaching: employeeEditDraft.isTeaching,
        departmentIds: employeeEditDraft.departmentIds,
      });
      setEmployeeEditDraft(null);
      await load();
    } catch (requestError) { setError(getApiErrorMessage(requestError, 'Could not update employee.')); }
    finally { setSavingEmployeeEdit(false); }
  }
  async function deleteEmployee(employee: Employee) {
    setEmployeeActionMenu(null);
    if (!window.confirm(`Remove employee record for ${employee.user.firstName} ${employee.user.lastName}?`)) return;
    try { await api.delete(`/employees/${employee.id}`); await load(); }
    catch (requestError) { setError(getApiErrorMessage(requestError, 'Could not delete employee.')); }
  }
  async function openChecklist(employee: Employee) {
    setEmployeeActionMenu(null);
    setEmployeeForChecklist(employee); setChecklist(null); setChecklistError(''); setRecordedIdType(''); setRecordedIdNotes('');
    try { const { data } = await api.get<DocumentChecklist>(`/employees/${employee.id}/document-status`); setChecklist(data); }
    catch (requestError) { setError(getApiErrorMessage(requestError, 'Could not load the document checklist.')); setEmployeeForChecklist(null); }
  }

  function showEmployeeActions(event: React.MouseEvent<HTMLButtonElement>, employee: Employee) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const menuHeight = role === UserRole.Admin ? 136 : 92;
    const top = bounds.bottom + menuHeight + 8 > window.innerHeight ? Math.max(8, bounds.top - menuHeight - 4) : bounds.bottom + 4;
    const left = Math.max(8, Math.min(bounds.right - 192, window.innerWidth - 200));
    setEmployeeActionMenu({ employee, top, left });
  }
  async function setDocumentStatus(key: string, status: 'complete' | 'pending') {
    if (!employeeForChecklist) return;
    if (!documentTypes[key]) return;
    setChecklistError('');
    try { await api.patch(`/employees/${employeeForChecklist.id}/document-status/${documentTypes[key]}`, { status }); const { data } = await api.get<DocumentChecklist>(`/employees/${employeeForChecklist.id}/document-status`); setChecklist(data); }
    catch (requestError) { setChecklistError(getApiErrorMessage(requestError, 'Could not update checklist status.')); }
  }

  async function recordAcceptedId(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!employeeForChecklist) return;
    if (!acceptedIdTypes.includes(recordedIdType)) return;
    setRecordingId(true);
    setChecklistError('');
    try {
      await api.post(`/employees/${employeeForChecklist.id}/document-status/id-records`, { idType: recordedIdType, ...(recordedIdNotes.trim() ? { notes: recordedIdNotes.trim() } : {}) });
      const { data } = await api.get<DocumentChecklist>(`/employees/${employeeForChecklist.id}/document-status`);
      setChecklist(data);
      setRecordedIdType('');
      setRecordedIdNotes('');
    } catch (requestError) { setChecklistError(getApiErrorMessage(requestError, 'Could not record the presented ID.')); }
    finally { setRecordingId(false); }
  }

  if (role === UserRole.Employee) return (
    <div className="space-y-5">
      <header><h2 className="text-xl font-semibold">My employee checklist</h2><p className="mt-1 text-sm text-muted-foreground">Review the status of your pre-employment documents.</p></header>
      {ownChecklistError && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{ownChecklistError}</p>}
      {ownChecklistLoading && <section className="animate-pulse rounded-xl border border-border bg-card p-5"><div className="h-4 w-40 rounded bg-muted" /><div className="mt-4 h-2 rounded-full bg-muted" /><div className="mt-5 space-y-4">{Object.keys(documentLabels).slice(0, 5).map((key) => <div key={key} className="h-5 rounded bg-muted/70" />)}</div></section>}
      {!ownChecklistLoading && ownChecklist && (() => {
        const completedCount = Object.keys(documentLabels).filter((key) => ownChecklist.status?.[key] === 'complete').length;
        const completion = Math.round((completedCount / Object.keys(documentLabels).length) * 100);
        return <>
          <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold">Pre-employment documents</h3><p className="mt-1 text-sm text-muted-foreground">Track the documents HR has verified for your employee file.</p></div><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{completedCount} of {Object.keys(documentLabels).length} complete</span></div>
            <div className="mt-5" role="progressbar" aria-label="Document checklist completion" aria-valuemin={0} aria-valuemax={Object.keys(documentLabels).length} aria-valuenow={completedCount}><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${completion}%` }} /></div><p className="mt-2 text-right text-xs text-muted-foreground">{completion}%</p></div>
            <div className="mt-3 divide-y divide-border">{Object.entries(documentLabels).map(([key, label]) => { const isComplete = ownChecklist.status?.[key] === 'complete'; return <div key={key} className="flex items-center justify-between gap-3 py-3"><span className="text-sm font-medium">{label}{key === 'validId' && <span className="ml-1 text-xs font-normal text-muted-foreground">({ownChecklist.idRecords.length}/2 presented)</span>}</span><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${isComplete ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-muted text-muted-foreground'}`}>{isComplete ? <CheckCircle2 className="size-3.5" /> : <Clock3 className="size-3.5" />}{isComplete ? 'Complete' : 'Pending'}</span></div>; })}</div>
            {ownChecklist.idRecords.length > 0 && <div className="mt-4 rounded-lg bg-muted/50 p-4"><h4 className="text-sm font-medium">IDs presented to HR</h4><ul className="mt-2 space-y-2">{ownChecklist.idRecords.map((record) => <li key={record.id} className="text-xs text-muted-foreground">{record.idType.replaceAll('_', ' ')}{record.notes ? ` · ${record.notes}` : ''}</li>)}</ul></div>}
            <p className="mt-4 rounded-lg border border-border bg-background p-3 text-xs leading-relaxed text-muted-foreground">Please provide the required documents to HR in person. HR will update this checklist after reviewing them.</p>
          </section>
        </>;
      })()}
    </div>
  );

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-xl font-semibold">Employees</h2><p className="mt-1 text-sm text-muted-foreground">Employee directory, department assignments, and pre-employment document checklists.</p></div><span className="text-sm text-muted-foreground">{employees.length} employees</span></header>
      {error && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>}
      {canManage && <section className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-5"><div><h3 className="font-semibold">Add employee record</h3><p className="mt-1 text-sm text-muted-foreground">Search for an existing account by name or email, then enter the employee’s position.</p></div>
        {selectedUser ? <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3"><div className="min-w-0"><p className="truncate text-sm font-medium">{selectedUser.firstName} {selectedUser.lastName}</p><p className="truncate text-xs text-muted-foreground">{selectedUser.email} · {selectedUser.role.replaceAll('_', ' ')}</p></div><button type="button" onClick={() => { setSelectedUser(null); setUserSearch(''); }} className="rounded-md border border-input px-3 py-1.5 text-xs hover:bg-accent">Change user</button></div> : <div className="space-y-2"><input value={userSearch} onChange={(event) => { setSelectedUser(null); setUserSearch(event.target.value); }} placeholder="Search users by name or email" aria-label="Search users by name or email" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />{userLookupError && <p role="alert" className="text-xs text-destructive">{userLookupError}</p>}{loadingAvailableUsers && <p className="text-xs text-muted-foreground">Searching users…</p>}{!loadingAvailableUsers && userSearch.trim().length > 0 && userSearch.trim().length < 2 && <p className="text-xs text-muted-foreground">Enter at least two characters to search.</p>}{!loadingAvailableUsers && userSearch.trim().length >= 2 && !userLookupError && availableUsers.length === 0 && <p className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">No eligible accounts found. Users with an employee record are excluded.</p>}{availableUsers.length > 0 && !selectedUser && <div role="listbox" aria-label="Matching users" className="max-h-52 overflow-y-auto rounded-lg border border-border">{availableUsers.map((candidate) => <button key={candidate.id} type="button" role="option" aria-selected="false" onClick={() => { setSelectedUser(candidate); setUserSearch(`${candidate.firstName} ${candidate.lastName}`); setAvailableUsers([]); }} className="flex w-full items-center justify-between gap-3 border-b border-border px-3 py-2.5 text-left last:border-b-0 hover:bg-accent"><span className="min-w-0"><span className="block truncate text-sm font-medium">{candidate.firstName} {candidate.lastName}</span><span className="block truncate text-xs text-muted-foreground">{candidate.email}</span></span><span className="shrink-0 rounded-full bg-muted px-2 py-1 text-[10px] text-muted-foreground">{candidate.role.replaceAll('_', ' ')}</span></button>)}</div>}</div>}
        <div className="flex flex-col gap-3 sm:flex-row"><input value={positionInput} onChange={(event) => setPositionInput(event.target.value)} placeholder="Position title" aria-label="Employee position" className="h-10 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm" /><button disabled={!selectedUser || !positionInput.trim()} onClick={() => void createEmployee()} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">Create employee record</button></div>
      </section>}
      <section className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"><Search className="size-4 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by employee name, email, or position" className="h-9 min-w-0 flex-1 bg-transparent text-sm outline-none" /></section>
      {employees.length === 0 ? <p className="rounded-xl border border-dashed border-border bg-card px-5 py-10 text-center text-sm text-muted-foreground">No employee records found.</p> : <section className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm"><table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-muted/60 text-xs text-muted-foreground"><tr><th className="px-5 py-3">Employee</th><th className="px-5 py-3">Position</th><th className="px-5 py-3">Departments</th><th className="px-5 py-3">Role</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-border">{employees.map((employee) => <tr key={employee.id}><td className="px-5 py-4"><p className="font-medium">{employee.user.firstName} {employee.user.lastName}</p><p className="text-xs text-muted-foreground">{employee.user.email}</p></td><td className="px-5 py-4">{employee.position}</td><td className="px-5 py-4 text-muted-foreground">{employee.departments?.map(({ name }) => name).join(', ') || ' - '}</td><td className="px-5 py-4">{employee.user.role.replaceAll('_', ' ')}</td><td className="px-5 py-3 text-right"><button type="button" aria-label={`Actions for ${employee.user.firstName} ${employee.user.lastName}`} aria-haspopup="menu" onClick={(event) => showEmployeeActions(event, employee)} className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><MoreHorizontal className="size-5" /></button></td></tr>)}</tbody></table></section>}
      {employeeActionMenu && <><button type="button" aria-label="Close employee actions" className="fixed inset-0 z-40 cursor-default bg-transparent" onClick={() => setEmployeeActionMenu(null)} /><div role="menu" aria-label={`Actions for ${employeeActionMenu.employee.user.firstName} ${employeeActionMenu.employee.user.lastName}`} onKeyDown={(event) => { if (event.key === 'Escape') setEmployeeActionMenu(null); }} style={{ top: employeeActionMenu.top, left: employeeActionMenu.left }} className="fixed z-50 w-48 rounded-lg border border-border bg-card p-1.5 shadow-xl"><button role="menuitem" onClick={() => void openChecklist(employeeActionMenu.employee)} className="w-full rounded-md px-3 py-2.5 text-left text-sm hover:bg-accent">View documents</button>{canManage && <button role="menuitem" onClick={() => { const employee = employeeActionMenu.employee; setEmployeeActionMenu(null); void updateEmployee(employee); }} className="w-full rounded-md px-3 py-2.5 text-left text-sm hover:bg-accent">Edit employee</button>}{role === UserRole.Admin && <button role="menuitem" onClick={() => void deleteEmployee(employeeActionMenu.employee)} className="w-full rounded-md px-3 py-2.5 text-left text-sm text-destructive hover:bg-destructive/10">Delete employee</button>}</div></>}
      {employeeEditDraft && <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !savingEmployeeEdit) setEmployeeEditDraft(null); }}><form role="dialog" aria-modal="true" aria-labelledby="edit-employee-title" onSubmit={(event) => void saveEmployeeEdit(event)} className="max-h-[90dvh] w-full max-w-lg space-y-4 overflow-y-auto rounded-xl border border-border bg-card p-5 shadow-xl"><header><h3 id="edit-employee-title" className="text-lg font-semibold">Edit employee</h3><p className="mt-1 text-sm text-muted-foreground">Update the position and department assignment for {employeeEditDraft.employee.user.firstName} {employeeEditDraft.employee.user.lastName}.</p></header><label className="block text-sm font-medium">Position<input value={employeeEditDraft.position} onChange={(event) => setEmployeeEditDraft({ ...employeeEditDraft, position: event.target.value })} required className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-normal" /></label><label className="block text-sm font-medium">Employment type<select value={employeeEditDraft.employmentType} onChange={(event) => setEmployeeEditDraft({ ...employeeEditDraft, employmentType: event.target.value })} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-normal"><option value="FULL_TIME">Full time</option><option value="PART_TIME">Part time</option></select></label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={employeeEditDraft.isTeaching} onChange={(event) => setEmployeeEditDraft({ ...employeeEditDraft, isTeaching: event.target.checked })} />Teaching position</label><fieldset><legend className="text-sm font-medium">Departments</legend><div className="mt-2 max-h-40 space-y-2 overflow-y-auto rounded-md border border-input bg-background p-3">{draftDepartments.length === 0 ? <p className="text-sm text-muted-foreground">No departments available.</p> : draftDepartments.map((department) => <label key={department.id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={employeeEditDraft.departmentIds.includes(department.id)} onChange={(event) => setEmployeeEditDraft({ ...employeeEditDraft, departmentIds: event.target.checked ? [...employeeEditDraft.departmentIds, department.id] : employeeEditDraft.departmentIds.filter((id) => id !== department.id) })} />{department.name}</label>)}</div><p className="mt-1 text-xs text-muted-foreground">Select every department this employee belongs to. Leave all unchecked for no department.</p></fieldset><div className="flex justify-end gap-2 border-t border-border pt-3"><button type="button" disabled={savingEmployeeEdit} onClick={() => setEmployeeEditDraft(null)} className="rounded-md border border-input px-3 py-2 text-sm hover:bg-accent disabled:opacity-50">Cancel</button><button type="submit" disabled={savingEmployeeEdit || !employeeEditDraft.position.trim()} className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">{savingEmployeeEdit ? 'Saving…' : 'Save changes'}</button></div></form></div>}
      {employeeForChecklist && <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setEmployeeForChecklist(null); }}><section role="dialog" aria-modal="true" aria-labelledby="employee-documents-title" className="max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-xl border border-border bg-card p-5 shadow-xl sm:p-6"><header className="flex items-start justify-between gap-3"><div><h3 id="employee-documents-title" className="font-semibold">Document checklist</h3><p className="mt-1 text-sm text-muted-foreground">{employeeForChecklist.user.firstName} {employeeForChecklist.user.lastName}</p><p className="mt-0.5 text-xs text-muted-foreground">Review received documents and update each item after verification.</p></div><button type="button" onClick={() => setEmployeeForChecklist(null)} aria-label="Close document checklist" className="rounded-md p-2 text-muted-foreground hover:bg-accent"><X className="size-4" /></button></header>
        {!checklist ? <div className="py-8 text-center"><div className="mx-auto size-6 animate-spin rounded-full border-2 border-muted border-t-primary" /><p className="mt-3 text-sm text-muted-foreground">Loading checklist...</p></div> : <>
          {(() => { const count = Object.keys(documentLabels).filter((key) => checklist.status?.[key] === 'complete').length; return <div className="mt-5 rounded-lg bg-muted/50 p-4"><div className="flex justify-between text-sm"><span className="font-medium">Checklist progress</span><span className="text-muted-foreground">{count}/{Object.keys(documentLabels).length} complete</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-background"><div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${Math.round((count / Object.keys(documentLabels).length) * 100)}%` }} /></div></div>; })()}
          {checklistError && <p role="alert" className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{checklistError}</p>}
          <div className="mt-3 divide-y divide-border">{Object.entries(documentLabels).map(([key, label]) => { const complete = checklist.status?.[key] === 'complete'; return <div key={key} className="flex items-center justify-between gap-3 py-3"><div><p className="text-sm font-medium">{label}{key === 'validId' && <span className="ml-1 text-xs font-normal text-muted-foreground">({checklist.idRecords.length}/2 presented)</span>}</p><p className={`mt-0.5 text-xs ${complete ? 'text-emerald-700 dark:text-emerald-300' : 'text-muted-foreground'}`}>{complete ? 'Verified and complete' : 'Awaiting verification'}</p></div><select aria-label={`${label} status`} value={checklist.status?.[key] ?? 'pending'} disabled={key === 'validId' && checklist.idRecords.length < 2} onChange={(event) => void setDocumentStatus(key, event.target.value as 'complete' | 'pending')} className="h-9 w-32 rounded-md border border-input bg-background px-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"><option value="pending">Pending</option><option value="complete">Complete</option></select></div>; })}</div>
          {checklist.idRecords.length > 0 && <div className="mt-4 rounded-lg border border-border p-4"><h4 className="text-sm font-medium">Presented IDs</h4><ul className="mt-2 space-y-2">{checklist.idRecords.map((record) => <li key={record.id} className="text-xs text-muted-foreground"><span className="font-medium text-foreground">{record.idType.replaceAll('_', ' ')}</span>{record.notes ? ` · ${record.notes}` : ''}</li>)}</ul></div>}
          {checklist.idRecords.length < 2 && <form onSubmit={(event) => void recordAcceptedId(event)} className="mt-4 space-y-3 rounded-lg border border-border bg-muted/30 p-4"><div><h4 className="text-sm font-medium">Record an ID presented in person</h4><p className="mt-1 text-xs text-muted-foreground">Add up to two accepted identity documents.</p></div><label className="block text-xs font-medium">ID type<select required value={recordedIdType} onChange={(event) => setRecordedIdType(event.target.value)} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">Select an ID type</option>{acceptedIdTypes.map((idType) => <option key={idType} value={idType}>{idType.replaceAll('_', ' ')}</option>)}</select></label><label className="block text-xs font-medium">Verification notes <span className="font-normal text-muted-foreground">(optional)</span><textarea value={recordedIdNotes} onChange={(event) => setRecordedIdNotes(event.target.value)} rows={2} maxLength={500} placeholder="For example: Original presented and verified by HR" className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" /></label><div className="flex justify-end"><button type="submit" disabled={!recordedIdType || recordingId} className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">{recordingId ? 'Recording…' : 'Record ID'}</button></div></form>}
        </>}</section></div>}
      {employeeDraft && <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-4"><form onSubmit={(event) => void submitEmployeeDraft(event)} className="w-full max-w-lg space-y-4 rounded-xl border border-border bg-card p-5 shadow-xl"><header><h3 className="text-lg font-semibold">Create employee record</h3><p className="mt-1 text-sm text-muted-foreground">Confirm the details for {employeeDraft.name} before creating the employee profile.</p></header><label className="block text-xs font-medium">Position<input value={employeeDraft.position} onChange={(event) => setEmployeeDraft({ ...employeeDraft, position: event.target.value })} required className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm" /></label><label className="block text-xs font-medium">Employment type<select value={employeeDraft.employmentType} onChange={(event) => setEmployeeDraft({ ...employeeDraft, employmentType: event.target.value })} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="FULL_TIME">Full time</option><option value="PART_TIME">Part time</option></select></label><label className="block text-xs font-medium">Department<select value={employeeDraft.departmentId} onChange={(event) => setEmployeeDraft({ ...employeeDraft, departmentId: event.target.value })} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">No department</option>{draftDepartments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}</select></label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={employeeDraft.isTeaching} onChange={(event) => setEmployeeDraft({ ...employeeDraft, isTeaching: event.target.checked })} />Teaching position</label><p className="text-xs text-muted-foreground">User ID: {employeeDraft.userId}</p><div className="flex justify-end gap-2"><button type="button" onClick={() => { setEmployeeDraft(null); setSearchParams({}, { replace: true }); }} className="rounded-md border px-3 py-2 text-sm">Cancel</button><button className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground">Create employee</button></div></form></div>}          </div>
  );
}
