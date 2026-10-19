import type { NameResponse } from "@app-types/gen.types";

export type ValueType = "text" | "number" | "currency" | "date";

export type ReportInfo = {
  key: string;
  title: string;
  description: string;
  group: string;
  audience: "tenant" | "platform";
  paged: boolean;
  can_export: boolean;
};

export type ReportColumn = {
  key: string;
  header: string;
  type?: ValueType;
  width?: number;
};

export type ReportRow = Record<string, string | number | null | undefined>;

export type ReportPagination = {
  page: number;
  limit: number;
  count: number;
  totalPages: number;
};

export type ReportSection = {
  key: string;
  title: string;
  columns: ReportColumn[];
  rows: ReportRow[];
  total?: ReportRow;
  pagination?: ReportPagination | null;
};

export type ReportChart = {
  type: "bar" | "line" | "pie";
  title: string;
  x: string;
  series: { key: string; label: string }[];
  stacked?: boolean;
  data: ReportRow[];
};

export type ReportEntry = {
  label: string;
  value: string | number | null;
  type?: ValueType;
};

export type ReportResult = {
  report: ReportInfo;
  meta: ReportEntry[];
  summary: ReportEntry[];
  chart: ReportChart | null;
  charts?: ReportChart[];
  sections: ReportSection[];
};

export type ReportBatchOption = NameResponse & {
  season_id: number | null;
  farm_id: number | null;
  closed: boolean;
};

export type ReportOptions = {
  seasons: NameResponse[];
  farms: NameResponse[];
  batches: ReportBatchOption[];
  buyers: NameResponse[];
  suppliers: NameResponse[];
};

export type ReportFilter = Record<string, string>;
