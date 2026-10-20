import { useEffect, useState } from 'react';
import { Bell, ChevronDown, ChevronRight, LogOut, Menu, Search, X } from 'lucide-react';
import { Link } from 'react-router';
import type { CurrentUser } from '@ats/shared-types';
import { getUserInitials, getUserName } from '@/lib/userDisplay';
import { getWorkspacePagesForRole } from '@/config/workspacePages';

type AppHeaderProps = {
  pageName: string;
  user: CurrentUser;
  onOpenNavigation: () => void;
  onLogout: () => void;
};

export function AppHeader({ pageName, user, onOpenNavigation, onLogout }: AppHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [query, setQuery] = useState('');
  const searchablePages = getWorkspacePagesForRole(user.role);
  const matches = searchablePages.filter((page) => page.label.toLowerCase().includes(query.trim().toLowerCase()));

  useEffect(() => {
    function handleSearchShortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen((open) => !open);
        setNotificationsOpen(false);
        setAccountOpen(false);
      }
      if (event.key === 'Escape') {
        setSearchOpen(false);
        setNotificationsOpen(false);
        setAccountOpen(false);
      }
    }

    window.addEventListener('keydown', handleSearchShortcut);
    return () => window.removeEventListener('keydown', handleSearchShortcut);
  }, []);

  function toggleSearch() {
    setSearchOpen((open) => !open);
    setNotificationsOpen(false);
    setAccountOpen(false);
  }

  return (
    <header className="relative z-30 flex h-[61px] shrink-0 items-center gap-3 border-b border-border bg-card/95 px-4 sm:px-6 lg:px-8">
      <button
        aria-label="Open navigation"
        className="-ml-1 rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
        onClick={onOpenNavigation}
      >
        <Menu className="size-[18px]" />
      </button>
      <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
        <span>Workspace</span><ChevronRight className="size-3.5" /><span className="font-medium text-foreground">{pageName}</span>
      </div>
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <button
          className="flex size-8 items-center justify-center gap-2 rounded-md border border-input bg-background px-2.5 text-xs text-muted-foreground shadow-sm hover:bg-accent sm:w-auto sm:justify-start"
          aria-label="Search pages"
          aria-expanded={searchOpen}
          onClick={toggleSearch}
        >
          <Search className="size-3.5" /><span className="hidden sm:inline">Search pages</span>
          <kbd className="ml-5 hidden rounded border bg-muted px-1 py-0.5 font-sans text-[10px] sm:inline">Ctrl K</kbd>
        </button>
        <button
          className={`rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground ${notificationsOpen ? 'bg-accent text-foreground' : ''}`}
          aria-label="Notifications"
          aria-expanded={notificationsOpen}
          onClick={() => { setNotificationsOpen((open) => !open); setSearchOpen(false); setAccountOpen(false); }}
        >
          <Bell className="size-[17px]" strokeWidth={1.8} />
        </button>
        <span className="mx-0.5 hidden h-5 w-px bg-border sm:block" />
        <button
          className={`flex items-center gap-2 rounded-md p-1 hover:bg-accent ${accountOpen ? 'bg-accent' : ''}`}
          aria-label="Account menu"
          aria-expanded={accountOpen}
          onClick={() => { setAccountOpen((open) => !open); setSearchOpen(false); setNotificationsOpen(false); }}
        >
          <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">{getUserInitials(user)}</span>
          <ChevronDown className="hidden size-3.5 text-muted-foreground sm:block" />
        </button>
      </div>

      {searchOpen && (
        <section className="absolute right-4 top-[calc(100%+8px)] w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-border bg-card p-2 shadow-lg sm:right-6" aria-label="Search pages">
          <div className="flex items-center gap-2 rounded-md border border-input px-3">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a page..." className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
            <button aria-label="Close search" onClick={() => setSearchOpen(false)} className="rounded p-1 text-muted-foreground hover:bg-accent"><X className="size-4" /></button>
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {matches.length ? matches.map((page) => (
              <Link key={page.path} to={page.path} onClick={() => setSearchOpen(false)} className="block rounded-md px-3 py-2 text-sm hover:bg-accent">{page.label}</Link>
            )) : <p className="px-3 py-4 text-center text-sm text-muted-foreground">No matching pages</p>}
          </div>
        </section>
      )}

      {notificationsOpen && (
        <section className="absolute right-12 top-[calc(100%+8px)] w-[min(20rem,calc(100vw-2rem))] rounded-lg border border-border bg-card p-4 shadow-lg sm:right-16" aria-label="Notifications">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Notifications</h2>
            <button aria-label="Close notifications" onClick={() => setNotificationsOpen(false)} className="rounded p-1 text-muted-foreground hover:bg-accent"><X className="size-4" /></button>
          </div>
          <div className="py-8 text-center">
            <span className="mx-auto flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground"><Bell className="size-5" /></span>
            <p className="mt-3 text-sm font-medium">You’re all caught up</p>
            <p className="mt-1 text-xs text-muted-foreground">New notifications will appear here.</p>
          </div>
        </section>
      )}

      {accountOpen && (
        <section className="absolute right-4 top-[calc(100%+8px)] w-64 rounded-lg border border-border bg-card p-2 shadow-lg sm:right-6" aria-label="Account menu">
          <div className="border-b border-border px-3 py-2">
            <p className="truncate text-sm font-medium">{getUserName(user)}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          <button onClick={onLogout} className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10">
            <LogOut className="size-4" />Sign out
          </button>
        </section>
      )}
    </header>
  );
}
