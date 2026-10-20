import { useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import { AppHeader } from '@/components/AppHeader';
import { AppSidebar } from '@/components/AppSidebar';
import { useLogout } from '@/hooks/useLogout';
import { useAuthStore } from '@/stores/authStore';
import { getWorkspacePage } from '@/config/workspacePages';

export function AppLayout() {
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  const logout = useLogout();
  const page = getWorkspacePage(location.pathname);
  const pageName = page?.label ?? 'Workspace';

  if (!user) return null;

  return (
    <div className="grid h-dvh min-h-0 grid-cols-1 overflow-hidden bg-background text-foreground lg:grid-cols-[240px_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)]">
      <AppSidebar
        user={user}
        isOpen={mobileNavigationOpen}
        onClose={() => setMobileNavigationOpen(false)}
        onLogout={logout}
      />

      <div className="flex h-dvh min-h-0 min-w-0 flex-col overflow-hidden">
        <AppHeader
          pageName={pageName}
          user={user}
          onOpenNavigation={() => setMobileNavigationOpen(true)}
          onLogout={logout}
        />

        <div className="app-main-scroll flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
          <div className="border-b border-border bg-card px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1400px]">
              <div className="mb-2 text-xs font-medium text-primary">{user.role.replaceAll('_', ' ')}</div>
              <h1 className="text-3xl font-semibold tracking-tight">{pageName}</h1>
              {page && <p className="mt-3 border-l-2 border-primary/40 pl-3 text-xs text-muted-foreground">{page.access}</p>}
            </div>
          </div>

          <main className="flex-1 bg-background px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
            <div className="mx-auto w-full max-w-[1400px]">
              <Outlet />
            </div>
          </main>
          <footer className="border-t border-border bg-card px-4 py-3 text-center text-[11px] text-muted-foreground sm:px-6 lg:px-8">
            Bestlink College of the Philippines <span className="mx-1.5">·</span> Applicant Tracking System
          </footer>
        </div>
      </div>
    </div>
  );
}
