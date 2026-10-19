export function AuthBrandPanel() {
  return (
    <aside className="relative hidden h-dvh overflow-hidden bg-brand-panel text-white md:flex md:items-center md:px-12 lg:px-16 xl:px-20">
      <div aria-hidden="true" className="pointer-events-none absolute -left-[430px] -top-[505px] size-[940px] rounded-full border-[160px] border-brand-panel-shadow" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-[500px] -right-[370px] size-[850px] rounded-full border-[160px] border-brand-panel-shadow" />
      <div aria-hidden="true" className="login-dot-grid pointer-events-none absolute right-2 top-2 size-[180px] opacity-60" />

      <div className="relative z-10 ml-0 max-w-[560px] lg:ml-4 xl:ml-8">
        <h2 className="text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl xl:text-[56px]">Applicant Tracking System</h2>
        <p className="mt-7 pl-5 text-base font-semibold text-white/95 sm:text-lg">Recruitment starts with a great team.</p>
      </div>
    </aside>
  );
}
