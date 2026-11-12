import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import { Plus, Search } from 'lucide-react';
import { UserRole } from '@ats/shared-types';
import { api } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/getApiErrorMessage';
import { useAuthStore } from '@/stores/authStore';
import { RichTextJsonEditor, type RichTextDocument } from '@/components/RichTextJsonEditor';

export type HiringRequest = { id: string; position: string; status: string; departmentId: string; campusId: number; employmentType: 'FULL_TIME' | 'PART_TIME'; isTeaching: boolean; requirements?: RichTextDocument };
type Department = { id: string; name: string };
export type Campus = { id: number; name: string; location: string };
type Job = { id: string; title: string; hiringRequestId: string };

export function HiringRequestsPage() {
  const role = useAuthStore((state) => state.user?.role);
  const navigate = useNavigate();
  const userId = useAuthStore((state) => state.user?.id);
  const canCreate = role === UserRole.Admin || role === UserRole.Hr || role === UserRole.Dean || role === UserRole.DepartmentHead;
  const canTransition = role === UserRole.Admin || role === UserRole.Hr || role === UserRole.Dean;
  const canSubmit = canTransition || role === UserRole.DepartmentHead;
  const canPublish = role === UserRole.Admin || role === UserRole.Hr;
  const [requests, setRequests] = useState<HiringRequest[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [jobsByRequest, setJobsByRequest] = useState<Record<string, Job>>({});
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [requestDepartmentId, setRequestDepartmentId] = useState('');
  const [requestCampusId, setRequestCampusId] = useState('');
  const [requestEmploymentType, setRequestEmploymentType] = useState('');
  const [requestIsTeaching, setRequestIsTeaching] = useState('');
  const [creating, setCreating] = useState(false);
  const [publishing, setPublishing] = useState<HiringRequest | null>(null);
  const [editing, setEditing] = useState<HiringRequest | null>(null);
  const [pendingAction, setPendingAction] = useState<{ request: HiringRequest; status: string } | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      let departmentId: string | undefined;
      let headEmployeeId: string | undefined;
      if (role === UserRole.DepartmentHead && userId) {
        const { data: employeeData } = await api.get<{ employees: { id: string }[] }>('/employees', { params: { userId, page: 1, limit: 1 } });
        const employeeId = employeeData.employees?.[0]?.id;
        if (!employeeId) throw new Error('Your account has no employee record. Ask HR to complete your employee profile.');
        headEmployeeId = employeeId;
        const { data: owned } = await api.get<{ departments: Department[] }>('/departments', { params: { departmentHeadId: employeeId, page: 1, limit: 10 } });
        if (!owned.departments?.[0]) throw new Error('No department is assigned to your account. Ask an administrator to assign your department.');
        departmentId = owned.departments[0].id;
      }
      const [requestResponse, departmentResponse, jobResponse, campusResponse] = await Promise.all([
        api.get<{ hiringRequests: HiringRequest[] }>('/hiring-requests', { params: { page: 1, limit: 100, ...(departmentId ? { departmentId } : requestDepartmentId ? { departmentId: requestDepartmentId } : {}), ...(requestCampusId ? { campusId: Number(requestCampusId) } : {}), ...(requestEmploymentType ? { employmentType: requestEmploymentType } : {}), ...(requestIsTeaching ? { isTeaching: requestIsTeaching } : {}), ...(status ? { status } : {}), ...(search.trim() ? { search: search.trim() } : {}) } }),
        api.get<{ departments: Department[] }>('/departments', { params: { page: 1, limit: 100, ...(headEmployeeId ? { departmentHeadId: headEmployeeId } : {}) } }),
        api.get<{ jobPosts: Job[] }>('/job-posts', { params: { page: 1, limit: 100 } }),
        api.get<{ campuses: Campus[] }>('/campuses'),
      ]);
      setRequests(requestResponse.data.hiringRequests);
      setDepartments(departmentResponse.data.departments);
      setCampuses(campusResponse.data.campuses);
      setJobsByRequest(Object.fromEntries(jobResponse.data.jobPosts.map((job) => [job.hiringRequestId, job])));
    } catch (requestError) {
      setError(requestError instanceof Error && !(requestError instanceof TypeError)
        ? requestError.message
        : getApiErrorMessage(requestError, 'Could not load hiring requests.'));
    }
  }, [search, status, role, userId, requestDepartmentId, requestCampusId, requestEmploymentType, requestIsTeaching]);
  useEffect(() => { void load(); }, [load]);

  async function changeStatus(request: HiringRequest, nextStatus: string) {
    setTransitioning(true);
    try { await api.patch(`/hiring-requests/${request.id}/status`, { status: nextStatus }); setPendingAction(null); await load(); }
    catch (requestError) { setError(getApiErrorMessage(requestError, 'Could not update this hiring request.')); }
    finally { setTransitioning(false); }
  }
  return <div className="space-y-5">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-xl font-semibold">Hiring requests</h2><p className="mt-1 text-sm text-muted-foreground">Request a position, review its approval, and publish the approved opening.</p></div>{canCreate && <button onClick={() => setCreating(true)} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"><Plus className="size-4" />New request</button>}</header>
    {error && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>}
        <section className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-center lg:gap-3">
      <label className="relative w-full min-w-0 lg:min-w-48 lg:flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search position or department" className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm" /></label>
      <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by request status" className="h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 filter-select text-sm lg:w-auto"><option value="">All statuses</option>{['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'FULFILLED', 'CANCELLED'].map((value) => <option key={value}>{value}</option>)}</select>
      {role !== UserRole.DepartmentHead && <select value={requestDepartmentId} onChange={(event) => setRequestDepartmentId(event.target.value)} aria-label="Filter by department" className="h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 filter-select text-sm lg:w-auto"><option value="">All departments</option>{departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}</select>}
      <select value={requestCampusId} onChange={(event) => setRequestCampusId(event.target.value)} aria-label="Filter by campus" className="h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 filter-select text-sm lg:w-auto"><option value="">All campuses</option>{campuses.map((campus) => <option key={campus.id} value={campus.id}>{campus.name}</option>)}</select>
      <select value={requestEmploymentType} onChange={(event) => setRequestEmploymentType(event.target.value)} aria-label="Filter by employment type" className="h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 filter-select text-sm lg:w-auto"><option value="">All employment types</option><option value="FULL_TIME">Full time</option><option value="PART_TIME">Part time</option></select>
      <select value={requestIsTeaching} onChange={(event) => setRequestIsTeaching(event.target.value)} aria-label="Filter by position type" className="h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 filter-select text-sm lg:w-auto"><option value="">Teaching and non-teaching</option><option value="true">Teaching</option><option value="false">Non-teaching</option></select>
    </section>
    {requests.length === 0 ? <p className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">No hiring requests match these filters.</p> : <section className="space-y-3">{requests.map((request) => {
      const department = departments.find((item) => item.id === request.departmentId);
      const job = jobsByRequest[request.id];
      const detailPath = role === UserRole.DepartmentHead ? `/d/requests/${request.id}` : `/h/hiring-requests/${request.id}`;
      return <article key={request.id} role="link" tabIndex={0} aria-label={`View ${request.position} hiring request details`} onClick={(event) => { if (event.target instanceof Element && event.target.closest("button, a")) return; navigate(detailPath); }} onKeyDown={(event) => { if ((event.key === "Enter" || event.key === " ") && event.target === event.currentTarget) { event.preventDefault(); navigate(detailPath); } }} className="cursor-pointer rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/40 hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><div className="flex flex-wrap items-start justify-between gap-4"><div><h3 className="font-semibold">{request.position}</h3><p className="mt-1 text-sm text-muted-foreground">{department?.name ?? 'Department'} · {request.employmentType.replaceAll('_', ' ')} · {request.isTeaching ? 'Teaching' : 'Non-teaching'} · {campuses.find((campus) => campus.id === request.campusId)?.name ?? `Campus ${request.campusId}`}</p><div className="mt-3 flex flex-wrap items-center gap-2"><span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">{request.status.replaceAll('_', ' ')}</span>{job ? <Link to="/h/job-posts" className="text-xs font-medium text-primary hover:underline">Published as {job.title} →</Link> : request.status === 'APPROVED' && <span className="text-xs text-muted-foreground">Approved; ready to publish</span>}</div></div><div className="flex flex-wrap gap-2">{request.status === 'DRAFT' && canSubmit && <><button onClick={() => setEditing(request)} className="rounded-md border border-input px-3 py-2 text-xs hover:bg-accent">Edit draft</button><button onClick={() => setPendingAction({ request, status: 'PENDING' })} className="rounded-md border border-input px-3 py-2 text-xs hover:bg-accent">Submit for Dean review</button></>}{request.status === 'PENDING' && canTransition && <><button onClick={() => setPendingAction({ request, status: 'APPROVED' })} className="rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground">Approve</button><button onClick={() => setPendingAction({ request, status: 'REJECTED' })} className="rounded-md border border-input px-3 py-2 text-xs text-destructive">Reject</button></>}{request.status === 'PENDING' && role === UserRole.DepartmentHead && <button onClick={() => setPendingAction({ request, status: 'CANCELLED' })} className="rounded-md border border-input px-3 py-2 text-xs">Cancel request</button>}{request.status === 'APPROVED' && !job && canPublish && <button onClick={() => setPublishing(request)} className="rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground">Publish job</button>}</div></div></article>;
    })}</section>}
    {pendingAction && <ConfirmActionDialog request={pendingAction.request} status={pendingAction.status} busy={transitioning} onCancel={() => setPendingAction(null)} onConfirm={() => void changeStatus(pendingAction.request, pendingAction.status)} />}
    {creating && <RequestDialog departments={departments} campuses={campuses} onClose={() => setCreating(false)} onSaved={() => { setCreating(false); void load(); }} />}
    {editing && <EditRequestDialog request={editing} campuses={campuses} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); void load(); }} />}
    {publishing && <PublishDialog request={publishing} onClose={() => setPublishing(null)} onSaved={() => { setPublishing(null); void load(); }} />}
  </div>;
}

export function ConfirmActionDialog({ request, status, busy, onCancel, onConfirm }: { request: HiringRequest; status: string; busy: boolean; onCancel: () => void; onConfirm: () => void }) {
  const details: Record<string, { title: string; description: string; action: string; destructive?: boolean }> = {
    PENDING: { title: 'Submit this request for review?', description: `${request.position} will be sent to the Dean for review.`, action: 'Submit request' },
    APPROVED: { title: 'Approve this hiring request?', description: `${request.position} will be approved and can be published as a job opening.`, action: 'Approve request' },
    REJECTED: { title: 'Reject this hiring request?', description: `${request.position} will be marked as rejected.`, action: 'Reject request', destructive: true },
    CANCELLED: { title: 'Cancel this hiring request?', description: `${request.position} will be cancelled.`, action: 'Cancel request', destructive: true },
  };
  const content = details[status];
  return <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onCancel(); }}><section role="alertdialog" aria-modal="true" aria-labelledby="request-confirm-title" aria-describedby="request-confirm-description" className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl"><h2 id="request-confirm-title" className="text-lg font-semibold">{content.title}</h2><p id="request-confirm-description" className="mt-2 text-sm text-muted-foreground">{content.description} Please confirm that this is the action you want.</p><div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" disabled={busy} onClick={onCancel} className="rounded-md border border-input px-4 py-2 text-sm hover:bg-accent disabled:opacity-50">Go back</button><button type="button" disabled={busy} onClick={onConfirm} className={`rounded-md px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50 ${content.destructive ? 'bg-destructive' : 'bg-primary'}`}>{busy ? 'Saving…' : content.action}</button></div></section></div>;
}

function RequestDialog({ departments, campuses, onClose, onSaved }: { departments: Department[]; campuses: Campus[]; onClose: () => void; onSaved: () => void }) {
  const [error, setError] = useState(''); const [saving, setSaving] = useState(false);
  const [requirements, setRequirements] = useState<RichTextDocument>({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }] });
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError(''); const form = new FormData(event.currentTarget);
    try { await api.post('/hiring-requests', { position: String(form.get('position')), employmentType: String(form.get('employmentType')), isTeaching: form.get('isTeaching') === 'true', departmentId: String(form.get('departmentId')), campusId: Number(form.get('campusId')), requirements }); onSaved(); }
    catch (requestError) { setError(getApiErrorMessage(requestError, 'Could not create the hiring request.')); } finally { setSaving(false); }
  }
  return <FormDialog title="Create hiring request" onClose={onClose} onSubmit={submit} error={error} saving={saving} submitLabel="Create request"><label className="space-y-1 text-xs font-medium">Position<input name="position" required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" /></label><label className="space-y-1 text-xs font-medium">Department<select name="departmentId" required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">{departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}</select></label><label className="space-y-1 text-xs font-medium">Employment type<select name="employmentType" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="FULL_TIME">Full time</option><option value="PART_TIME">Part time</option></select></label><label className="space-y-1 text-xs font-medium">Campus<select name="campusId" required defaultValue="" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="" disabled>Select a campus</option>{campuses.map((campus) => <option key={campus.id} value={campus.id}>{campus.name}{campus.location ? ` - ${campus.location}` : ''}</option>)}</select></label><label className="space-y-1 text-xs font-medium">Position type<select name="isTeaching" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="false">Non-teaching</option><option value="true">Teaching</option></select></label><div className="space-y-2 sm:col-span-2"><div><p className="text-xs font-medium">Requirements</p><p className="mt-1 text-xs text-muted-foreground">Add qualifications, skills, and experience for this position.</p></div><RichTextJsonEditor onChange={setRequirements} /></div></FormDialog>;
}

export function EditRequestDialog({ request, campuses, onClose, onSaved }: { request: HiringRequest; campuses: Campus[]; onClose: () => void; onSaved: () => void }) {
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [requirements, setRequirements] = useState<RichTextDocument>(request.requirements && Array.isArray(request.requirements.content) ? request.requirements : { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }] });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    const form = new FormData(event.currentTarget);
    try {
      await api.patch(`/hiring-requests/${request.id}`, {
        position: String(form.get('position')),
        employmentType: String(form.get('employmentType')),
        isTeaching: form.get('isTeaching') === 'true',
        campusId: Number(form.get('campusId')),
        requirements,
      });
      onSaved();
    } catch (requestError) { setError(getApiErrorMessage(requestError, 'Could not update this draft request.')); }
    finally { setSaving(false); }
  }

  return <FormDialog title="Edit hiring request" onClose={onClose} onSubmit={submit} error={error} saving={saving} submitLabel="Save changes"><label className="space-y-1 text-xs font-medium">Position<input name="position" defaultValue={request.position} required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" /></label><label className="space-y-1 text-xs font-medium">Employment type<select name="employmentType" defaultValue={request.employmentType} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="FULL_TIME">Full time</option><option value="PART_TIME">Part time</option></select></label><label className="space-y-1 text-xs font-medium">Campus<select name="campusId" defaultValue={String(request.campusId)} required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">{campuses.map((campus) => <option key={campus.id} value={campus.id}>{campus.name}{campus.location ? ` - ${campus.location}` : ''}</option>)}</select></label><label className="space-y-1 text-xs font-medium">Position type<select name="isTeaching" defaultValue={String(request.isTeaching)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="false">Non-teaching</option><option value="true">Teaching</option></select></label><div className="space-y-2 sm:col-span-2"><div><p className="text-xs font-medium">Requirements</p><p className="mt-1 text-xs text-muted-foreground">Edit the qualifications, skills, and experience for this position.</p></div><RichTextJsonEditor initialValue={request.requirements && Array.isArray(request.requirements.content) ? request.requirements : undefined} onChange={setRequirements} /></div></FormDialog>;
}

export function PublishDialog({ request, onClose, onSaved }: { request: HiringRequest; onClose: () => void; onSaved: () => void }) {
  const [error, setError] = useState(''); const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError(''); const form = new FormData(event.currentTarget);
    const salaryMinText = String(form.get('salaryMin') ?? '').trim();
    const salaryMaxText = String(form.get('salaryMax') ?? '').trim();
    const salaryMin = salaryMinText ? Number(salaryMinText) : null;
    const salaryMax = salaryMaxText ? Number(salaryMaxText) : null;
    if (salaryMin !== null && salaryMax !== null && salaryMin > salaryMax) { setError('Minimum salary cannot be higher than maximum salary.'); setSaving(false); return; }
    try { await api.post('/job-posts', { hiringRequestId: request.id, title: String(form.get('title')), description: String(form.get('description')) || null, employmentType: String(form.get('employmentType')), salaryMin, salaryMax }); onSaved(); }
    catch (requestError) { setError(getApiErrorMessage(requestError, 'Could not publish this job.')); } finally { setSaving(false); }
  }
  return <FormDialog title="Publish job opening" onClose={onClose} onSubmit={submit} error={error} saving={saving} submitLabel="Publish"><label className="space-y-1 text-xs font-medium sm:col-span-2">Title<input name="title" defaultValue={request.position} required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" /></label><label className="space-y-1 text-xs font-medium">Employment type<select name="employmentType" defaultValue={request.employmentType} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="FULL_TIME">Full time</option><option value="PART_TIME">Part time</option><option value="BOTH AVAILABLE">Both available</option></select></label><div className="grid grid-cols-2 gap-3"><label className="space-y-1 text-xs font-medium">Minimum salary<input name="salaryMin" type="number" min="0" step="1" placeholder="Optional" className="number-input-no-spinner h-10 w-full rounded-md border border-input bg-background px-3 text-sm" /></label><label className="space-y-1 text-xs font-medium">Maximum salary<input name="salaryMax" type="number" min="0" step="1" placeholder="Optional" className="number-input-no-spinner h-10 w-full rounded-md border border-input bg-background px-3 text-sm" /></label></div><label className="space-y-1 text-xs font-medium sm:col-span-2">Description<textarea name="description" rows={5} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" /></label></FormDialog>;
}

function FormDialog({ title, onClose, onSubmit, error, saving, submitLabel, children }: { title: string; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; error: string; saving: boolean; submitLabel: string; children: ReactNode }) {
  const [confirmClose, setConfirmClose] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const initialValues = useRef<string | null>(null);
  const getSnapshot = () => {
    const form = formRef.current;
    if (!form) return '';
    return JSON.stringify({
      fields: Array.from(form.elements).filter((element): element is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement => 'value' in element).map((element) => [element.name, element.type === 'checkbox' || element.type === 'radio' ? (element as HTMLInputElement).checked : element.value]),
      editors: Array.from(form.querySelectorAll<HTMLElement>('[contenteditable="true"]')).map((editor) => editor.innerHTML),
    });
  };
  useEffect(() => {
    initialValues.current = getSnapshot();
  }, []);
  const requestClose = () => {
    if (saving) return;
    if (getSnapshot() === initialValues.current) onClose();
    else setConfirmClose(true);
  };
  return <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-4"><form ref={formRef} onSubmit={onSubmit} className="relative max-h-[90dvh] w-full max-w-lg space-y-4 overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-xl"><div className="flex justify-between"><h2 className="text-lg font-semibold">{title}</h2><button type="button" onClick={requestClose} aria-label="Close" className="rounded-md px-2 py-1 text-lg font-semibold text-muted-foreground hover:bg-muted">×</button></div><div className="grid gap-4 sm:grid-cols-2">{children}</div>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<div className="flex justify-end gap-2"><button type="button" onClick={requestClose} className="rounded-md border px-4 py-2 text-sm">Cancel</button><button disabled={saving} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">{saving ? 'Saving…' : submitLabel}</button></div>{confirmClose && <div className="fixed inset-0 z-[60] grid place-items-center bg-foreground/40 p-4"><section role="alertdialog" aria-modal="true" aria-labelledby="discard-dialog-title" className="w-full max-w-sm rounded-xl border border-border bg-card p-5 shadow-xl"><h3 id="discard-dialog-title" className="font-semibold">Close this dialog?</h3><p className="mt-2 text-sm text-muted-foreground">Any details you entered here will be discarded.</p><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setConfirmClose(false)} className="rounded-md border border-input px-3 py-2 text-sm">Keep editing</button><button type="button" onClick={onClose} className="rounded-md bg-[#c90000] px-3 py-2 text-sm font-medium text-white hover:bg-[#b50000]">Discard and close</button></div></section></div>}</form></div>;
}
