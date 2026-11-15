import type {
  PendingInvoicesSummary,
  ManagerDashboardData,
  AdminDashboardData,
} from "@app-types/dashboard.types";
import fetcher from "@utils/fetcher";

const dashboard = {
  fetchManagerDashboard: (): Promise<ManagerDashboardData> => {
    return fetcher("dashboard/manager");
  },
  fetchPendingInvoices: (scope: {
    batch_id?: number;
    season_id?: number;
  }): Promise<PendingInvoicesSummary> => {
    const params = new URLSearchParams();
    if (scope.batch_id) params.set("batch_id", String(scope.batch_id));
    if (scope.season_id) params.set("season_id", String(scope.season_id));
    const qs = params.toString();
    return fetcher(`dashboard/pending-invoices${qs ? `?${qs}` : ""}`);
  },
  fetchAdminDashboard: (): Promise<AdminDashboardData> => {
    return fetcher("dashboard/admin");
  },
};

export default dashboard;
