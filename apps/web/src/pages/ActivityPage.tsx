import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { UserRole } from '@ats/shared-types';
import { api } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/getApiErrorMessage';
import { useAuthStore } from '@/stores/authStore';

type ActivityItem = { id: string; title: string; detail: string; date: string; kind: string };
type ApplicationResponse = { applications: { id: string; status: string; applyDate: string; user?: { firstName: string; lastName: string }; jobPost?: { title: string } }[]; pagination: { total: number } };

export function ActivityPage() {
  const user = useAuthStore((state) => state.user);
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    async function load() {
      if (!user) return;
      setLoading(true);
      const isManager = user.role === UserRole.Admin || user.role === UserRole.Hr;
      const requests = await Promise.allSettled([
        api.get<{ jobPosts: { id: string; title: string; status: string; createdAt: string }[] }>('/job-posts', { params: { page: 1, limit: 10 } }),
        api.get<{ hiringRequests: { id: string; position: string; status: string; updatedAt?: string; createdAt?: string }[] }>('/hiring-requests', { params: { page: 1, limit: 10 } }),
        isManager ? api.get<ApplicationResponse>('/applications', { params: { page: 1, limit: 10 } }) : Promise.reject(new Error('Not available')),
        isManager ? api.get<{ interviews: { id: string; status: string; stage: string; date: string; applicant?: { user?: { firstName: string; lastName: string } } }[] }>('/interviews', { params: { page: 1, limit: 10 } }) : Promise.reject(new Error('Not available')),
      ]);
      if (!active) return;
      const [jobs, requestsData, applications, interviews] = requests;
      const activity: ActivityItem[] = [];
      if (jobs.status === 'fulfilled') activity.push(...jobs.value.data.jobPosts.map((job) => ({ id: `job-${job.id}`, title: job.title, detail: `Job opening ${job.status.toLowerCase()}`, date: job.createdAt, kind: 'Job' })));
      if (requestsData.status === 'fulfilled') activity.push(...requestsData.value.data.hiringRequests.map((request) => ({ id: `request-${request.id}`, title: request.position, detail: `Hiring request ${request.status.toLowerCase()}`, date: request.updatedAt ?? request.createdAt ?? '', kind: 'Request' })));
      if (applications.status === 'fulfilled') activity.push(...applications.value.data.applications.map((application) => ({ id: `application-${application.id}`, title: application.user ? `${application.user.firstName} ${application.user.lastName}` : 'Applicant', detail: `Applied for ${application.jobPost?.title ?? 'a position'} · ${application.status.toLowerCase()}`, date: application.applyDate, kind: 'Application' })));
      if (interviews.status === 'fulfilled') activity.push(...interviews.value.data.interviews.map((interview) => ({ id: `interview-${interview.id}`, title: interview.applicant?.user ? `${interview.applicant.user.firstName} ${interview.applicant.user.lastName}` : interview.stage, detail: `${interview.stage.replaceAll('_', ' ')} interview · ${interview.status.toLowerCase()}`, date: interview.date, kind: 'Interview' })));
      setItems(activity.filter((item) => item.date).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      if (requests.every((request) => request.status === 'rejected')) setError(getApiErrorMessage(new Error('failed'), 'Could not load activity.'));
      setLoading(false);
    }
    void load(); return () => { active = false; };
  }, [user]);

  return <div className="space-y-5"><header><h2 className="text-xl font-semibold">Activity</h2><p className="mt-1 text-sm text-muted-foreground">Recent hiring activity assembled from the available API records.</p></header>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<section className="rounded-xl border border-border bg-card shadow-sm"><div className="border-b border-border px-5 py-4"><h3 className="flex items-center gap-2 text-sm font-semibold"><Activity className="size-4 text-primary" />Recent activity</h3></div>{loading ? <p className="p-6 text-sm text-muted-foreground">Loading activity…</p> : items.length === 0 ? <p className="p-6 text-sm text-muted-foreground">No recent activity is available.</p> : <ol className="divide-y divide-border">{items.map((item) => <li key={item.id} className="flex gap-4 px-5 py-4"><span className="mt-1 size-2 shrink-0 rounded-full bg-primary" /><div className="min-w-0 flex-1"><p className="text-sm font-medium">{item.title}</p><p className="mt-1 text-xs text-muted-foreground">{item.detail}</p></div><time className="shrink-0 text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString()}</time></li>)}</ol>}</section></div>;
}
