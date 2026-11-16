import { useState, type FormEvent } from 'react';
import { Settings2 } from 'lucide-react';
import { UserRole, type CurrentUser } from '@ats/shared-types';
import { api } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/getApiErrorMessage';
import { useAuthStore } from '@/stores/authStore';

const roles = Object.values(UserRole);

export function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const [profile, setProfile] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    phoneNumber: user?.phoneNumber ?? '',
    education: user?.education ?? '',
  });
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState<string>(UserRole.Employee);
  const [roleMessage, setRoleMessage] = useState('');
  const [roleError, setRoleError] = useState('');
  const [savingRole, setSavingRole] = useState(false);

  function updateProfileField(field: keyof typeof profile, value: string) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingProfile(true);
    setProfileMessage('');
    setProfileError('');
    try {
      const { data } = await api.patch<{ user: CurrentUser }>('/me', profile);
      setAuthenticated(data.user);
      setProfile({
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        email: data.user.email,
        phoneNumber: data.user.phoneNumber ?? '',
        education: data.user.education,
      });
      setProfileMessage('Your account information has been updated.');
    } catch (requestError) {
      setProfileError(getApiErrorMessage(requestError, 'Could not update your account information.'));
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordMessage('');
    setPasswordError('');
    if (newPassword !== confirmPassword) {
      setPasswordError('The new passwords do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      await api.patch('/me/password', { currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMessage('Your password has been changed.');
    } catch (requestError) {
      setPasswordError(getApiErrorMessage(requestError, 'Could not change your password.'));
    } finally {
      setSavingPassword(false);
    }
  }

  async function assignRole(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingRole(true);
    setRoleMessage('');
    setRoleError('');
    try {
      await api.patch(`/users/${userId.trim()}/role`, { role });
      setRoleMessage('User role updated. The user may need to sign in again for permissions to refresh.');
      setUserId('');
    } catch (requestError) {
      setRoleError(getApiErrorMessage(requestError, 'Could not update this user role.'));
    } finally {
      setSavingRole(false);
    }
  }

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-xl font-semibold">Settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account information and password.</p>
      </header>

      <section className="max-w-3xl rounded-xl border border-border bg-card p-5 shadow-sm">
        <h3 className="text-sm font-semibold">Account information</h3>
        <form onSubmit={(event) => void saveProfile(event)} className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-xs font-medium">
            First name
            <input
              required
              value={profile.firstName}
              onChange={(event) => updateProfileField('firstName', event.target.value)}
              autoComplete="given-name"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-normal"
            />
          </label>
          <label className="space-y-1.5 text-xs font-medium">
            Last name
            <input
              required
              value={profile.lastName}
              onChange={(event) => updateProfileField('lastName', event.target.value)}
              autoComplete="family-name"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-normal"
            />
          </label>
          <label className="space-y-1.5 text-xs font-medium">
            Email
            <input
              required
              type="email"
              value={profile.email}
              onChange={(event) => updateProfileField('email', event.target.value)}
              autoComplete="email"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-normal"
            />
          </label>
          <label className="space-y-1.5 text-xs font-medium">
            Phone number
            <input
              value={profile.phoneNumber}
              onChange={(event) => updateProfileField('phoneNumber', event.target.value)}
              autoComplete="tel"
              maxLength={30}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-normal"
            />
          </label>
          <label className="space-y-1.5 text-xs font-medium sm:col-span-2">
            Education
            <input
              required
              value={profile.education}
              onChange={(event) => updateProfileField('education', event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-normal"
            />
          </label>
          {profileError && <p role="alert" className="text-sm text-destructive sm:col-span-2">{profileError}</p>}
          {profileMessage && <p role="status" className="text-sm text-emerald-700 sm:col-span-2">{profileMessage}</p>}
          <div className="sm:col-span-2">
            <button disabled={savingProfile} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
              {savingProfile ? 'Saving…' : 'Save account information'}
            </button>
          </div>
        </form>
      </section>

      <section className="max-w-3xl rounded-xl border border-border bg-card p-5 shadow-sm">
        <h3 className="text-sm font-semibold">Change password</h3>
        <p className="mt-1 text-xs text-muted-foreground">Enter your current password before choosing a new one.</p>
        <form onSubmit={(event) => void changePassword(event)} className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-xs font-medium sm:col-span-2">
            Current password
            <input
              required
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              autoComplete="current-password"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-normal"
            />
          </label>
          <label className="space-y-1.5 text-xs font-medium">
            New password
            <input
              required
              type="password"
              minLength={8}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-normal"
            />
          </label>
          <label className="space-y-1.5 text-xs font-medium">
            Confirm new password
            <input
              required
              type="password"
              minLength={8}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-normal"
            />
          </label>
          {passwordError && <p role="alert" className="text-sm text-destructive sm:col-span-2">{passwordError}</p>}
          {passwordMessage && <p role="status" className="text-sm text-emerald-700 sm:col-span-2">{passwordMessage}</p>}
          <div className="sm:col-span-2">
            <button disabled={savingPassword} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
              {savingPassword ? 'Updating…' : 'Change password'}
            </button>
          </div>
        </form>
      </section>

      {user?.role === UserRole.Admin && (
        <section className="max-w-2xl rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Settings2 className="size-4 text-primary" />
            Assign a user role
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">Role assignment requires the target user ID and is restricted to administrators by the API.</p>
          <form onSubmit={(event) => void assignRole(event)} className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 text-xs font-medium sm:col-span-2">
              User ID
              <input
                required
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-normal"
              />
            </label>
            <label className="space-y-1.5 text-xs font-medium sm:col-span-2">
              New role
              <select
                value={role}
                onChange={(event) => setRole(event.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-normal"
              >
                {roles.map((value) => <option key={value} value={value}>{value.replaceAll('_', ' ')}</option>)}
              </select>
            </label>
            {roleError && <p role="alert" className="text-sm text-destructive sm:col-span-2">{roleError}</p>}
            {roleMessage && <p role="status" className="text-sm text-emerald-700 sm:col-span-2">{roleMessage}</p>}
            <div className="sm:col-span-2">
              <button disabled={savingRole} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
                {savingRole ? 'Saving…' : 'Update role'}
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
