import { Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router';
import crest from '@/assets/bcp-olp-logo-mini2.png';
import { AuthBrandPanel } from '@/components/AuthBrandPanel';
import { useLoginForm } from '@/hooks/useLoginForm';

export function LoginPage() {
  const { email, setEmail, password, setPassword, passwordVisible, togglePasswordVisibility,
    isSubmitting, errorMessage, registeredEmail, handleSubmit } = useLoginForm();

  return (
    <main className="grid h-dvh overflow-hidden bg-background md:grid-cols-2">
      <section className="flex h-dvh items-center justify-center overflow-hidden bg-card px-6 py-5 sm:px-10 sm:py-8">
        <div className="w-full max-w-[360px]">
          <div className="mb-[clamp(1rem,3.7vh,2rem)] flex justify-center">
            <img src={crest} alt="Bestlink College of the Philippines" className="h-[clamp(112px,18vh,160px)] w-[145px] object-contain" />
          </div>

          <h1 className="mb-[clamp(1rem,3.7vh,2rem)] text-center text-[34px] font-semibold leading-none tracking-tight">Sign in</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email address <span aria-hidden="true">*</span></label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@bestlink.edu.ph"
                className="h-[clamp(44px,6.2vh,54px)] w-full rounded-md border border-input bg-background px-4 text-sm shadow-sm outline-none transition placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Password <span aria-hidden="true">*</span></label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={passwordVisible ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="h-[clamp(44px,6.2vh,54px)] w-full rounded-md border border-input bg-background px-4 pr-12 text-sm shadow-sm outline-none transition placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                />
                <button
                  type="button"
                  aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {passwordVisible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">{errorMessage}</div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 inline-flex h-[clamp(46px,6.4vh,55px)] w-full items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60"
            >
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {registeredEmail && (
            <p className="mt-4 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-center text-xs text-foreground">
              Account created. Sign in to continue.
            </p>
          )}
          <div className="mt-5 text-center text-xs leading-5 text-muted-foreground">
            <p>Applying for a position? Applicants can register here to apply and track their status.</p>
            <Link to="/register" className="mt-1 inline-block font-semibold text-primary underline-offset-4 hover:underline">Create an applicant account</Link>
          </div>
        </div>
      </section>

      <AuthBrandPanel />
    </main>
  );
}
