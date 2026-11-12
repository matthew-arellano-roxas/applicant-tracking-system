export function WorkspacePage() {
  return (
    <section>
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-5 py-4 sm:px-6">
          <div className="text-sm font-medium">Start building this page</div>
          <p className="mt-1 text-sm text-muted-foreground">This route is ready for your page content.</p>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-3 sm:p-6">
          {[
            ['01', 'Add your data', 'Connect this page to the relevant API route.'],
            ['02', 'Build the interface', 'Compose the view from the shared theme and UI patterns.'],
            ['03', 'Wire up actions', 'Add forms and route actions when the workflow is ready.'],
          ].map(([number, heading, description]) => (
            <div key={number} className="rounded-lg border border-border bg-background p-4">
              <span className="mb-4 flex size-7 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">{number}</span>
              <h2 className="text-sm font-medium">{heading}</h2>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
