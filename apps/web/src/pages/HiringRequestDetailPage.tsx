import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, BriefcaseBusiness, Building2, MapPin } from 'lucide-react';
import { UserRole } from '@ats/shared-types';
import { api } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/getApiErrorMessage';
import { useAuthStore } from '@/stores/authStore';
import { ConfirmActionDialog, EditRequestDialog, PublishDialog, type Campus, type HiringRequest } from './HiringRequestsPage';

type Department = { id: string; name: string };
type Job = { id: string; title: string; status: string };

function requirementsToText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return '';
  if ('text' in value && typeof value.text === 'string') return value.text;
  const node = value as { type?: string; content?: unknown[]; children?: unknown[] };
  const children = (Array.isArray(node.content) ? node.content : Array.isArray(node.children) ? node.children : []).map(requirementsToText).filter(Boolean);
  const text = children.join(node.type === 'listItem' || node.type === 'list_item' ? '' : '\n').trim();
  if ((node.type === 'listItem' || node.type === 'list_item') && text) return `- ${text}`;
  return text;
}

export function HiringRequestDetailPage() {
  const { id = '' } = useParams();
  const role = useAuthStore((state) => state.user?.role);
  const [request, setRequest] = useState<HiringRequest | null>(null);
  const [department, setDepartment] = useState<Department | null>(null);
  const [campus, setCampus] = useState<Campus | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [editing, setEditing] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const backPath = role === UserRole.DepartmentHead ? '/d/requests' : '/h/job-posts';
  const canTransition = role === UserRole.Admin || role === UserRole.Hr || role === UserRole.Dean;
  const canPublish = role === UserRole.Admin || role === UserRole.Hr;
  const load = useCallback(async () => {
    setError('');
    try {
      const response = await api.get<{ hiringRequest: HiringRequest }>(`/hiring-requests/${id}`);
      const item = response.data.hiringRequest;
      setRequest(item);
      const [departmentResult, campusResult, jobsResult] = await Promise.allSettled([
        api.get<{ department: Department }>(`/departments/${item.departmentId}`),
        api.get<{ campuses: Campus[] }>('/campuses'),
        api.get<{ jobPosts: (Job & { hiringRequestId: string })[] }>('/job-posts', { params: { page: 1, limit: 100 } }),
      ]);
      if (departmentResult.status === 'fulfilled') setDepartment(departmentResult.value.data.department);
      if (campusResult.status === 'fulfilled') {
        const found = campusResult.value.data.campuses.find((itemCampus) => itemCampus.id === item.campusId) ?? null;
        setCampus(found);
        setCampuses(campusResult.value.data.campuses);
      }
      if (jobsResult.status === 'fulfilled') setJob(jobsResult.value.data.jobPosts.find((itemJob) => itemJob.hiringRequestId === item.id) ?? null);
    } catch (requestError) { setError(getApiErrorMessage(requestError, 'Could not load this hiring request.')); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  async function updateStatus(status: string) {
    if (!request) return;
    setTransitioning(true);
    try { await api.patch(`/hiring-requests/${request.id}/status`, { status }); setPendingStatus(null); await load(); }
    catch (requestError) { setError(getApiErrorMessage(requestError, 'Could not update this hiring request.')); }
    finally { setTransitioning(false); }
  }

  const textRequirements = requirementsToText(request?.requirements).trim();
  if (loading) return <p className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">Loading hiring request…</p>;
  if (!request) return <div className="space-y-4"><Link to={backPath} className="inline-flex items-center gap-2 text-sm text-primary hover:underline"><ArrowLeft className="size-4" />Back to hiring requests</Link>{error && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>}</div>;

  return <div className="space-y-5">
    <Link to={backPath} className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Back to hiring requests</Link>
    {error && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>}
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">{request.status.replaceAll('_', ' ')}</span><h1 className="mt-3 text-2xl font-semibold tracking-tight">{request.position}</h1><p className="mt-2 text-sm text-muted-foreground">{request.employmentType.replaceAll('_', ' ')} · {request.isTeaching ? 'Teaching position' : 'Non-teaching position'}</p></div>
        <div className="flex flex-wrap gap-2">
          {request.status === 'DRAFT' && role !== UserRole.Employee && role !== UserRole.Applicant && <><button onClick={() => setEditing(true)} className="rounded-md border border-input px-3 py-2 text-sm hover:bg-accent">Edit draft</button><button onClick={() => setPendingStatus('PENDING')} className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">Submit for review</button></>}
          {request.status === 'PENDING' && canTransition && <><button onClick={() => setPendingStatus('APPROVED')} className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">Approve</button><button onClick={() => setPendingStatus('REJECTED')} className="rounded-md border border-destructive/40 px-3 py-2 text-sm text-destructive hover:bg-destructive/5">Reject</button></>}
          {request.status === 'PENDING' && role === UserRole.DepartmentHead && <button onClick={() => setPendingStatus('CANCELLED')} className="rounded-md border border-input px-3 py-2 text-sm hover:bg-accent">Cancel request</button>}
          {request.status === 'APPROVED' && !job && canPublish && <button onClick={() => setPublishing(true)} className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"><BriefcaseBusiness className="size-4" />Publish job</button>}
        </div>
      </div>
    </section>

    <section className="grid gap-4 sm:grid-cols-2">
      <article className="rounded-xl border border-border bg-card p-5"><div className="flex items-center gap-2 text-sm font-semibold"><Building2 className="size-4 text-primary" />Department</div><p className="mt-3 font-medium">{department?.name ?? 'Department'}</p><p className="mt-1 text-xs text-muted-foreground">Department ID: {request.departmentId}</p></article>
      <article className="rounded-xl border border-border bg-card p-5"><div className="flex items-center gap-2 text-sm font-semibold"><MapPin className="size-4 text-primary" />Campus</div><p className="mt-3 font-medium">{campus?.name ?? `Campus ${request.campusId}`}</p>{campus?.location && <p className="mt-1 text-sm text-muted-foreground">{campus.location}</p>}</article>
    </section>

    <section className="rounded-xl border border-border bg-card p-5 sm:p-7"><h2 className="text-lg font-semibold">Position requirements</h2>{textRequirements ? <div className="mt-4 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{textRequirements}</div> : <p className="mt-3 text-sm text-muted-foreground">No requirements were added to this request.</p>}</section>
    <section className="rounded-xl border border-border bg-card p-5 sm:p-7"><h2 className="text-lg font-semibold">Published job</h2>{job ? <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><div><p className="font-medium">{job.title}</p><p className="mt-1 text-sm text-muted-foreground">{job.status}</p></div><Link to="/h/job-posts" className="text-sm font-medium text-primary hover:underline">View published posts</Link></div> : <p className="mt-3 text-sm text-muted-foreground">This request has not been published as a job opening.</p>}</section>

    {pendingStatus && <ConfirmActionDialog request={request} status={pendingStatus} busy={transitioning} onCancel={() => setPendingStatus(null)} onConfirm={() => void updateStatus(pendingStatus)} />}
    {editing && <EditRequestDialog request={request} campuses={campuses} onClose={() => setEditing(false)} onSaved={() => { setEditing(false); void load(); }} />}
    {publishing && <PublishDialog request={request} onClose={() => setPublishing(false)} onSaved={() => { setPublishing(false); void load(); }} />}
  </div>;
}
