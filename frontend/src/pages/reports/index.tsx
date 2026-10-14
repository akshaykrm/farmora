import { Link } from "react-router";
import { ChevronRight, FileText } from "lucide-react";
import PageHeader from "@components/PageHeader";
import LoadingMessage from "@components/LoadingMessage";
import EmptyContentMessage from "@components/EmptyContentMessage";
import usePermissions from "@hooks/use-permissions";
import { useReportList } from "./api";
import { REPORT_CONFIG, reportsBasePath } from "./config";
import type { ReportInfo } from "./types";

const GROUP_ORDER = ["Platform", "Production", "Sales", "Purchases", "Finance"];

const groupReports = (reports: ReportInfo[]) => {
  const groups = new Map<string, ReportInfo[]>();
  reports.forEach((report) => {
    groups.set(report.group, [...(groups.get(report.group) || []), report]);
  });
  return [...groups.entries()].sort(
    ([a], [b]) => GROUP_ORDER.indexOf(a) - GROUP_ORDER.indexOf(b),
  );
};

const ReportsPage = () => {
  const { isSuperAdmin } = usePermissions();
  const { data: reports = [], isLoading } = useReportList();
  const base = reportsBasePath(isSuperAdmin);

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle={
          isSuperAdmin
            ? "Platform reports, and company reports for any company you select"
            : "View reports on screen or export them to Excel and PDF"
        }
      />
      {isLoading ? (
        <LoadingMessage />
      ) : reports.length === 0 ? (
        <EmptyContentMessage
          title="No reports available"
          description="Ask your subscriber to give you access to reports"
        />
      ) : (
        <div className="flex flex-col gap-8">
          {groupReports(reports).map(([group, items]) => (
            <section key={group}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-ink-soft">
                {group === "Platform"
                  ? group
                  : isSuperAdmin
                    ? `${group} (company)`
                    : group}
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {items.map((report) => {
                  const Icon = REPORT_CONFIG[report.key]?.icon || FileText;
                  return (
                    <Link
                      key={report.key}
                      to={`${base}/${report.key}`}
                      className="group flex items-start gap-3 rounded-xl border border-brand-border bg-brand-card p-4 shadow-xs transition-colors hover:border-brand-primary"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary-soft text-brand-accent">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-brand-ink">
                          {report.title}
                        </h3>
                        <p className="mt-1 text-sm text-brand-ink-soft">
                          {report.description}
                        </p>
                      </div>
                      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-brand-ink-muted transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
};

export default ReportsPage;
