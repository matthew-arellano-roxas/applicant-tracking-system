import type { ReactNode } from "react";
import type { CurrentUser } from "@ats/shared-types";
import { useAuthStore } from "@/stores/authStore";
import { useOverviewData } from "@/hooks/useOverviewData";
import { UserRole } from "@ats/shared-types";
import { getUserName } from "@/lib/userDisplay";

const roleNames: Record<string, string> = {
  [UserRole.Admin]: "Administrator",
  [UserRole.Hr]: "Human Resources",
  [UserRole.Dean]: "Dean",
  [UserRole.DepartmentHead]: "Department Head",
  [UserRole.Employee]: "Employee",
  [UserRole.Applicant]: "Applicant",
};

function formatDate(value?: string) {
  if (!value) return "Date not provided";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date not provided"
    : new Intl.DateTimeFormat("en-PH", { dateStyle: "medium" }).format(date);
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value?: number;
  detail: string;
}) {
  return (
    <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight">
        {value ?? "—"}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </article>
  );
}

function ListPanel({
  title,
  children,
  emptyMessage,
}: {
  title: string;
  children: ReactNode;
  emptyMessage: string;
}) {
  return (
    <section className="rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <div className="divide-y divide-border px-5">
        {children == null ||
        (Array.isArray(children) && children.length === 0) ? (
          <p className="py-5 text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

export function OverviewPage() {
  const user = useAuthStore((state) => state.user);
  if (!user) return null;

  return <OverviewContent user={user} />;
}

function OverviewContent({ user }: { user: CurrentUser }) {
  const {
    openJobs,
    applications,
    pendingRequests,
    interviews,
    isLoading,
    hasError,
  } = useOverviewData(user);
  const isApplicant = user.role === UserRole.Applicant;
  const canManage = user.role === UserRole.Admin || user.role === UserRole.Hr;
  const greeting =
    new Date().getHours() < 12
      ? "Good morning"
      : new Date().getHours() < 18
        ? "Good afternoon"
        : "Good evening";

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="bg-primary px-6 py-6 text-primary-foreground sm:px-8">
          <p className="text-xs font-medium text-primary-foreground/75">
            {roleNames[user.role] ?? "Workspace"}
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            {greeting}, {getUserName(user)}
          </h2>
          <p className="mt-2 text-sm text-primary-foreground/80">
            {isApplicant
              ? "Check open positions and keep track of your applications."
              : "Here is the latest activity across your hiring workspace."}
          </p>
        </div>
        {hasError && (
          <p role="status" className="px-6 py-3 text-sm text-muted-foreground">
            Dashboard information is temporarily unavailable. Please refresh to
            try again.
          </p>
        )}
      </section>

      <section
        className="flex flex-wrap gap-4"
        aria-label="Workspace summary"
      >
        <div className="min-w-[220px] flex-[1_1_220px]">
          <MetricCard
            label="Open positions"
            value={openJobs?.pagination.total}
            detail="Available job openings"
          />
        </div>
        {applications && (
          <div className="min-w-[220px] flex-[1_1_220px]">
            <MetricCard
              label={isApplicant ? "My applications" : "Applications"}
              value={applications.pagination.total}
              detail={
                isApplicant
                  ? "Applications you have submitted"
                  : "Applications received"
              }
            />
          </div>
        )}
        {pendingRequests && (
          <div className="min-w-[220px] flex-[1_1_220px]">
            <MetricCard
              label="Pending requests"
              value={pendingRequests.pagination.total}
              detail="Hiring requests awaiting review"
            />
          </div>
        )}
        {interviews && (
          <div className="min-w-[220px] flex-[1_1_220px]">
            <MetricCard
              label={
                isApplicant
                  ? "Scheduled interviews"
                  : canManage
                    ? "Upcoming interviews"
                    : "My interviews"
              }
              value={interviews.pagination.total}
              detail={
                isApplicant
                  ? "Your upcoming interview schedule"
                  : canManage
                    ? "Upcoming candidate interviews"
                    : "Interviews assigned to you"
              }
            />
          </div>
        )}
      </section>

      {isLoading && (
        <div className="rounded-lg border border-border bg-card px-5 py-4 text-sm text-muted-foreground">
          Loading your workspace summary…
        </div>
      )}

      <section className="grid gap-5 xl:grid-cols-2">
        {canManage && applications && (
          <ListPanel
            title="Recent applications"
            emptyMessage="No applications have been received yet."
          >
            {applications.items.map((application) => (
              <div
                key={application.id}
                className="flex items-center justify-between gap-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {application.user
                      ? `${application.user.firstName} ${application.user.lastName}`
                      : "Applicant"}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {application.jobPost?.title ?? "Position"} · Applied{" "}
                    {formatDate(application.applyDate)}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  {application.status.replaceAll("_", " ")}
                </span>
              </div>
            ))}
          </ListPanel>
        )}

        {isApplicant && applications && (
          <ListPanel
            title="My applications"
            emptyMessage="You have not submitted an application yet."
          >
            {applications.items.map((application) => (
              <div
                key={application.id}
                className="flex items-center justify-between gap-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {application.jobPost?.title ?? "Position"}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Applied {formatDate(application.applyDate)}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  {application.status.replaceAll("_", " ")}
                </span>
              </div>
            ))}
          </ListPanel>
        )}

        {pendingRequests && (
          <ListPanel
            title="Pending hiring requests"
            emptyMessage="There are no pending hiring requests."
          >
            {pendingRequests.items.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between gap-4 py-3"
              >
                <p className="truncate text-sm font-medium">
                  {request.position}
                </p>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {request.status}
                </span>
              </div>
            ))}
          </ListPanel>
        )}

        {interviews && (
          <ListPanel
            title={
              isApplicant
                ? "My interview schedule"
                : canManage
                  ? "Upcoming interviews"
                  : "Interviews assigned to me"
            }
            emptyMessage="No scheduled interviews found."
          >
            {interviews.items.map((interview) => (
              <div
                key={interview.id}
                className="flex items-center justify-between gap-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {interview.applicant?.user
                      ? `${interview.applicant.user.firstName} ${interview.applicant.user.lastName}`
                      : interview.stage.replaceAll("_", " ")}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {interview.stage.replaceAll("_", " ")} ·{" "}
                    {formatDate(interview.date)}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  {interview.status}
                </span>
              </div>
            ))}
          </ListPanel>
        )}

        <ListPanel
          title="Open positions"
          emptyMessage="There are no open positions right now."
        >
          {openJobs?.items.map((job) => (
            <div
              key={job.id}
              className="flex items-center justify-between gap-4 py-3"
            >
              <p className="truncate text-sm font-medium">{job.title}</p>
              <span className="shrink-0 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700">
                Open
              </span>
            </div>
          ))}
        </ListPanel>
      </section>
    </div>
  );
}
