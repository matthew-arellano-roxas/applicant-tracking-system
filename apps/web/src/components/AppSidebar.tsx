import {
  BriefcaseBusiness,
  Building2,
  ClipboardList,
  CircleHelp,
  FileUser,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  UsersRound,
  X,
} from 'lucide-react';
import { Link, NavLink } from 'react-router';
import type { CurrentUser } from '@ats/shared-types';
import crest from '@/assets/bcp-olp-logo-mini2.png';
import { getUserInitials, getUserName } from '@/lib/userDisplay';
import { getWorkspacePagesForRole } from '@/config/workspacePages';

const navigationIcons = {
  a_jobs: BriefcaseBusiness, a_apps: FileUser, a_interviews: CalendarDays, a_cv: FileUser,
  h_dash: LayoutDashboard, h_apps: FileUser, h_requests: ClipboardList, h_posts: BriefcaseBusiness, h_interviews: CalendarDays, h_employees: UsersRound,
  d_requests: BriefcaseBusiness, d_eval: CalendarDays, n_queue: BriefcaseBusiness,
  m_users: UsersRound, m_depts: Building2, e_interviews: CalendarDays, e_documents: FileUser,
};

type AppSidebarProps = {
  user: CurrentUser;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
};

export function AppSidebar({ user, isOpen, onClose, onLogout }: AppSidebarProps) {
  const initials = getUserInitials(user);
  const navigation = getWorkspacePagesForRole(user.role);

  return (
    <>
      {isOpen && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-[2px] lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`app-sidebar-scroll fixed inset-y-0 left-0 z-50 flex w-[240px] flex-col overflow-y-auto overscroll-contain border-r border-sidebar-border bg-sidebar px-3 py-4 text-sidebar-foreground transition-transform duration-200 lg:sticky lg:top-0 lg:h-dvh lg:min-h-0 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-9 shrink-0 items-center justify-between px-1">
          <Link to="/" className="flex items-center" onClick={onClose}>
            <img src={crest} alt="Bestlink College of the Philippines" className="h-9 w-9 object-contain" />
            <span className="ml-2 text-sm font-semibold tracking-tight">Bestlink ATS</span>
          </Link>
          <button
            className="rounded-md p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground lg:hidden"
            aria-label="Close navigation"
            onClick={onClose}
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-7 flex shrink-0 flex-col items-center border-b border-sidebar-border px-2 pb-7 pt-2 text-center">
          <span className="flex size-[86px] items-center justify-center rounded-full bg-sidebar-accent text-[28px] font-semibold text-sidebar-foreground">{initials}</span>
          <span className="mt-5 max-w-full truncate text-sm font-semibold">{getUserName(user)}</span>
          <span className="mt-1 max-w-full truncate text-xs text-sidebar-foreground/65">{user.email}</span>
        </div>

        <div className="mt-7 shrink-0 px-2 text-[11px] font-semibold uppercase tracking-wide text-sidebar-primary">{user.role.replaceAll('_', ' ')} workspace</div>
        <nav aria-label="Main navigation" className="mt-2 shrink-0 space-y-1">
          {navigation.map(({ key, label, path }) => {
            const Icon = navigationIcons[key as keyof typeof navigationIcons];
            return (
              <NavLink
                key={path}
                to={path}
                end
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-md px-3 py-2.5 text-[13px] font-medium transition-colors ${isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm' : 'text-sidebar-foreground/75 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground'}`
                }
              >
                <Icon className="size-[17px] shrink-0" strokeWidth={1.8} />
                <span className="flex-1">{label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto shrink-0 space-y-1 border-t border-sidebar-border pt-3">
          <a href="mailto:hr@bestlink.edu.ph" className="flex items-center gap-3 rounded-md px-2.5 py-2 text-[13px] font-medium text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground">
            <CircleHelp className="size-[17px]" strokeWidth={1.8} />Help and support
          </a>
          <button onClick={onLogout} className="flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left text-[13px] font-medium text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground">
            <LogOut className="size-[17px]" strokeWidth={1.8} />Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
