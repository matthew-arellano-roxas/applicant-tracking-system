import { BriefcaseBusiness, ClipboardList } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { HiringRequestsPage } from './HiringRequestsPage';
import { JobsPage } from './JobsPage';

type Tab = 'requests' | 'published';

export function JobPostsWorkspacePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const tab: Tab = location.pathname.endsWith('/published') ? 'published' : 'requests';
  return <div className="space-y-5">
    <header>
      <h1 className="text-2xl font-semibold tracking-tight">Hiring and job posts</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage staffing requests and the published openings linked to them.</p>
    </header>
    <div role="tablist" aria-label="Hiring and job posts" className="grid w-full max-w-full grid-cols-2 gap-1 rounded-lg border border-border bg-muted/60 p-1 sm:w-fit">
      <button role="tab" aria-selected={tab === 'requests'} onClick={() => navigate('/h/job-posts')} className={`inline-flex min-w-0 items-center justify-center gap-2 rounded-md px-2 py-2 text-xs font-medium transition-colors sm:px-3 sm:text-sm ${tab === 'requests' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}><ClipboardList className="size-4 shrink-0" /><span className="truncate">Hiring requests</span></button>
      <button role="tab" aria-selected={tab === 'published'} onClick={() => navigate('/h/job-posts/published')} className={`inline-flex min-w-0 items-center justify-center gap-2 rounded-md px-2 py-2 text-xs font-medium transition-colors sm:px-3 sm:text-sm ${tab === 'published' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}><BriefcaseBusiness className="size-4 shrink-0" /><span className="truncate">Published posts</span></button>
    </div>
    <div role="tabpanel">{tab === 'requests' ? <HiringRequestsPage /> : <JobsPage />}</div>
  </div>;
}
