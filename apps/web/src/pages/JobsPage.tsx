import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { BriefcaseBusiness, Search, X } from 'lucide-react';
import { UserRole } from '@ats/shared-types';
import { api } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/getApiErrorMessage';
import { useAuthStore } from '@/stores/authStore';

type Job = { id: string; title: string; status: 'OPEN' | 'CLOSED'; description?: string | null; employmentType: string; hiringRequestId: string; createdAt: string; salaryMin?:number|null; salaryMax?:number|null; hiringRequest?: {isTeaching:boolean; department?:{id:string;name:string}; campus?:{id:number;name:string;location?:string|null}} };
type FilterDepartment = { id: string; name: string };
type FilterCampus = { id: number; name: string };

export function JobsPage() {
  const user = useAuthStore((state) => state.user);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('OPEN');
  const [error, setError] = useState('');
  const [cvReady, setCvReady] = useState(false);
  const [isTeaching, setIsTeaching] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [campusId, setCampusId] = useState('');
  const [departments, setDepartments] = useState<FilterDepartment[]>([]);
  const [campuses, setCampuses] = useState<FilterCampus[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const [jobToApply, setJobToApply] = useState<Job | null>(null);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [jobToClose, setJobToClose] = useState<Job | null>(null);
  const [closingJob, setClosingJob] = useState(false);
  const [applying, setApplying] = useState(false);
  const canManage = user?.role === UserRole.Admin || user?.role === UserRole.Hr;

  const load = useCallback(async () => {
    setError('');
    try {
      const { data } = await api.get<{ jobPosts: Job[] }>('/job-posts', { params: { ...(search.trim() ? { search: search.trim() } : {}), ...(status ? { status } : {}), ...(isTeaching ? { isTeaching } : {}), ...(departmentId ? { departmentId } : {}), ...(campusId ? { campusId } : {}), page: 1, limit: 100 } });
      setJobs(data.jobPosts);
    } catch (requestError) { setError(getApiErrorMessage(requestError, 'Could not load job openings.')); }
  }, [search, status, isTeaching, departmentId, campusId]);
  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (!canManage) return;
    void Promise.all([
      api.get<{ departments: FilterDepartment[] }>('/departments', { params: { page: 1, limit: 100 } }),
      api.get<{ campuses: FilterCampus[] }>('/campuses'),
    ]).then(([departmentResponse, campusResponse]) => {
      setDepartments(departmentResponse.data.departments);
      setCampuses(campusResponse.data.campuses);
    }).catch(() => setError('Could not load job filters.'));
  }, [canManage]);

  useEffect(() => {
    if (user?.role !== UserRole.Applicant) return;
    void api.get('/cvs/me/download').then(() => setCvReady(true)).catch(() => setCvReady(false));
    void api.get<{ applications: { jobPostId: string }[] }>('/applications/me', { params: { page: 1, limit: 100 } })
      .then(({ data }) => setAppliedJobIds(data.applications.map(({ jobPostId }) => jobPostId))).catch(() => setAppliedJobIds([]));
  }, [user?.role]);

  async function apply() {
    if (!jobToApply) return;
    setApplying(true);
    setError('');
    try {
      await api.post('/applications', { jobPostId: jobToApply.id });
      setAppliedJobIds((ids) => [...ids, jobToApply.id]);
      setJobToApply(null);
    } catch (requestError) { setError(getApiErrorMessage(requestError, 'Could not submit your application.')); }
    finally { setApplying(false); }
  }
  async function toggleStatus(job: Job) {
    if (job.status === 'OPEN') { setJobToClose(job); return; }
    try { await api.patch(`/job-posts/${job.id}/status`, { status: 'OPEN' }); await load(); }
    catch (requestError) { setError(getApiErrorMessage(requestError, 'Could not update the job status.')); }
  }
  async function closeJob() {
    if (!jobToClose) return;
    setClosingJob(true);
    try { await api.patch(`/job-posts/${jobToClose.id}/status`, { status: 'CLOSED' }); setJobToClose(null); await load(); }
    catch (requestError) { setError(getApiErrorMessage(requestError, 'Could not close the job post.')); }
    finally { setClosingJob(false); }
  }
  function edit(job: Job) { setEditingJob(job); }
  async function remove(job: Job) {
    if (!window.confirm(`Delete “${job.title}”?`)) return;
    try { await api.delete(`/job-posts/${job.id}`); await load(); }
    catch (requestError) { setError(getApiErrorMessage(requestError, 'Could not delete the job post.')); }
  }

  return <div className="space-y-6">
    <header><h2 className="text-xl font-semibold">Job openings</h2><p className="mt-1 text-sm text-muted-foreground">{user?.role === UserRole.Applicant ? 'Explore open positions and apply.' : 'Browse and manage published job posts.'}</p></header>
    {user?.role === UserRole.Applicant && <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"><div><p className="text-sm font-medium">Applications require a CV</p><p className="mt-1 text-xs text-muted-foreground">{cvReady ? 'Your CV is ready to use.' : 'Upload a PDF CV before applying.'}</p></div><Link to="/a/cv" className="rounded-md border border-input px-3 py-2 text-sm hover:bg-accent">Manage my CV</Link></section>}
    {error && !jobToApply && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>}
        <section className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-card p-4 shadow-sm sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-center lg:gap-3">
      <label className="relative w-full min-w-0 lg:min-w-48 lg:flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search job titles" className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm" /></label>
      {canManage && <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by job status" className="h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 filter-select text-sm lg:w-auto"><option value="">All statuses</option><option value="OPEN">Open</option><option value="CLOSED">Closed</option></select>}
      <select value={isTeaching} onChange={(event) => setIsTeaching(event.target.value)} aria-label="Filter by position type" className="h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 filter-select text-sm lg:w-auto"><option value="">All position types</option><option value="true">Teaching</option><option value="false">Non-teaching</option></select>
      {canManage && <select value={departmentId} onChange={(event) => setDepartmentId(event.target.value)} aria-label="Filter by department" className="h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 filter-select text-sm lg:w-auto"><option value="">All departments</option>{departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}</select>}
      {canManage && <select value={campusId} onChange={(event) => setCampusId(event.target.value)} aria-label="Filter by campus" className="h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 filter-select text-sm lg:w-auto"><option value="">All campuses</option>{campuses.map((campus) => <option key={campus.id} value={campus.id}>{campus.name}</option>)}</select>}
    </section>
    <section className="space-y-3"><div className="flex items-center gap-2"><BriefcaseBusiness className="size-4 text-primary" /><h3 className="font-semibold">Published positions <span className="text-sm font-normal text-muted-foreground">({jobs.length})</span></h3></div>{jobs.length === 0 ? <p className="rounded-xl border border-dashed border-border bg-card px-5 py-8 text-center text-sm text-muted-foreground">No job openings match this filter.</p> : jobs.map((job) => <article key={job.id} className="rounded-xl border border-border bg-card p-5 shadow-sm"><div className="flex flex-wrap justify-between gap-4"><div className="min-w-0"><h4 className="font-semibold">{job.title}</h4><p className="mt-1 text-xs text-muted-foreground">{job.hiringRequest?.department?.name ?? 'Department'} · {job.employmentType.replaceAll('_', ' ')} · {job.hiringRequest?.isTeaching ? 'Teaching' : 'Non-teaching'} · {job.hiringRequest?.campus?.name ?? 'Campus'} · Posted {new Date(job.createdAt).toLocaleDateString()}</p>{(job.salaryMin != null || job.salaryMax != null) && <p className="mt-1 text-xs text-muted-foreground">Salary: {job.salaryMin ?? '—'} – {job.salaryMax ?? '—'}</p>}{job.description && <p className="mt-3 max-w-3xl whitespace-pre-line text-sm text-muted-foreground">{job.description}</p>}</div><div className="flex items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${job.status === 'OPEN' ? 'bg-emerald-500/10 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>{job.status}</span>{user?.role === UserRole.Applicant && job.status === 'OPEN' && <button disabled={appliedJobIds.includes(job.id)} onClick={() => cvReady ? setJobToApply(job) : window.location.assign('/a/cv')} className="rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground disabled:opacity-50">{appliedJobIds.includes(job.id) ? 'Applied' : cvReady ? 'Apply now' : 'Upload CV first'}</button>}{canManage && <><button onClick={() => void edit(job)} className="rounded-md border border-input px-3 py-2 text-xs hover:bg-accent">Edit</button><button onClick={() => void toggleStatus(job)} className={`rounded-md border px-3 py-2 text-xs ${job.status === 'OPEN' ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200 dark:hover:bg-amber-950/70' : 'border-input hover:bg-accent'}`}>{job.status === 'OPEN' ? 'Close job' : 'Reopen'}</button>{user?.role === UserRole.Admin && <button onClick={() => void remove(job)} className="rounded-md border border-input px-3 py-2 text-xs text-destructive hover:bg-destructive/10">Delete</button>}</>}</div></div></article>)}</section>
    {jobToApply && <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !applying) setJobToApply(null); }}><section role="dialog" aria-modal="true" aria-labelledby="apply-dialog-title" className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl"><h2 id="apply-dialog-title" className="text-lg font-semibold">Submit your application?</h2><p className="mt-2 text-sm text-muted-foreground">You’re applying for <span className="font-medium text-foreground">{jobToApply.title}</span>{jobToApply.hiringRequest?.department?.name ? ` in ${jobToApply.hiringRequest.department.name}` : ''}. Your current CV will be attached.</p><p className="mt-2 text-sm text-muted-foreground">After submission, you can track its status from My applications.</p>{error && <p role="alert" className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</p>}<div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" disabled={applying} onClick={() => { setJobToApply(null); setError(''); }} className="rounded-md border border-input px-4 py-2 text-sm hover:bg-accent disabled:opacity-50">Cancel</button><button type="button" disabled={applying} onClick={() => void apply()} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">{applying ? 'Submitting…' : 'Confirm application'}</button></div></section></div>}
    {jobToClose && <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4"><section role="alertdialog" aria-modal="true" aria-labelledby="close-job-title" aria-describedby="close-job-description" className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl"><h2 id="close-job-title" className="text-lg font-semibold">Close this job post?</h2><p id="close-job-description" className="mt-2 text-sm text-muted-foreground">Applicants will no longer be able to apply to <span className="font-medium text-foreground">{jobToClose.title}</span> while it is closed. You can reopen it later.</p><div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" disabled={closingJob} onClick={() => setJobToClose(null)} className="rounded-md border border-input px-4 py-2 text-sm">Keep open</button><button type="button" disabled={closingJob} onClick={() => void closeJob()} className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50">{closingJob ? "Closing…" : "Close job post"}</button></div></section></div>}
    {editingJob && <JobEditDialog job={editingJob} onClose={() => setEditingJob(null)} onSaved={() => { setEditingJob(null); void load(); }} />}
  </div>;
}

function JobEditDialog({ job, onClose, onSaved }: { job: Job; onClose: () => void; onSaved: () => void }) {
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const initialValues = useRef<string | null>(null);
  const getSnapshot = () => {
    const form = formRef.current;
    if (!form) return '';
    return JSON.stringify(Array.from(form.elements).filter((element): element is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement => 'value' in element).map((element) => [element.name, element.type === 'checkbox' || element.type === 'radio' ? (element as HTMLInputElement).checked : element.value]));
  };
  useEffect(() => { initialValues.current = getSnapshot(); }, []);
  const requestClose = () => {
    if (saving) return;
    if (getSnapshot() === initialValues.current) onClose();
    else setConfirmClose(true);
  };

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const salaryMinText = String(form.get('salaryMin') ?? '').trim();
    const salaryMaxText = String(form.get('salaryMax') ?? '').trim();
    const salaryMin = salaryMinText ? Number(salaryMinText) : null;
    const salaryMax = salaryMaxText ? Number(salaryMaxText) : null;
    if (salaryMin !== null && salaryMax !== null && salaryMin > salaryMax) {
      setError('Minimum salary cannot be higher than maximum salary.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.patch(`/job-posts/${job.id}`, {
        title: String(form.get('title')).trim(),
        description: String(form.get('description') ?? '').trim() || null,
        employmentType: String(form.get('employmentType')),
        salaryMin,
        salaryMax,
      });
      onSaved();
    } catch (requestError) { setError(getApiErrorMessage(requestError, 'Could not update the job post.')); }
    finally { setSaving(false); }
  }

  return <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4"><form ref={formRef} onSubmit={submit} className="w-full max-w-2xl space-y-4 rounded-xl border border-border bg-card p-5 shadow-xl sm:p-6"><div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-semibold">Edit published job</h2><p className="mt-1 text-sm text-muted-foreground">Update the details applicants will see.</p></div><button type="button" aria-label="Close" onClick={requestClose} className="rounded-md px-2 py-1 text-muted-foreground hover:bg-muted"><X className="size-4" /></button></div><div className="grid gap-4 sm:grid-cols-2"><label className="space-y-1 text-sm font-medium sm:col-span-2">Job title<input name="title" required defaultValue={job.title} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-normal" /></label><label className="space-y-1 text-sm font-medium">Employment type<select name="employmentType" defaultValue={job.employmentType} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-normal"><option value="FULL_TIME">Full time</option><option value="PART_TIME">Part time</option><option value="BOTH AVAILABLE">Both available</option></select></label><div className="grid grid-cols-2 gap-3"><label className="space-y-1 text-sm font-medium">Minimum salary<input name="salaryMin" type="number" min="0" step="1" defaultValue={job.salaryMin ?? ''} placeholder="Optional" className="number-input-no-spinner mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-normal" /></label><label className="space-y-1 text-sm font-medium">Maximum salary<input name="salaryMax" type="number" min="0" step="1" defaultValue={job.salaryMax ?? ''} placeholder="Optional" className="number-input-no-spinner mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-normal" /></label></div><label className="space-y-1 text-sm font-medium sm:col-span-2">Description<textarea name="description" rows={7} defaultValue={job.description ?? ''} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-normal" /></label></div>{error && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</p>}<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" disabled={saving} onClick={requestClose} className="rounded-md border border-input px-4 py-2 text-sm">Cancel</button><button disabled={saving} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">{saving ? 'Saving…' : 'Save changes'}</button></div></form>{confirmClose && <div className="fixed inset-0 z-[60] grid place-items-center bg-foreground/50 p-4"><section role="alertdialog" aria-modal="true" aria-labelledby="job-edit-close-title" className="w-full max-w-sm rounded-xl border border-border bg-card p-5 shadow-xl"><h3 id="job-edit-close-title" className="font-semibold">Close the edit dialog?</h3><p className="mt-2 text-sm text-muted-foreground">Any unsaved changes to this job post will be discarded.</p><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setConfirmClose(false)} className="rounded-md border border-input px-3 py-2 text-sm">Keep editing</button><button type="button" onClick={onClose} className="rounded-md bg-[#c90000] px-3 py-2 text-sm font-medium text-white hover:bg-[#b50000]">Discard and close</button></div></section></div>}</div>;
}
