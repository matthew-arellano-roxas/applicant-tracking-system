import { Link } from 'react-router';
import crest from '@/assets/bcp-olp-logo-mini2.png';
import { AuthBrandPanel } from '@/components/AuthBrandPanel';
import { useRegistrationForm } from '@/hooks/useRegistrationForm';

export function RegisterPage() {
  const {
    step, firstName, setFirstName, lastName, setLastName, email, setEmail,
    phoneNumber, setPhoneNumber, education, setEducation, password, setPassword,
    confirmPassword, setConfirmPassword, otp, setOtp, isSubmitting, errorMessage,
    submitDetails, verifyEmail, returnToDetails,
  } = useRegistrationForm();

  return (
    <main className="grid h-dvh overflow-hidden bg-background md:grid-cols-2">
      <section className="flex h-dvh items-center justify-center overflow-y-auto bg-card px-5 py-5 sm:px-10 sm:py-8">
        <div className="w-full max-w-[470px]">
          <div className="mb-3 flex justify-center">
            <img src={crest} alt="Bestlink College of the Philippines" className="h-[clamp(68px,10vh,88px)] w-[90px] object-contain" />
          </div>
          <div className="mb-4 text-center">
            <h1 className="text-[27px] font-semibold leading-tight tracking-tight">
              {step === 'details' ? 'Create an applicant account' : 'Verify your email'}
            </h1>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {step === 'details'
                ? 'Applying for a position at Bestlink? Register here to submit your application and track its status.'
                : `Enter the verification code sent to ${email}.`}
            </p>
          </div>

          {step === 'details' ? (
            <form onSubmit={submitDetails} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="firstName" className="text-xs font-medium">First name <span aria-hidden="true">*</span></label>
                  <input id="firstName" autoComplete="given-name" required value={firstName} onChange={(event) => setFirstName(event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30" />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="lastName" className="text-xs font-medium">Last name <span aria-hidden="true">*</span></label>
                  <input id="lastName" autoComplete="family-name" required value={lastName} onChange={(event) => setLastName(event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30" />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="registerEmail" className="text-xs font-medium">Email address <span aria-hidden="true">*</span></label>
                  <input id="registerEmail" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30" />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="phoneNumber" className="text-xs font-medium">Phone number <span className="font-normal text-muted-foreground">(optional)</span></label>
                  <input id="phoneNumber" type="tel" autoComplete="tel" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="education" className="text-xs font-medium">Education <span aria-hidden="true">*</span></label>
                <input id="education" required value={education} onChange={(event) => setEducation(event.target.value)} placeholder="Highest degree or current education" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="registerPassword" className="text-xs font-medium">Password <span aria-hidden="true">*</span></label>
                  <input id="registerPassword" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30" />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="confirmPassword" className="text-xs font-medium">Confirm password <span aria-hidden="true">*</span></label>
                  <input id="confirmPassword" type="password" autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30" />
                </div>
              </div>

              {errorMessage && <div role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">{errorMessage}</div>}

              <button type="submit" disabled={isSubmitting} className="inline-flex h-11 w-full items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60">
                {isSubmitting ? 'Sending verification code…' : 'Create account'}
              </button>
            </form>
          ) : (
            <form onSubmit={verifyEmail} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="otp" className="text-xs font-medium">Verification code</label>
                <input id="otp" inputMode="numeric" autoComplete="one-time-code" required value={otp} onChange={(event) => setOtp(event.target.value)} className="h-11 w-full rounded-md border border-input bg-background px-3 text-center text-lg tracking-[0.3em] shadow-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30" />
              </div>
              {errorMessage && <div role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">{errorMessage}</div>}
              <button type="submit" disabled={isSubmitting} className="inline-flex h-11 w-full items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60">
                {isSubmitting ? 'Verifying…' : 'Verify and create account'}
              </button>
              <button type="button" onClick={returnToDetails} className="w-full text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">Back to account details</button>
            </form>
          )}

          <p className="mt-4 text-center text-xs text-muted-foreground">Already have an account? <Link to="/login" className="font-semibold text-primary underline-offset-4 hover:underline">Sign in</Link></p>
        </div>
      </section>
      <AuthBrandPanel />
    </main>
  );
}
