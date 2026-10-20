import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router';
import { CalendarPlus, Search } from 'lucide-react';
import { UserRole } from '@ats/shared-types';
import { api } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/getApiErrorMessage';
import { useAuthStore } from '@/stores/authStore';

type Interview = { id: string; applicantId: string; stage: string; date: string; durationMinutes: number; type: string; status: string; meetingUrl?: string | null; location?: string | null; instructions?: string | null; interviewer?: { firstName: string; lastName: string } | null; applicant?: { user?: { firstName: string; lastName: string; email: string }; jobPost?: { title: string } } };
type Applicant = { id: string; user?: { firstName: string; lastName: string; email: string }; jobPost?: { title: string } };
type Employee = { user: { id: string; firstName: string; lastName: string; role: string } };
type Criterion = { id: string; name: string; description: string };
type InterviewEvaluation = { id: string; evaluator?: { firstName: string; lastName: string; email: string }; ratings: Record<string, number>; recommendation: string; strengths?: string | null; concerns?: string | null; comments?: string | null; createdAt: string };

const dateLabel = (value: string) => new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Manila' }).format(new Date(value));

export function InterviewsPage() {
  const role = useAuthStore((state) => state.user?.role);
  const isManager = role === UserRole.Admin || role === UserRole.Hr;
  const [params, setParams] = useSearchParams();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [scheduling, setScheduling] = useState(Boolean(params.get('applicantId')));
  const [evaluating, setEvaluating] = useState<Interview | null>(null);
  const [reviewingEvaluations, setReviewingEvaluations] = useState<Interview | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const endpoint = isManager ? '/interviews' : '/interviews/me';
      const { data } = await api.get<{ interviews: Interview[] }>(endpoint, { params: { page: 1, limit: 100, ...(status ? { status } : {}), ...(search.trim() ? { search: search.trim() } : {}) } });
      setInterviews(data.interviews);
    } catch (requestError) { setError(getApiErrorMessage(requestError, 'Could not load interviews.')); }
  }, [isManager, search, status]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (!isManager) return;
    void api.get<{ applications: Applicant[] }>('/applications', { params: { page: 1, limit: 100 } }).then(({ data }) => setApplicants(data.applications)).catch(() => setApplicants([]));
  }, [isManager]);

  async function update(interview: Interview, action: 'cancel' | 'complete') {
    try { await api.patch(`/interviews/${interview.id}/${action}`); await load(); }
    catch (requestError) { setError(getApiErrorMessage(requestError, 'Could not update this interview.')); }
  }
  async function reschedule(interview: Interview) {
    const interviewDate = new Date(interview.date);
    const localDate = new Date(interviewDate.getTime() - interviewDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    const value = window.prompt('New date and time (local Manila time)', localDate); if (!value) return;
    const date = new Date(value);
    if (Number.isNaN(date.getTime()) || date <= new Date()) { setError('Choose a valid future date and time.'); return; }
    try { await api.patch(`/interviews/${interview.id}`, { date: date.toISOString() }); await load(); }
    catch (requestError) { setError(getApiErrorMessage(requestError, 'Could not reschedule this interview.')); }
  }
  function closeSchedule() { setScheduling(false); setParams({}, { replace: true }); }

  return <div className="space-y-5">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-xl font-semibold">Interviews</h2><p className="mt-1 text-sm text-muted-foreground">{isManager ? 'Schedule and manage candidate interviews and evaluations.' : 'Your interview schedule and assigned evaluation tasks.'}</p></div>{isManager && <button onClick={() => setScheduling(true)} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"><CalendarPlus className="size-4" />Schedule interview</button>}</header>
    {error && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>}
    <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row"><label className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search applicant or position" className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm" /></label><select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm sm:w-48"><option value="">All statuses</option>{['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'].map((value) => <option key={value} value={value}>{value.replaceAll('_', ' ')}</option>)}</select></section>
    {interviews.length === 0 ? <p className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">No interviews found.</p> : <section className="space-y-3">{interviews.map((interview) => {
      const name = interview.applicant?.user ? `${interview.applicant.user.firstName} ${interview.applicant.user.lastName}` : 'Applicant';
      return <article key={interview.id} className="rounded-xl border border-border bg-card p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div><h3 className="font-semibold">{name} <span className="font-normal text-muted-foreground"> |  {interview.applicant?.jobPost?.title ?? 'Position'}</span></h3><p className="mt-1 text-sm text-muted-foreground">{interview.stage.replaceAll('_', ' ')}  |  {interview.type}  |  {dateLabel(interview.date)}  |  {interview.durationMinutes} min</p><p className="mt-1 text-xs text-muted-foreground">{interview.interviewer ? `Interviewer: ${interview.interviewer.firstName} ${interview.interviewer.lastName}` : 'Interviewer not assigned'}{interview.location ? `  |  ${interview.location}` : ''}</p>{interview.meetingUrl && <a className="mt-2 inline-block text-xs text-primary hover:underline" href={interview.meetingUrl} target="_blank" rel="noreferrer">Open meeting</a>}{interview.instructions && <p className="mt-2 text-sm">{interview.instructions}</p>}</div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-muted px-2.5 py-1 text-xs">{interview.status.replaceAll('_', ' ')}</span>{isManager && interview.status === 'SCHEDULED' && <><button onClick={() => void reschedule(interview)} className="rounded-md border border-input px-3 py-2 text-xs">Reschedule</button><button onClick={() => void update(interview, 'cancel')} className="rounded-md border border-input px-3 py-2 text-xs">Cancel</button></>}{(role === UserRole.Admin || role === UserRole.Hr || role === UserRole.Employee || role === UserRole.Dean || role === UserRole.DepartmentHead) && interview.status === 'SCHEDULED' && <button onClick={() => void update(interview, 'complete')} className="rounded-md border border-input px-3 py-2 text-xs">Mark complete</button>}{interview.status === 'COMPLETED' && isManager && <button onClick={() => setReviewingEvaluations(interview)} className="rounded-md border border-input px-3 py-2 text-xs hover:bg-accent">View evaluations</button>}{interview.status === 'COMPLETED' && !isManager && role !== UserRole.Applicant && <button onClick={() => setEvaluating(interview)} className="rounded-md border border-input px-3 py-2 text-xs">Submit evaluation</button>}</div></div></article>;
    })}</section>}
    {scheduling && <ScheduleDialog applicants={applicants} initialApplicantId={params.get('applicantId') ?? ''} onClose={closeSchedule} onSaved={() => { closeSchedule(); void load(); }} />}
    {reviewingEvaluations && <EvaluationReviewDialog interview={reviewingEvaluations} onClose={() => setReviewingEvaluations(null)} onAddEvaluation={() => { const interview = reviewingEvaluations; setReviewingEvaluations(null); setEvaluating(interview); }} />}
    {evaluating && <EvaluationDialog interview={evaluating} onClose={() => setEvaluating(null)} />}
  </div>;
}

function ScheduleDialog({ applicants, initialApplicantId, onClose, onSaved }: { applicants: Applicant[]; initialApplicantId: string; onClose: () => void; onSaved: () => void }) {
  const [employees, setEmployees] = useState<Employee[]>([]); const [error, setError] = useState(''); const [saving, setSaving] = useState(false);
  const [selectedApplicantId, setSelectedApplicantId] = useState(initialApplicantId);
  useEffect(() => { if (!applicants.some(({ id }) => id === selectedApplicantId)) setSelectedApplicantId(applicants[0]?.id ?? ''); }, [applicants, selectedApplicantId]);
  useEffect(() => { void api.get<{ employees: Employee[] }>('/employees', { params: { page: 1, limit: 100 } }).then(({ data }) => setEmployees(data.employees)).catch((requestError: unknown) => setError(getApiErrorMessage(requestError, 'Could not load interviewers.'))); }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError(''); const form = new FormData(event.currentTarget); const type = String(form.get('type'));
    try {
      const meetingUrl = String(form.get('meetingUrl')).trim();
      if (type === 'ONLINE' && !meetingUrl) { setError('Enter a meeting URL for an online interview.'); setSaving(false); return; }
      await api.post('/interviews', { applicantId: selectedApplicantId, ...(form.get('interviewerId') ? { interviewerId: String(form.get('interviewerId')) } : {}), stage: String(form.get('stage')), date: new Date(String(form.get('date'))).toISOString(), durationMinutes: Number(form.get('durationMinutes')), timeZone: 'Asia/Manila', type, ...(type === 'ONLINE' ? { meetingUrl, location: String(form.get('location')) || 'Online meeting' } : { location: String(form.get('location')) || null }), instructions: String(form.get('instructions')) || null }); onSaved();
    } catch (requestError) { setError(getApiErrorMessage(requestError, 'Could not schedule this interview.')); } finally { setSaving(false); }
  }
  return <Modal title="Schedule interview" onClose={onClose}><form onSubmit={(event) => void submit(event)} className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-medium sm:col-span-2">Applicant<select name="applicantId" required value={selectedApplicantId} onChange={(event) => setSelectedApplicantId(event.target.value)} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-2 text-sm">{applicants.map((a) => <option key={a.id} value={a.id}>{a.user ? `${a.user.firstName} ${a.user.lastName}  |  ${a.jobPost?.title ?? ''}` : a.id}</option>)}</select></label><label className="text-xs font-medium">Stage<select name="stage" className="mt-1 h-10 w-full rounded-md border border-input bg-background px-2 text-sm">{['HR_SCREENING', 'DEPARTMENT', 'DEMO_TEACHING', 'FINAL'].map((v) => <option key={v}>{v}</option>)}</select></label><label className="text-xs font-medium">Interviewer<select name="interviewerId" className="mt-1 h-10 w-full rounded-md border border-input bg-background px-2 text-sm"><option value="">Unassigned</option>{employees.map(({ user }) => <option key={user.id} value={user.id}>{user.firstName} {user.lastName}  |  {user.role.replaceAll('_', ' ')}</option>)}</select></label><label className="text-xs font-medium">Date and time<input name="date" type="datetime-local" required min={new Date(Date.now() + 60_000).toISOString().slice(0, 16)} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-2 text-sm" /></label><label className="text-xs font-medium">Duration<select name="durationMinutes" className="mt-1 h-10 w-full rounded-md border border-input bg-background px-2 text-sm">{[15, 30, 45, 60, 90, 120].map((v) => <option key={v}>{v}</option>)}</select></label><label className="text-xs font-medium">Type<select name="type" className="mt-1 h-10 w-full rounded-md border border-input bg-background px-2 text-sm"><option>ONLINE</option><option>ONSITE</option><option>PHONE</option></select></label><label className="text-xs font-medium">Meeting URL (online)<input name="meetingUrl" type="url" placeholder="https://..." className="mt-1 h-10 w-full rounded-md border border-input bg-background px-2 text-sm" /></label><label className="text-xs font-medium sm:col-span-2">Location<input name="location" className="mt-1 h-10 w-full rounded-md border border-input bg-background px-2 text-sm" /></label><label className="text-xs font-medium sm:col-span-2">Instructions<textarea name="instructions" rows={2} className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm" /></label>{error && <p role="alert" className="text-sm text-destructive sm:col-span-2">{error}</p>}<div className="flex justify-end gap-2 sm:col-span-2"><button type="button" onClick={onClose} className="rounded-md border px-3 py-2 text-sm">Cancel</button><button disabled={saving || applicants.length === 0} className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-50">{saving ? 'Scheduling...' : 'Schedule'}</button></div></form></Modal>;
}

function EvaluationReviewDialog({ interview, onClose, onAddEvaluation }: { interview: Interview; onClose: () => void; onAddEvaluation: () => void }) {
  const [evaluations, setEvaluations] = useState<InterviewEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    void api.get<{ evaluations: InterviewEvaluation[] }>(`/interviews/${interview.id}/evaluations`)
      .then(({ data }) => { if (active) setEvaluations(data.evaluations ?? []); })
      .catch((requestError: unknown) => { if (active) setError(getApiErrorMessage(requestError, 'Could not load interview evaluations.')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [interview.id]);

  const recommendationLabel: Record<string, string> = { STRONG_YES: 'Strong yes', YES: 'Yes', HOLD: 'Hold', NO: 'No' };
  return <Modal title="Interviewer evaluations" onClose={onClose}>
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/50 p-3"><div><p className="text-sm font-medium">{interview.applicant?.user ? `${interview.applicant.user.firstName} ${interview.applicant.user.lastName}` : 'Applicant'}</p><p className="mt-0.5 text-xs text-muted-foreground">{interview.stage.replaceAll('_', ' ')} interview · {dateLabel(interview.date)}</p></div><button type="button" onClick={onAddEvaluation} className="rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground">Add evaluation</button></div>
    {loading && <p className="py-8 text-center text-sm text-muted-foreground">Loading evaluations…</p>}
    {error && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</p>}
    {!loading && !error && evaluations.length === 0 && <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No evaluations have been submitted for this interview yet.</p>}
    <div className="space-y-3">{evaluations.map((evaluation) => <article key={evaluation.id} className="rounded-lg border border-border p-4"><header className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="text-sm font-semibold">{evaluation.evaluator ? `${evaluation.evaluator.firstName} ${evaluation.evaluator.lastName}` : 'Interviewer'}</h3><p className="mt-0.5 text-xs text-muted-foreground">{evaluation.evaluator?.email ?? ''}{evaluation.createdAt ? ` · Submitted ${dateLabel(evaluation.createdAt)}` : ''}</p></div><span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">{recommendationLabel[evaluation.recommendation] ?? evaluation.recommendation}</span></header>
      <section className="mt-4"><h4 className="text-xs font-medium text-muted-foreground">Criteria ratings</h4><div className="mt-2 grid gap-2 sm:grid-cols-2">{Object.entries(evaluation.ratings ?? {}).map(([criterion, rating]) => <div key={criterion} className="flex items-center justify-between gap-2 rounded-md bg-muted/40 px-3 py-2 text-xs"><span>{criterion.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase())}</span><span className="font-semibold">{rating}/5</span></div>)}</div></section>
      {(evaluation.strengths || evaluation.concerns || evaluation.comments) && <div className="mt-4 space-y-3 border-t border-border pt-3">{evaluation.strengths && <div><h4 className="text-xs font-medium">Strengths</h4><p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{evaluation.strengths}</p></div>}{evaluation.concerns && <div><h4 className="text-xs font-medium">Concerns</h4><p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{evaluation.concerns}</p></div>}{evaluation.comments && <div><h4 className="text-xs font-medium">Additional comments</h4><p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{evaluation.comments}</p></div>}</div>}
    </article>)}</div>
  </Modal>;
}

function EvaluationDialog({ interview, onClose }: { interview: Interview; onClose: () => void }) {
  const [criteria, setCriteria] = useState<Criterion[]>([]); const [ratings, setRatings] = useState<Record<string, number>>({}); const [recommendation, setRecommendation] = useState('YES'); const [comments, setComments] = useState(''); const [error, setError] = useState(''); const [saving, setSaving] = useState(false);
  useEffect(() => { void api.get<{ criteria?: Criterion[]; rubrics?: { roleType: string; criteria: Criterion[] }[] }>(`/interviews/rubrics?stage=${interview.stage}`).then(({ data }) => setCriteria(data.criteria ?? data.rubrics?.[0]?.criteria ?? [])).catch((requestError: unknown) => setError(getApiErrorMessage(requestError, 'Could not load evaluation rubric.'))); }, [interview.stage]);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSaving(true); try { await api.post(`/interviews/${interview.id}/evaluations`, { ratings, recommendation, comments: comments.trim() || null }); onClose(); } catch (requestError) { setError(getApiErrorMessage(requestError, 'Could not submit evaluation.')); } finally { setSaving(false); } }
  return <Modal title="Interview evaluation" onClose={onClose}><form onSubmit={(event) => void submit(event)} className="space-y-3">{criteria.map((item) => <label key={item.id} className="block rounded-lg border border-border p-3 text-sm"><span className="font-medium">{item.name}</span><span className="mt-1 block text-xs text-muted-foreground">{item.description}</span><select required value={ratings[item.id] ?? ''} onChange={(event) => setRatings((current) => ({ ...current, [item.id]: Number(event.target.value) }))} className="mt-2 h-9 rounded-md border border-input bg-background px-2 text-sm"><option value="" disabled>Rate 1 - 5</option>{[1, 2, 3, 4, 5].map((score) => <option key={score}>{score}</option>)}</select></label>)}<label className="block text-xs font-medium">Recommendation<select value={recommendation} onChange={(event) => setRecommendation(event.target.value)} className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm"><option value="STRONG_YES">Strong yes</option><option value="YES">Yes</option><option value="HOLD">Hold</option><option value="NO">No</option></select></label><label className="block text-xs font-medium">Comments<textarea value={comments} onChange={(event) => setComments(event.target.value)} rows={3} className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm" /></label>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<div className="flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-md border px-3 py-2 text-sm">Cancel</button><button disabled={saving || criteria.length === 0 || criteria.some(({ id }) => !ratings[id])} className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-50">{saving ? 'Saving...' : 'Submit evaluation'}</button></div></form></Modal>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) { return <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-4"><section className="max-h-[90dvh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-xl border border-border bg-card p-5 shadow-xl"><header className="flex justify-between"><h3 className="text-lg font-semibold">{title}</h3><button onClick={onClose} aria-label="Close" className="text-muted-foreground">x</button></header>{children}</section></div>; }
