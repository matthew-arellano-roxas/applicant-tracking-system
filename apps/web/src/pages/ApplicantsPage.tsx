import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { CalendarPlus, Download, MoreHorizontal, Search, X } from 'lucide-react';
import { APPLICANT_STATUS, type ApplicantStatus } from '@ats/shared-types';
import { useApplicants, type ApplicantRecord } from '@/hooks/useApplicants';
import { api } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/getApiErrorMessage';

const statuses = Object.values(APPLICANT_STATUS) as ApplicantStatus[];
const statusLabels: Record<ApplicantStatus, string> = {
  APPLIED: 'Applied', SCREENED: 'Screened', SHORTLISTED: 'Shortlisted',
  INTERVIEW: 'Interview', REJECTED: 'Rejected', HIRED: 'Hired',
};

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? ' - ' : new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium' }).format(date);
}

function StatusBadge({ status }: { status: ApplicantStatus }) {
  return <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">{statusLabels[status]}</span>;
}

function ScoreBreakdown({ application }: { application: ApplicantRecord }) {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const scores = application.scores;
  if (!scores) return <span className="text-xs text-muted-foreground">{application.scoreStatus.replaceAll('_', ' ')}</span>;
  const show = (target: HTMLButtonElement) => {
    const bounds = target.getBoundingClientRect();
    const width = 224;
    setPosition({ top: Math.min(bounds.bottom + 8, window.innerHeight - 190), left: Math.max(12, Math.min(bounds.left, window.innerWidth - width - 12)) });
  };
  const criteria = [
    ['Education', scores.educationalBackground],
    ['Skills', scores.skills],
    ['Experience', scores.workExperience],
    ['Certifications', scores.certification],
  ] as const;
  return <>
    <button type="button" aria-label={`Documented fit ${scores.totalScore}. Focus or hover to view criteria scores.`} onPointerEnter={(event) => { if (event.pointerType !== 'touch') show(event.currentTarget); }} onPointerLeave={(event) => { if (event.pointerType !== 'touch') setPosition(null); }} onFocus={(event) => show(event.currentTarget)} onBlur={() => setPosition(null)} className="inline-flex items-center gap-1 font-medium decoration-dotted underline underline-offset-4 hover:text-primary focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" title="Hover or focus to view the individual criteria scores">
      {scores.totalScore}<span aria-hidden="true" className="text-[10px] text-muted-foreground">ⓘ</span>
    </button>
    {position && <div role="tooltip" className="pointer-events-none fixed z-[70] w-56 rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-xl" style={{ top: position.top, left: position.left }}>
      <p className="mb-2 text-xs font-semibold">Criteria score breakdown</p>
      <div className="space-y-1.5">{criteria.map(([label, score]) => <div key={label} className="flex items-center justify-between gap-3 text-xs"><span className="text-muted-foreground">{label}</span><span className="font-medium">{score}</span></div>)}</div>
      <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-xs"><span className="font-medium">Total</span><span className="font-semibold">{scores.totalScore}</span></div>
    </div>}
  </>;
}

function canShortlist(application: ApplicantRecord) {
  return application.status === 'APPLIED' || application.status === 'SCREENED';
}

function ApplicantDetails({ application, onClose }: { application: ApplicantRecord; onClose: () => void }) {
  const [details, setDetails] = useState<ApplicantRecord>(application);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    void api.get<{ application: ApplicantRecord }>(`/applications/${application.id}`)
      .then(({ data }) => { if (active) setDetails(data.application); })
      .catch((requestError: unknown) => { if (active) setError(getApiErrorMessage(requestError, 'Could not load application details.')); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [application.id]);

  async function downloadCv() {
    if (!details.user?.id) return;
    try {
      const { data } = await api.get<{ url: string }>(`/cvs/${details.user.id}/download`);
      window.open(data.url, '_blank', 'noopener,noreferrer');
    } catch (requestError) { setError(getApiErrorMessage(requestError, 'Could not open the applicant CV.')); }
  }

  async function retryScoring() {
    try {
      await api.post(`/applications/${application.id}/retry-scoring`);
      setDetails((current) => ({ ...current, scoreStatus: 'PENDING' }));
    } catch (requestError) { setError(getApiErrorMessage(requestError, 'Could not retry CV screening.')); }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-foreground/30" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <aside className="h-full w-full max-w-lg overflow-y-auto bg-card p-6 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="applicant-detail-title">
        <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
          <div><p className="text-xs text-muted-foreground">Applicant profile</p><h2 id="applicant-detail-title" className="mt-1 text-xl font-semibold">{details.user ? `${details.user.firstName} ${details.user.lastName}` : 'Applicant'}</h2></div>
          <button aria-label="Close details" onClick={onClose} className="rounded-md p-2 text-muted-foreground hover:bg-accent"><X className="size-4" /></button>
        </div>
        {isLoading && <p className="py-6 text-sm text-muted-foreground">Loading applicant details...</p>}
        {error && <p role="alert" className="py-4 text-sm text-destructive">{error}</p>}
        {!isLoading && (
          <div className="space-y-5 py-5">
            <DetailRow label="Email" value={details.user?.email ?? 'Not provided'} />
            <DetailRow label="Position" value={details.jobPost?.title ?? 'Not available'} />
            <DetailRow label="Applied" value={formatDate(details.applyDate)} />
            <DetailRow label="Application status" value={statusLabels[details.status]} />
            <DetailRow label="CV scoring" value={details.scoreStatus.replaceAll('_', ' ')} />
            <div className="flex flex-wrap gap-2"><button onClick={() => void downloadCv()} className="rounded-md border border-input px-3 py-2 text-xs hover:bg-accent">Open CV</button>{details.scoreStatus === 'FAILED' && <button onClick={() => void retryScoring()} className="rounded-md border border-input px-3 py-2 text-xs hover:bg-accent">Retry CV screening</button>}</div>
            {details.scores && (
              <section>
                <h3 className="mb-1 text-sm font-semibold">Documented fit (advisory)</h3>
                <p className="mb-3 text-xs text-muted-foreground">This score is a screening aid, not a hiring decision. The API currently provides category totals, but not evidence excerpts or identified gaps.</p>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries({ Education: details.scores.educationalBackground, Skills: details.scores.skills, Experience: details.scores.workExperience, Certifications: details.scores.certification, Total: details.scores.totalScore }).map(([label, score]) => (
                    <div key={label} className="rounded-lg border border-border bg-background p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-lg font-semibold">{score}</p></div>
                  ))}
                </div>
              </section>
            )}
            
          </div>
        )}
      </aside>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-sm font-medium">{value}</p></div>;
}

export function ApplicantsPage() {
  const navigate = useNavigate();
  const { applications, pagination, search, setSearch, status, setStatus, scoreStatus, setScoreStatus, departmentId, setDepartmentId, page, setPage, isLoading, errorMessage, updatingId, updateStatus } = useApplicants();
  const [selected, setSelected] = useState<ApplicantRecord | null>(null);
  const [departments, setDepartments] = useState<{id:string;name:string}[]>([]);
  const [actionMenu, setActionMenu] = useState<{ id: string; top: number; left: number } | null>(null);
  const [statusConfirmation, setStatusConfirmation] = useState<{ application: ApplicantRecord; next: ApplicantStatus } | null>(null);
  const [cvDownloadError, setCvDownloadError] = useState('');
  useEffect(() => { void api.get('/departments', { params: { page: 1, limit: 100 } }).then(({data}) => setDepartments(data.departments ?? [])).catch(() => setDepartments([])); }, []);
  async function downloadCv(application: ApplicantRecord) {
    setActionMenu(null);
    setCvDownloadError('');
    if (!application.user?.id) {
      setCvDownloadError('Applicant account information is unavailable.');
      return;
    }

    // Open the tab during the click so browser popup blockers allow the signed URL.
    const downloadTab = window.open('about:blank', '_blank');
    if (!downloadTab) {
      setCvDownloadError('Allow pop-ups to open the applicant CV.');
      return;
    }

    try {
      const { data } = await api.get<{ url: string }>(`/cvs/${application.user.id}/download`);
      downloadTab.location.href = data.url;
    } catch (requestError) {
      downloadTab.close();
      setCvDownloadError(getApiErrorMessage(requestError, 'Could not open the applicant CV.'));
    }
  }
  async function changeStatus(application: ApplicantRecord, next: ApplicantStatus) {
    setActionMenu(null);
    await updateStatus(application.id, next);
  }
  function renderActions(application: ApplicantRecord) {
    function showMenu(event: React.MouseEvent<HTMLButtonElement>) {
      const bounds = event.currentTarget.getBoundingClientRect();
      const width = 208;
      const active = !['REJECTED','HIRED'].includes(application.status);
      const itemCount = 2
        + (canShortlist(application) ? 1 : 0)
        + (application.status !== 'SHORTLISTED' && active ? 1 : 0)
        + (application.status === 'SHORTLISTED' ? 1 : 0)
        + (active ? 1 : 0)
        + (application.status === 'HIRED' ? 1 : 0);
      const menuHeight = Math.min(itemCount * 40 + 12, window.innerHeight * 0.45);
      const below = window.innerHeight - bounds.bottom;
      const top = below >= menuHeight + 8 ? bounds.bottom + 4 : Math.max(8, bounds.top - menuHeight - 4);
      setActionMenu({ id: application.id, top, left: Math.max(8, Math.min(bounds.right - width, window.innerWidth - width - 8)) });
    }
    return <div className="flex items-center gap-2">
      {canShortlist(application) && <button disabled={updatingId===application.id} onClick={() => setStatusConfirmation({application,next:'SHORTLISTED'})} className="w-24 justify-center rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground disabled:opacity-50">Shortlist</button>}
      {application.status==='SHORTLISTED' && <button onClick={() => navigate(`/h/interviews?applicantId=${encodeURIComponent(application.id)}`)} className="inline-flex w-24 items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground"><CalendarPlus className="size-3.5"/><span>Schedule</span></button>}
      {application.status==='INTERVIEW' && <button disabled={updatingId===application.id} onClick={() => void changeStatus(application,'HIRED')} className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-medium text-white disabled:opacity-50">{updatingId===application.id?'Saving…':'Mark hired'}</button>}
      <button type="button" aria-label="More application actions" title="More actions" onClick={showMenu} className="flex size-9 shrink-0 items-center justify-center rounded-md border border-input text-muted-foreground hover:bg-accent"><MoreHorizontal className="size-4"/></button>
    </div>;
  }

  const menuApplication = actionMenu ? applications.find(({ id }) => id === actionMenu.id) : undefined;

  return (
    <div className="space-y-5">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><h2 className="text-xl font-semibold">Applicants</h2><p className="mt-1 text-sm text-muted-foreground">Review applications, screening results, and candidate status.</p></div>
        <span className="text-sm text-muted-foreground">{pagination.total} application{pagination.total === 1 ? '' : 's'}</span>
      </section>

      <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm sm:flex-row">
        <label className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, or position" className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30" />
        </label>
        <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by application status" className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30 sm:w-52">
          <option value="">All statuses</option>
          {statuses.map((value) => <option key={value} value={value}>{statusLabels[value]}</option>)}
        </select>
        <select value={departmentId} onChange={(event) => setDepartmentId(event.target.value)} aria-label="Filter by department" className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="">All departments</option>{departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
        <select value={scoreStatus} onChange={(event) => setScoreStatus(event.target.value)} aria-label="Filter by CV scoring status" className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="">All CV review states</option>{['PENDING','PROCESSING','COMPLETED','FAILED'].map((value) => <option key={value} value={value}>{value.replaceAll('_',' ')}</option>)}</select>
      </section>

      {errorMessage && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{errorMessage}</p>}
      {cvDownloadError && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{cvDownloadError}</p>}

      <section className="hidden overflow-hidden rounded-xl border border-border bg-card shadow-sm xl:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-muted/60 text-xs text-muted-foreground"><tr><th className="px-5 py-3 font-medium">Applicant</th><th className="px-5 py-3 font-medium">Position</th><th className="px-5 py-3 font-medium">Applied</th><th className="px-5 py-3 font-medium">Documented fit</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 font-medium">Next action</th></tr></thead>
            <tbody className="divide-y divide-border">
              {isLoading ? <tr><td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">Loading applications...</td></tr> : applications.length === 0 ? <tr><td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">No applications match these filters.</td></tr> : applications.map((application) => (
                <tr key={application.id} className="hover:bg-muted/30">
                  <td className="px-4 py-2.5"><button onClick={() => setSelected(application)} className="text-left"><span className="block font-medium hover:text-primary">{application.user ? `${application.user.firstName} ${application.user.lastName}` : 'Applicant'}</span><span className="mt-0.5 block text-xs text-muted-foreground">{application.user?.email}</span></button></td>
                  <td className="px-4 py-2.5">{application.jobPost?.title ?? ' - '}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{formatDate(application.applyDate)}</td>
                  <td className="px-4 py-2.5"><ScoreBreakdown application={application} /></td>
                  <td className="px-4 py-2.5"><StatusBadge status={application.status} /></td>
                  <td className="px-4 py-2.5">{renderActions(application)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <footer className="flex items-center justify-between border-t border-border px-5 py-3 text-xs text-muted-foreground">
          <span>Page {pagination.totalPages === 0 ? 0 : page} of {pagination.totalPages}</span>
          <div className="flex gap-2"><button disabled={page <= 1 || isLoading} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-md border border-input px-3 py-1.5 hover:bg-accent disabled:pointer-events-none disabled:opacity-50">Previous</button><button disabled={page >= pagination.totalPages || isLoading} onClick={() => setPage((current) => current + 1)} className="rounded-md border border-input px-3 py-1.5 hover:bg-accent disabled:pointer-events-none disabled:opacity-50">Next</button></div>
        </footer>
      </section>

      <section className="space-y-3 xl:hidden">
        {isLoading ? <p className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">Loading applications...</p> : applications.length === 0 ? <p className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">No applications match these filters.</p> : applications.map((application) => <article key={application.id} className="rounded-xl border border-border bg-card p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><button onClick={()=>setSelected(application)} className="min-w-0 text-left"><span className="block truncate font-semibold">{application.user?`${application.user.firstName} ${application.user.lastName}`:'Applicant'}</span><span className="mt-0.5 block truncate text-xs text-muted-foreground">{application.user?.email}</span></button><StatusBadge status={application.status}/></div><div className="mt-3 grid grid-cols-2 gap-3 border-t border-border pt-3 text-xs"><div><span className="text-muted-foreground">Position</span><p className="mt-1 font-medium">{application.jobPost?.title??' - '}</p></div><div><span className="text-muted-foreground">Applied</span><p className="mt-1 font-medium">{formatDate(application.applyDate)}</p></div><div><span className="text-muted-foreground">Documented fit</span><p className="mt-1"><ScoreBreakdown application={application} /></p></div><div><span className="text-muted-foreground">CV review</span><p className="mt-1 font-medium">{application.scoreStatus.replaceAll('_',' ')}</p></div></div><div className="mt-4 border-t border-border pt-3">{renderActions(application)}</div></article>)}
        <div className="flex items-center justify-between rounded-xl border bg-card px-4 py-3 text-xs text-muted-foreground"><span>Page {pagination.totalPages===0?0:page} of {pagination.totalPages}</span><div className="flex gap-2"><button disabled={page<=1||isLoading} onClick={()=>setPage(current=>Math.max(1,current-1))} className="rounded-md border px-3 py-1.5 disabled:opacity-50">Previous</button><button disabled={page>=pagination.totalPages||isLoading} onClick={()=>setPage(current=>current+1)} className="rounded-md border px-3 py-1.5 disabled:opacity-50">Next</button></div></div>
      </section>

      {actionMenu && menuApplication && <>
        <button aria-label="Close actions menu" className="fixed inset-0 z-40 cursor-default bg-transparent" onClick={()=>setActionMenu(null)}/>
        <div role="menu" aria-label={`Actions for ${menuApplication.user?.firstName??'applicant'}`} onKeyDown={(event)=>{if(event.key==='Escape')setActionMenu(null)}} style={{top:actionMenu.top,left:actionMenu.left}} className="app-menu-scroll fixed z-50 max-h-[45dvh] w-52 overflow-y-auto overscroll-contain rounded-lg border border-border bg-card p-1.5 shadow-xl">
          <button role="menuitem" onClick={()=>{setActionMenu(null);setSelected(menuApplication)}} className="w-full rounded-md px-3 py-2.5 text-left text-sm hover:bg-accent">Review application</button>
          {menuApplication.user?.id && <button role="menuitem" onClick={()=>void downloadCv(menuApplication)} className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm hover:bg-accent"><Download className="size-4"/>Download CV</button>}
          {canShortlist(menuApplication)&&<button role="menuitem" disabled={updatingId===menuApplication.id} onClick={()=>{setActionMenu(null);setStatusConfirmation({application:menuApplication,next:'SHORTLISTED'})}} className="w-full rounded-md px-3 py-2.5 text-left text-sm hover:bg-accent disabled:opacity-50">Shortlist applicant</button>}
          {menuApplication.status!=='SHORTLISTED'&&!['REJECTED','HIRED'].includes(menuApplication.status)&&<button role="menuitem" onClick={()=>{setActionMenu(null);navigate(`/h/interviews?applicantId=${encodeURIComponent(menuApplication.id)}`)}} className="w-full rounded-md px-3 py-2.5 text-left text-sm hover:bg-accent">Schedule interview</button>}
          {menuApplication.status==='SHORTLISTED'&&<button role="menuitem" disabled={updatingId===menuApplication.id} onClick={()=>void changeStatus(menuApplication,'INTERVIEW')} className="w-full rounded-md px-3 py-2.5 text-left text-sm hover:bg-accent">Move to interview stage</button>}
          {!['REJECTED','HIRED'].includes(menuApplication.status)&&<button role="menuitem" disabled={updatingId===menuApplication.id} onClick={()=>{setActionMenu(null);setStatusConfirmation({application:menuApplication,next:'REJECTED'})}} className="w-full rounded-md px-3 py-2.5 text-left text-sm text-destructive hover:bg-destructive/10">Reject application</button>}
          {menuApplication.status==='HIRED'&&<button role="menuitem" onClick={()=>{setActionMenu(null);navigate(`/h/employees?applicationId=${encodeURIComponent(menuApplication.id)}`)}} className="w-full rounded-md px-3 py-2.5 text-left text-sm hover:bg-accent">Create employee</button>}
        </div>
      </>}

      {statusConfirmation && <div className="fixed inset-0 z-[60] grid place-items-center bg-foreground/35 p-4" role="presentation" onMouseDown={(event)=>{if(event.target===event.currentTarget)setStatusConfirmation(null)}}><section role="alertdialog" aria-modal="true" aria-labelledby="status-confirm-title" aria-describedby="status-confirm-description" className="w-full max-w-sm rounded-xl border border-border bg-card p-5 shadow-xl"><h2 id="status-confirm-title" className="text-base font-semibold">{statusConfirmation.next === 'REJECTED' ? 'Reject application?' : 'Shortlist applicant?'}</h2><p id="status-confirm-description" className="mt-2 text-sm text-muted-foreground">{statusConfirmation.next === 'REJECTED' ? `Reject ${statusConfirmation.application.user?.firstName ?? 'this applicant'}’s application? This will update their application status.` : `Move ${statusConfirmation.application.user?.firstName??'this applicant'} to the Shortlisted stage?`}</p><div className="mt-5 flex justify-end gap-2"><button onClick={()=>setStatusConfirmation(null)} className="rounded-md border border-input px-3 py-2 text-sm hover:bg-accent">Cancel</button><button disabled={updatingId===statusConfirmation.application.id} onClick={async()=>{const {application,next}=statusConfirmation;setStatusConfirmation(null);await changeStatus(application,next)}} className={`rounded-md px-3 py-2 text-sm font-medium text-white disabled:opacity-50 ${statusConfirmation.next === 'REJECTED' ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary text-primary-foreground'}`}>{updatingId===statusConfirmation.application.id?'Saving…':statusConfirmation.next === 'REJECTED' ? 'Confirm rejection' : 'Confirm shortlist'}</button></div></section></div>}

      {selected && <ApplicantDetails key={selected.id} application={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
