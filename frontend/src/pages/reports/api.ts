import { useQuery } from "@tanstack/react-query";
import fetcher from "@utils/fetcher";
import type { NameResponse } from "@app-types/gen.types";
import type {
  ReportFilter,
  ReportInfo,
  ReportOptions,
  ReportResult,
} from "./types";

export const useReportList = () =>
  useQuery<ReportInfo[]>({
    queryKey: ["reports"],
    queryFn: () => fetcher("reports"),
  });

export const useReportCompanies = (enabled: boolean) =>
  useQuery<NameResponse[]>({
    queryKey: ["reports", "companies"],
    queryFn: () => fetcher("reports/companies"),
    enabled,
  });

export const useReportOptions = (
  companyId: string | undefined,
  enabled: boolean,
) =>
  useQuery<ReportOptions>({
    queryKey: ["reports", "options", companyId ?? null],
    queryFn: () =>
      fetcher("reports/options", null, {
        method: "GET",
        filter: { company_id: companyId },
      }),
    enabled,
  });

export const useReport = (
  key: string,
  filter: ReportFilter,
  enabled: boolean,
) =>
  useQuery<ReportResult>({
    queryKey: ["reports", key, filter],
    queryFn: () => fetcher(`reports/${key}`, null, { method: "GET", filter }),
    enabled,
    retry: false,
    placeholderData: (previous) =>
      previous?.report.key === key ? previous : undefined,
  });
