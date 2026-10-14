import { Link, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@mui/material";
import PageHeader from "@components/PageHeader";
import ExportMenu from "@components/ExportMenu";
import LoadingMessage from "@components/LoadingMessage";
import ApplyFilterMessage from "@components/ApplyFilterMessage";
import EmptyContentMessage from "@components/EmptyContentMessage";
import usePermissions from "@hooks/use-permissions";
import useQueryParameters from "@hooks/use-query-parameters";
import { useReport, useReportList, useReportOptions } from "./api";
import { missingRequirement, REPORT_CONFIG, reportsBasePath } from "./config";
import CompanySelect from "./components/company-select";
import ReportFilters from "./components/report-filters";
import ReportSummary from "./components/report-summary";
import ReportChart from "./components/report-chart";
import ReportTable from "./components/report-table";
import type { ReportFilter } from "./types";

const ReportViewPage = () => {
  const { reportKey = "" } = useParams();
  const { isSuperAdmin } = usePermissions();
  const { queryParms, updateQueryParams } = useQueryParameters();
  const { data: reports, isLoading: loadingList } = useReportList();

  const info = reports?.find((report) => report.key === reportKey);
  const config = REPORT_CONFIG[reportKey];
  const isTenantReport = info?.audience === "tenant";
  const needsCompany = isSuperAdmin && isTenantReport;
  const companyId = queryParms.company_id;
  const companyReady = !needsCompany || Boolean(companyId);
  const missing = missingRequirement(reportKey, queryParms);
  const ready = Boolean(info && config) && companyReady && !missing;

  const { data: options } = useReportOptions(
    companyId,
    Boolean(isTenantReport) && companyReady,
  );
  const { data, isLoading, isFetching, error } = useReport(
    reportKey,
    queryParms,
    ready,
  );

  const base = reportsBasePath(isSuperAdmin);
  const back = (
    <Button
      component={Link}
      to={base}
      variant="outlined"
      startIcon={<ArrowLeft className="h-4 w-4" />}
    >
      Back
    </Button>
  );

  if (loadingList) return <LoadingMessage />;
  if (!info || !config) {
    return (
      <>
        <PageHeader title="Report" action={back} />
        <EmptyContentMessage
          title="Report not available"
          description="This report does not exist or you do not have access to it"
        />
      </>
    );
  }

  const applyFilter = (filter: ReportFilter) =>
    updateQueryParams({ ...filter, page: null });

  const changeCompany = (id: string) =>
    updateQueryParams({
      company_id: id,
      page: null,
      ...Object.fromEntries(config.filters.map((field) => [field, null])),
    });

  const charts = [data?.chart, ...(data?.charts || [])].filter(
    (chart): chart is NonNullable<typeof chart> =>
      Boolean(chart && chart.data.length),
  );

  return (
    <>
      <PageHeader
        title={info.title}
        subtitle={info.description}
        action={
          <div className="flex gap-2">
            {back}
            <ExportMenu
              permission={`report_${reportKey}:export`}
              endpoint={`reports/${reportKey}/export`}
              filter={queryParms}
              filename={`report-${reportKey.replace(/_/g, "-")}`}
              disabled={!ready}
              disabledReason={
                !companyReady
                  ? "Select a company to export"
                  : missing || undefined
              }
            />
          </div>
        }
      />

      {needsCompany && (
        <CompanySelect value={companyId} onChange={changeCompany} />
      )}

      {companyReady && (
        <ReportFilters
          key={`${reportKey}-${companyId || ""}`}
          reportKey={reportKey}
          fields={config.filters}
          applied={queryParms}
          options={options}
          onApply={applyFilter}
        />
      )}

      {!companyReady ? (
        <ApplyFilterMessage
          title="Select a company"
          description="Company reports run for one company at a time"
        />
      ) : missing ? (
        <ApplyFilterMessage description={missing} />
      ) : isLoading ? (
        <LoadingMessage title="Building report…" />
      ) : error ? (
        <EmptyContentMessage
          title="Could not build the report"
          description={
            error instanceof Error ? error.message : "Something went wrong"
          }
        />
      ) : data ? (
        <div
          className={`flex flex-col gap-6 ${isFetching ? "opacity-60" : ""}`}
        >
          {data.meta.filter((entry) => entry.value).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.meta
                .filter((entry) => entry.value)
                .map((entry) => (
                  <span
                    key={entry.label}
                    className="rounded-full bg-brand-primary-soft px-3 py-1 text-xs font-medium text-brand-accent"
                  >
                    {entry.label}: {entry.value}
                  </span>
                ))}
            </div>
          )}
          <ReportSummary summary={data.summary} />
          {charts.length > 0 && (
            <div
              className={`grid grid-cols-1 gap-6 ${charts.length > 1 ? "xl:grid-cols-2" : ""}`}
            >
              {charts.map((chart) => (
                <ReportChart key={chart.title} chart={chart} />
              ))}
            </div>
          )}
          {data.sections.map((section) => (
            <ReportTable
              key={section.key}
              section={section}
              onPageChange={(update) => updateQueryParams(update)}
            />
          ))}
        </div>
      ) : null}
    </>
  );
};

export default ReportViewPage;
