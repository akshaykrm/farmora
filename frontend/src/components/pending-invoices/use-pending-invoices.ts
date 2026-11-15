import { useQuery } from "@tanstack/react-query";
import dashboardApi from "@api/dashboard.api";

type Scope = { batch_id?: number; season_id?: number };

const usePendingInvoices = (scope: Scope, enabled = true) =>
  useQuery({
    queryKey: ["pending-invoices", scope],
    queryFn: () => dashboardApi.fetchPendingInvoices(scope),
    enabled,
    staleTime: 0,
  });

export default usePendingInvoices;
