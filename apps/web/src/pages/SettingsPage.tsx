import { useState, type FormEvent } from 'react';
import { Settings2 } from 'lucide-react';
import { UserRole } from '@ats/shared-types';
import { api } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/getApiErrorMessage';
import { useAuthStore } from '@/stores/authStore';

const roles = Object.values(UserRole);

export function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState<string>(UserRole.Employee);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function assignRole(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage(''); setError('');
    try { await api.patch(`/users/${userId.trim()}/role`, { role }); setMessage('User role updated. The user may need to sign in again for permissions to refresh.'); setUserId(''); }
    catch (requestError) { setError(getApiErrorMessage(requestError, 'Could not update this user role.')); }
    finally { setSaving(false); }
  }

  return <div className="space-y-5"><header><h2 className="text-xl font-semibold">Settings</h2><p className="mt-1 text-sm text-muted-foreground">Account information and access management.</p></header><section className="rounded-xl border border-border bg-card p-5 shadow-sm"><h3 className="text-sm font-semibold">Signed-in account</h3><dl className="mt-4 grid gap-4 sm:grid-cols-3"><div><dt className="text-xs text-muted-foreground">Name</dt><dd className="mt-1 text-sm font-medium">{user ? `${user.firstName} ${user.lastName}` : '—'}</dd></div><div><dt className="text-xs text-muted-foreground">Email</dt><dd className="mt-1 text-sm font-medium">{user?.email}</dd></div><div><dt className="text-xs text-muted-foreground">Role</dt><dd className="mt-1 text-sm font-medium">{user?.role.replaceAll('_', ' ')}</dd></div></dl></section><section className="max-w-2xl rounded-xl border border-border bg-card p-5 shadow-sm"><h3 className="flex items-center gap-2 text-sm font-semibold"><Settings2 className="size-4 text-primary" />Assign a user role</h3><p className="mt-1 text-xs text-muted-foreground">Role assignment requires the target user ID and is restricted to administrators by the API.</p><form onSubmit={(event) => void assignRole(event)} className="mt-4 grid gap-4 sm:grid-cols-2"><label className="space-y-1.5 text-xs font-medium sm:col-span-2">User ID<input required value={userId} onChange={(event) => setUserId(event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-normal" /></label><label className="space-y-1.5 text-xs font-medium sm:col-span-2">New role<select value={role} onChange={(event) => setRole(event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-normal">{roles.map((value) => <option key={value} value={value}>{value.replaceAll('_', ' ')}</option>)}</select></label>{error && <p role="alert" className="sm:col-span-2 text-sm text-destructive">{error}</p>}{message && <p role="status" className="sm:col-span-2 text-sm text-emerald-700">{message}</p>}<div className="sm:col-span-2"><button disabled={saving} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">{saving ? 'Saving…' : 'Update role'}</button></div></form></section></div>;
}
