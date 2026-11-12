import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Search } from 'lucide-react';
import { UserRole } from '@ats/shared-types';
import { api } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/getApiErrorMessage';
import { useAuthStore } from '@/stores/authStore';

type Row = Record<string, any>;
const box = 'rounded-xl border border-border bg-card p-5 shadow-sm';
function Message({ error }: { error: string }) { return error ? <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p> : null; }
function date(value?: string) { return value ? new Date(value).toLocaleString() : '—'; }

export function ApplicantApplicationsPage() {
  const [rows, setRows] = useState<Row[]>([]); const [error, setError] = useState(''); const [busy, setBusy] = useState('');
  async function load() { try { const { data } = await api.get('/applications/me', { params: { page: 1, limit: 100 } }); setRows(data.applications ?? []); } catch (e) { setError(getApiErrorMessage(e, 'Could not load your applications.')); } }
  useEffect(() => { void load(); }, []);
  const steps = ['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'HIRED'];
  return <div className="space-y-4"><Message error={error}/>{rows.map((r) => { const index = Math.max(0, steps.indexOf(r.status)); return <article className={box} key={r.id}><div className="flex flex-wrap justify-between gap-3"><div><h2 className="font-semibold">{r.jobPost?.title ?? 'Position'}</h2><p className="mt-1 text-xs text-muted-foreground">Applied {date(r.applyDate)}</p></div><span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">{String(r.status).replaceAll('_',' ')}</span></div><div className="mt-5 grid grid-cols-4 gap-2">{['Applied','Shortlisted','Interview','Decision'].map((s,i)=><div key={s}><div className={`h-1.5 rounded-full ${i <= index ? 'bg-primary':'bg-muted'}`}/><p className="mt-1 text-[11px] text-muted-foreground">{s}</p></div>)}</div><p className="mt-4 text-sm text-muted-foreground">CV review: {String(r.scoreStatus).replaceAll('_',' ')}</p>{r.scoreStatus==='FAILED' && <button disabled={busy===r.id} onClick={async()=>{setBusy(r.id);try{await api.post(`/applications/${r.id}/retry-scoring`);await load()}catch(e){setError(getApiErrorMessage(e,'Could not retry CV review.'))}finally{setBusy('')}}} className="mt-3 rounded-md border px-3 py-2 text-xs">Retry CV review</button>}</article>})}{!rows.length&&!error&&<p className={box}>You have not submitted any applications yet. <Link className="text-primary underline" to="/a/jobs">Browse open jobs</Link></p>}</div>;
}

export function ApplicantInterviewsPage() { return <OwnInterviews endpoint="/interviews/me" readOnly />; }
export function EmployeeInterviewsPage() { return <OwnInterviews endpoint="/interviews/me" readOnly={false} />; }
function OwnInterviews({ endpoint, readOnly }: { endpoint: string; readOnly: boolean }) {
  const [rows,setRows]=useState<Row[]>([]);const [error,setError]=useState('');
  useEffect(()=>{void api.get(endpoint,{params:{page:1,limit:100}}).then(({data})=>setRows(data.interviews??[])).catch(e=>setError(getApiErrorMessage(e,'Could not load interviews.')))},[endpoint]);
  return <div className="space-y-4"><Message error={error}/>{rows.map((r)=><article key={r.id} className={box}><div className="flex flex-wrap justify-between gap-3"><div><h2 className="font-semibold">{r.stage?.replaceAll('_',' ')}</h2><p className="mt-1 text-sm text-muted-foreground">{date(r.date)} · {r.durationMinutes} min · {r.type}</p><p className="mt-1 text-xs text-muted-foreground">{r.applicant?.jobPost?.title ?? (r.applicant?.user ? `${r.applicant.user.firstName} ${r.applicant.user.lastName}` : '')}</p></div><span className="h-fit rounded-full bg-muted px-3 py-1 text-xs">{r.status}</span></div>{r.meetingUrl&&<a className="mt-3 inline-block text-sm text-primary underline" href={r.meetingUrl} target="_blank" rel="noreferrer">Join meeting</a>}{r.location&&<p className="mt-2 text-sm">Location: {r.location}</p>}{r.instructions&&<p className="mt-2 text-sm text-muted-foreground">{r.instructions}</p>}{!readOnly&&r.status==='SCHEDULED'&&<p className="mt-3 text-xs text-muted-foreground">Evaluation can be submitted after the interview is completed.</p>}</article>)}{!rows.length&&!error&&<p className={box}>No interviews scheduled.</p>}</div>;
}

export function ApplicantCvPage() {
  const [exists,setExists]=useState(false);const [error,setError]=useState('');const [busy,setBusy]=useState(false);
  useEffect(()=>{void api.get('/cvs/me/download').then(()=>setExists(true)).catch(()=>setExists(false))},[]);
  async function upload(file?:File){if(!file)return;if(file.type!=='application/pdf'||file.size>5*1024*1024){setError('Choose a PDF up to 5 MB.');return}setBusy(true);setError('');try{const {data}=await api.post('/cvs/upload-url',{mimeType:file.type,size:file.size});await fetch(data.signedUrl,{method:'PUT',headers:{'Content-Type':file.type},body:file});await api.post('/cvs/confirm-upload',{path:data.path});setExists(true)}catch(e){setError(getApiErrorMessage(e,'Could not upload CV.'))}finally{setBusy(false)}}
  async function download(){try{const {data}=await api.get('/cvs/me/download');window.open(data.url,'_blank','noopener,noreferrer')}catch(e){setError(getApiErrorMessage(e,'Could not download CV.'))}}
  return <section className={`${box} max-w-2xl`}><h2 className="font-semibold">My CV</h2><p className="mt-1 text-sm text-muted-foreground">PDF only, up to 5 MB. A CV is required before applying to a job.</p><Message error={error}/>{exists&&<button onClick={()=>void download()} className="mt-4 mr-2 rounded-md border px-3 py-2 text-sm">Download current CV</button>}<label className="mt-4 inline-flex cursor-pointer rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground">{busy?'Uploading…':exists?'Replace CV':'Upload CV'}<input className="sr-only" type="file" accept="application/pdf,.pdf" disabled={busy} onChange={e=>void upload(e.target.files?.[0])}/></label><p className="mt-5 border-t pt-4 text-xs text-muted-foreground">Parsed CV summary is not available yet.</p></section>;
}

export function HiringOverviewPage() {
  const [counts,setCounts]=useState({jobs:0,apps:0,interviews:0,documentsPending:0,failed:0});const [error,setError]=useState('');
  useEffect(()=>{void (async()=>{const results=await Promise.allSettled([api.get('/job-posts',{params:{page:1,limit:100}}),api.get('/applications',{params:{page:1,limit:100}}),api.get('/interviews',{params:{page:1,limit:100}}),api.get('/employees',{params:{page:1,limit:100}})]);const [j,a,i,e]=results;let documentsPending=0;if(e.status==='fulfilled'){const employees=e.value.data.employees??[];const checklists=await Promise.allSettled(employees.map((employee:Row)=>api.get(`/employees/${employee.id}/document-status`)));documentsPending=checklists.reduce((total,result)=>result.status==='fulfilled'?total+Object.values(result.value.data.status??{}).filter((value)=>value!=='complete').length:total,0)}setCounts({jobs:j.status==='fulfilled'?j.value.data.jobPosts?.filter((x:Row)=>x.status==='OPEN').length??0:0,apps:a.status==='fulfilled'?a.value.data.applications?.length??0:0,interviews:i.status==='fulfilled'?i.value.data.interviews?.filter((x:Row)=>x.status==='SCHEDULED').length??0:0,documentsPending,failed:a.status==='fulfilled'?a.value.data.applications?.filter((x:Row)=>x.scoreStatus==='FAILED').length??0:0});if(results.every(x=>x.status==='rejected'))setError('Could not load recruitment summary.')})()},[]);
  return <div className="space-y-5"><Message error={error}/><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[['Open posts',counts.jobs],['Applications',counts.apps],['Scheduled interviews',counts.interviews],['Documents pending',counts.documentsPending]].map(([label,value])=><section key={String(label)} className={box}><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-semibold">{value}</p></section>)}</div><section className={box}><h2 className="font-semibold">Needs attention</h2><div className="mt-3 flex flex-wrap gap-3 text-sm">{counts.failed>0&&<Link className="rounded-md bg-amber-500/10 px-3 py-2 text-amber-800" to="/h/applications?scoreStatus=FAILED">{counts.failed} failed CV reviews</Link>}<Link className="rounded-md border px-3 py-2" to="/h/job-posts">Review approved requests ready to publish</Link><Link className="rounded-md border px-3 py-2" to="/h/employees">Review employee documents</Link></div></section></div>;
}

export function DeanApprovalsPage(){const[rows,setRows]=useState<Row[]>([]);const[error,setError]=useState('');async function load(){try{const{data}=await api.get('/hiring-requests',{params:{status:'PENDING',page:1,limit:100}});setRows(data.hiringRequests??[])}catch(e){setError(getApiErrorMessage(e,'Could not load pending requests.'))}}useEffect(()=>{void load()},[]);return <div className="space-y-4"><Message error={error}/>{rows.map(r=><article className={box} key={r.id}><h2 className="font-semibold">{r.position}</h2><p className="mt-1 text-sm text-muted-foreground">{r.department?.name??'Department'} · {r.employmentType?.replaceAll('_',' ')} · {r.isTeaching?'Teaching':'Non-teaching'}</p><div className="mt-4 flex gap-2"><button onClick={async()=>{try{await api.patch(`/hiring-requests/${r.id}/status`,{status:'APPROVED'});await load()}catch(e){setError(getApiErrorMessage(e,'Could not approve request.'))}}} className="rounded-md bg-primary px-3 py-2 text-xs text-primary-foreground">Approve</button><button onClick={async()=>{try{await api.patch(`/hiring-requests/${r.id}/status`,{status:'REJECTED'});await load()}catch(e){setError(getApiErrorMessage(e,'Could not reject request.'))}}} className="rounded-md border px-3 py-2 text-xs">Reject</button></div></article>)}{!rows.length&&!error&&<p className={box}>No staffing requests are waiting for approval.</p>}</div>}

export function AdminUsersPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const pageSize = 10;
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/users', { params: { page, limit: pageSize, ...(search.trim() ? { search: search.trim() } : {}), ...(roleFilter ? { role: roleFilter } : {}) } });
      setRows(data.users ?? []);
      setTotal(data.pagination?.total ?? 0);
      setTotalPages(data.pagination?.totalPages ?? 0);
    } catch (requestError) { setError(getApiErrorMessage(requestError, 'Could not load users.')); }
    finally { setLoading(false); }
  }, [page, roleFilter, search]);
  useEffect(() => { void load(); }, [load]);

  async function assignRole(user: Row, role: string) {
    try {
      await api.patch(`/users/${user.id}/role`, { role });
      await load();
    } catch (requestError) { setError(getApiErrorMessage(requestError, 'Could not update role.')); }
  }

  return <div className="space-y-4">
    <Message error={error} />
    <section className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-[minmax(0,1fr)_220px]"><label className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(event) => { setPage(1); setSearch(event.target.value); }} placeholder="Search name or email" aria-label="Search users" className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm" /></label><select value={roleFilter} onChange={(event) => { setPage(1); setRoleFilter(event.target.value); }} aria-label="Filter users by role" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">All roles</option>{Object.values(UserRole).map((role) => <option key={role} value={role}>{role.replaceAll('_', ' ')}</option>)}</select></section>
    <section className="overflow-x-auto rounded-xl border border-border bg-card"><table className="w-full min-w-[600px] text-left text-sm"><thead className="bg-muted/60 text-xs text-muted-foreground"><tr><th className="p-3 font-medium">Name</th><th className="p-3 font-medium">Email</th><th className="p-3 font-medium">Role</th></tr></thead><tbody className="divide-y divide-border">{loading ? <tr><td colSpan={3} className="p-10 text-center text-muted-foreground">Loading users…</td></tr> : rows.length === 0 ? <tr><td colSpan={3} className="p-10 text-center text-muted-foreground">No users match these filters.</td></tr> : rows.map((user) => <tr key={user.id} className="hover:bg-muted/30"><td className="p-3 font-medium">{user.firstName} {user.lastName}</td><td className="p-3 text-muted-foreground">{user.email}</td><td className="p-3"><select value={user.role} onChange={(event) => void assignRole(user, event.target.value)} aria-label={`Role for ${user.firstName} ${user.lastName}`} className="h-9 rounded-md border border-input bg-background px-2 text-xs">{Object.values(UserRole).map((role) => <option key={role} value={role}>{role.replaceAll('_', ' ')}</option>)}</select></td></tr>)}</tbody></table><footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-xs text-muted-foreground"><span>{total === 0 ? '0 users' : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} of ${total} users`}</span><div className="flex gap-2"><button disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)} className="rounded-md border border-input px-3 py-1.5 hover:bg-accent disabled:opacity-50">Previous</button><button disabled={page >= totalPages || loading} onClick={() => setPage((current) => current + 1)} className="rounded-md border border-input px-3 py-1.5 hover:bg-accent disabled:opacity-50">Next</button></div></footer></section>
  </div>;
}

export function DepartmentHeadRequestsPage(){const[userDepartment,setUserDepartment]=useState('');const[rows,setRows]=useState<Row[]>([]);const[error,setError]=useState('');const user=useAuthStore(s=>s.user);useEffect(()=>{void (async()=>{try{const{data}=await api.get('/employees',{params:{userId:user?.id,page:1,limit:1}});const employee=data.employees?.[0];const dept=employee?.departments?.[0]?.id;if(!dept)throw new Error('No department is assigned to your employee record.');setUserDepartment(dept);const req=await api.get('/hiring-requests',{params:{departmentId:dept,page:1,limit:100}});setRows(req.data.hiringRequests??[])}catch(e){setError(getApiErrorMessage(e,'Could not load your department requests.'))}})()},[user?.id]);return <div className="space-y-4"><Message error={error}/><p className="text-sm text-muted-foreground">{userDepartment?'Requests are scoped to your assigned department.':'Resolving your department…'}</p>{rows.map(r=><article key={r.id} className={box}><h2 className="font-semibold">{r.position}</h2><p className="mt-1 text-sm text-muted-foreground">{r.status} · {r.employmentType?.replaceAll('_',' ')} · {r.isTeaching?'Teaching':'Non-teaching'}</p></article>)}{!rows.length&&!error&&<p className={box}>No staffing requests found.</p>}</div>}

export function EmployeeDocumentsPage(){const[docs,setDocs]=useState<Row|null>(null);const[error,setError]=useState('');const labels:Record<string,string>={validId:'Valid ID',tin:'TIN',sss:'SSS',philhealth:'PhilHealth',pagIbig:'Pag-IBIG',medicalRecord:'Medical record',psa:'PSA',birForm:'BIR form',nbiClearance:'NBI clearance'};useEffect(()=>{void api.get('/employees/me/document-status').then(({data})=>setDocs(data)).catch(e=>setError(getApiErrorMessage(e,'Could not load your documents.')))},[]);const status=docs?.status as Record<string,string>|undefined;const complete=Object.keys(labels).filter(key=>status?.[key]==='complete').length;return <section className={box}><div className="flex items-center justify-between"><div><h2 className="font-semibold">My employee documents</h2><p className="mt-1 text-sm text-muted-foreground">{complete} of {Object.keys(labels).length} checklist items complete</p></div>{docs&&<span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">{complete}/{Object.keys(labels).length}</span>}</div><Message error={error}/>{docs&&<div className="mt-4 divide-y">{Object.entries(labels).map(([key,label])=><div key={key} className="flex justify-between py-3 text-sm"><span>{label}{key==='validId'&&<span className="ml-1 text-xs text-muted-foreground">({docs.idRecords?.length??0}/2 presented)</span>}</span><span className={`rounded-full px-2.5 py-1 text-xs ${status?.[key]==='complete'?'bg-emerald-500/10 text-emerald-700':'bg-muted text-muted-foreground'}`}>{status?.[key]??'pending'}</span></div>)}</div>}</section>}

export function PlaceholderWorkflowPage({title}:{title:string}){return <section className={box}><h2 className="font-semibold">{title}</h2><p className="mt-2 text-sm text-muted-foreground">This role-specific view is connected to the hiring workflow. Use the dedicated actions on the related resource page.</p></section>}
