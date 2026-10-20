import type { ReactNode } from 'react';
import { Link, Navigate } from 'react-router';
import { canAccessWorkspacePage, getDefaultWorkspacePath, type WorkspacePageKey } from '@/config/workspacePages';
import { useAuthStore } from '@/stores/authStore';

export function PageAccessGuard({ pageKey, children }: { pageKey: WorkspacePageKey; children: ReactNode }) {
  const user = useAuthStore((state) => state.user);

  if (!user) return null;
  if (canAccessWorkspacePage(pageKey, user.role)) return children;

  return (
    <section className="mx-auto max-w-xl rounded-xl border border-border bg-card p-6 text-center shadow-sm sm:p-8">
      <h2 className="text-lg font-semibold">You don’t have access to this page</h2>
      <p className="mt-2 text-sm text-muted-foreground">Your account role does not include access to this section.</p>
      <Link to={getDefaultWorkspacePath(user.role)} className="mt-5 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
        Go to your workspace
      </Link>
    </section>
  );
}

export function WorkspaceFallback() {
  const user = useAuthStore((state) => state.user);
  if (!user) return null;
  return <Navigate to={getDefaultWorkspacePath(user.role)} replace />;
}
