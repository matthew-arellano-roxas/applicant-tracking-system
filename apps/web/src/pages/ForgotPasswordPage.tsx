import { Link } from 'react-router';
import crest from '@/assets/bcp-olp-logo-mini2.png';
import { AuthBrandPanel } from '@/components/AuthBrandPanel';
import { usePasswordResetForm } from '@/hooks/usePasswordResetForm';

export function ForgotPasswordPage() {
  const {
    step, email, setEmail, otp, setOtp, password, setPassword,
    confirmPassword, setConfirmPassword, busy, error, message,
    requestCode, resetPassword, changeEmail,
  } = usePasswordResetForm();

  return (
    <main className="grid h-dvh overflow-hidden bg-background md:grid-cols-2">
      <section className="flex h-dvh items-center justify-center overflow-y-auto bg-card px-5 py-6 sm:px-10">
        <div className="w-full max-w-[420px]">
          <div className="mb-5 flex justify-center">
            <img src={crest} alt="Bestlink College of the Philippines" className="h-20 w-24 object-contain" />
          </div>

          {step === 'success' ? (
            <div className="text-center">
              <h1 className="text-2xl font-semibold tracking-tight">Password updated</h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{message}</p>
              <Link to="/login" className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Return to sign in</Link>
            </div>
          ) : (
            <>
              <header className="mb-6">
                <h1 className="text-center text-2xl font-semibold tracking-tight">{step === 'email' ? 'Forgot password?' : 'Set a new password'}</h1>
                <p className="mt-2 text-center text-sm leading-6 text-muted-foreground">
                  {step === 'email'
                    ? 'Enter the email address associated with your account. We’ll send a reset code if an account is registered.'
                    : `Enter the code sent to ${email} and choose a new password.`}
                </p>
              </header>

              {step === 'email' ? (
                <form onSubmit={(event) => void requestCode(event)} className="space-y-4">
                  <label htmlFor="resetEmail" className="block text-sm font-medium">Email address</label>
                  <input id="resetEmail" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="-mt-3 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30" />
                  {error && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</p>}
                  <button disabled={busy} className="inline-flex h-11 w-full items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">{busy ? 'Sending code…' : 'Send reset code'}</button>
                </form>
              ) : (
                <form onSubmit={(event) => void resetPassword(event)} className="space-y-4">
                  {message && <p role="status" className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-foreground">{message}</p>}
                  <label htmlFor="resetOtp" className="block text-sm font-medium">Email verification code</label>
                  <input id="resetOtp" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="6-digit code" className="-mt-3 h-11 w-full rounded-md border border-input bg-background px-3 text-center text-lg tracking-[0.3em] outline-none focus-visible:ring-2 focus-visible:ring-ring/30" />
                  <label htmlFor="newPassword" className="block text-sm font-medium">New password</label>
                  <input id="newPassword" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} className="-mt-3 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30" />
                  <label htmlFor="confirmNewPassword" className="block text-sm font-medium">Confirm new password</label>
                  <input id="confirmNewPassword" type="password" autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="-mt-3 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30" />
                  {error && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</p>}
                  <button disabled={busy} className="inline-flex h-11 w-full items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">{busy ? 'Updating password…' : 'Update password'}</button>
                  <div className="flex justify-between text-xs"><button type="button" onClick={() => void requestCode()} disabled={busy} className="font-medium text-primary hover:underline disabled:opacity-50">Resend code</button><button type="button" onClick={changeEmail} className="text-muted-foreground hover:text-foreground">Change email</button></div>
                </form>
              )}

              <p className="mt-5 text-center text-sm text-muted-foreground">Remember your password? <Link to="/login" className="font-semibold text-primary hover:underline">Sign in</Link></p>
            </>
          )}
        </div>
      </section>
      <AuthBrandPanel />
    </main>
  );
}
