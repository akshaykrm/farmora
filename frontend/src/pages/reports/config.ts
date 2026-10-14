import dayjs from "dayjs";
import {
  Activity,
  CalendarClock,
  ChartColumn,
  ChartPie,
  ClipboardList,
  Factory,
  HandCoins,
  NotebookTabs,
  Receipt,
  Scale,
  ShoppingBag,
  ShoppingCart,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { ReportFilter } from "./types";

export type FilterField =
  | "season_id"
  | "farm_id"
  | "batch_id"
  | "batch_status"
  | "buyer_id"
  | "vendor_id"
  | "payment_type"
  | "start_date"
  | "end_date"
  | "as_of"
  | "include_open"
  | "days";

/**
 * Mirrors the backend `scope`: the report needs one of `scopes` or a full
 * date range of at most `maxDays`. Reports without a scope run unfiltered.
 */
type Scope = { scopes: FilterField[]; maxDays: number };

type ReportConfig = {
  icon: LucideIcon;
  filters: FilterField[];
  scope?: Scope;
};

const DEFAULT_SCOPE: Scope = {
  scopes: ["season_id", "batch_id"],
  maxDays: 366,
};

export const REPORT_CONFIG: Record<string, ReportConfig> = {
  batch_financial: {
    icon: ChartColumn,
    filters: [
      "season_id",
      "farm_id",
      "batch_id",
      "batch_status",
      "start_date",
      "end_date",
    ],
    scope: DEFAULT_SCOPE,
  },
  batch_daily_log: {
    icon: NotebookTabs,
    filters: [
      "season_id",
      "farm_id",
      "batch_id",
      "batch_status",
      "start_date",
      "end_date",
    ],
    scope: DEFAULT_SCOPE,
  },
  farm_comparison: {
    icon: Factory,
    filters: ["season_id", "farm_id", "batch_status", "start_date", "end_date"],
    scope: { scopes: ["season_id"], maxDays: 366 },
  },
  daily_production: {
    icon: Activity,
    filters: ["batch_id", "farm_id", "batch_status", "start_date", "end_date"],
    scope: { scopes: ["batch_id"], maxDays: 62 },
  },
  sales_register: {
    icon: ShoppingBag,
    filters: [
      "season_id",
      "batch_id",
      "buyer_id",
      "payment_type",
      "start_date",
      "end_date",
    ],
    scope: DEFAULT_SCOPE,
  },
  buyer_sales: {
    icon: Users,
    filters: [
      "season_id",
      "batch_id",
      "payment_type",
      "start_date",
      "end_date",
    ],
    scope: DEFAULT_SCOPE,
  },
  purchase_register: {
    icon: ShoppingCart,
    filters: [
      "season_id",
      "batch_id",
      "farm_id",
      "vendor_id",
      "payment_type",
      "start_date",
      "end_date",
    ],
    scope: DEFAULT_SCOPE,
  },
  supplier_outstanding: {
    icon: Scale,
    filters: ["vendor_id", "as_of"],
  },
  profit_loss: {
    icon: Wallet,
    filters: ["season_id", "farm_id", "include_open", "start_date", "end_date"],
    scope: { scopes: ["season_id"], maxDays: 366 },
  },
  expense_breakdown: {
    icon: ChartPie,
    filters: ["season_id", "start_date", "end_date"],
    scope: { scopes: ["season_id"], maxDays: 366 },
  },
  subscription_revenue: { icon: Receipt, filters: ["start_date", "end_date"] },
  expiring_subscriptions: { icon: CalendarClock, filters: ["days"] },
  tenant_usage: { icon: ClipboardList, filters: [] },
  referral_payouts: { icon: HandCoins, filters: ["start_date", "end_date"] },
};

export const TENANT_REPORT_KEYS = Object.keys(REPORT_CONFIG).filter(
  (key) =>
    ![
      "subscription_revenue",
      "expiring_subscriptions",
      "tenant_usage",
      "referral_payouts",
    ].includes(key),
);

export const TENANT_REPORT_READ_PERMISSIONS = TENANT_REPORT_KEYS.map(
  (key) => `report_${key}:read`,
);

export const reportsBasePath = (isSuperAdmin: boolean) =>
  isSuperAdmin ? "/platform/reports" : "/reports";

export const FILTER_LABELS: Record<FilterField, string> = {
  season_id: "Season",
  farm_id: "Farm",
  batch_id: "Batch",
  batch_status: "Batch status",
  buyer_id: "Buyer",
  vendor_id: "Supplier",
  payment_type: "Payment type",
  start_date: "From date",
  end_date: "To date",
  as_of: "As of",
  include_open: "Include open batches",
  days: "Expiring within",
};

/** Explains what still has to be selected, or null when the report can run. */
export const missingRequirement = (
  key: string,
  filter: ReportFilter,
): string | null => {
  const scope = REPORT_CONFIG[key]?.scope;
  if (!scope) return null;
  const { start_date: start, end_date: end } = filter;
  if (start && end) {
    if (end < start) return "The to date cannot be before the from date";
    const days = dayjs(end).diff(dayjs(start), "day") + 1;
    if (days > scope.maxDays) {
      return `The date range can be at most ${scope.maxDays} days`;
    }
    return null;
  }
  if (scope.scopes.some((field) => filter[field])) return null;
  const options = scope.scopes.map((field) =>
    FILTER_LABELS[field].toLowerCase(),
  );
  return `Select a ${options.join(" or a ")}, or a date range of up to ${scope.maxDays} days`;
};
