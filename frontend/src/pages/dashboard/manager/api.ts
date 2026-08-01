import fetcher from "@utils/fetcher";
import type { AdminDashboardData, ManagerDashboardData } from "./types";

const dashboard = {
  fetchManagerDashboard: (): Promise<ManagerDashboardData> => {
    return fetcher("dashboard/manager");
  },
  fetchAdminDashboard: (): Promise<AdminDashboardData> => {
    return fetcher("dashboard/admin");
  },
};

export default dashboard;
