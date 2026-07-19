import { useAuth } from "@store/authentication/context";
import { useQuery } from "@tanstack/react-query";
import MetricCard from "./components/MetricCard";
import SectionHeader from "./components/SectionHeader";
import { PurchasesListing, SalesListing } from "./components/DataListings";
import dashboardApi from "@api/dashboard.api";
import type { ManagerDashboardData } from "@app-types/dashboard.types";
import { CircularProgress, Box } from "@mui/material";
import { formatCurrency } from "@utils/currency";

const ManagerDashboard = () => {
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery<ManagerDashboardData>({
    queryKey: ["manager-dashboard"],
    queryFn: dashboardApi.fetchManagerDashboard,
  });

  if (isLoading) {
    return (
      <Box className="flex items-center justify-center h-96">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box className="flex items-center justify-center h-96">
        <p className="text-red-500">Failed to load dashboard data</p>
      </Box>
    );
  }

  return (
    <div className="h-full flex flex-col w-full gap-4 overflow-hidden">
      {/* Welcome Header */}
      <div className="mb-2 shrink-0">
        <h1 className="text-3xl font-bold text-slate-800 mb-1">
          Hi, {user?.name} 👋
        </h1>
        <p className="text-slate-500">
          Welcome back! Here's what's happening with your farm today.
        </p>
      </div>

      {/* KEY PERFORMANCE INDICATORS */}
      <section className="animate-in fade-in duration-700 shrink-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.metrics.map((metric, idx) => (
            <MetricCard key={idx} {...metric} />
          ))}
        </div>
      </section>

      {/* BALANCE SECTION */}
      <section className="w-full shrink-0">
        <div className="bg-gradient-to-br from-green-700 to-green-800 p-5 md:p-6 rounded-2xl text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>
          <div className="relative z-10">
            <p className="text-green-100 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              Cash Balance
            </p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter">
              {formatCurrency(data.balanceInHand)}
            </h2>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="bg-white/10 px-5 py-4 rounded-xl backdrop-blur-md border border-white/10 min-w-[180px]">
              <p className="text-[10px] text-green-200 uppercase font-bold mb-1">
                Customer Balance
              </p>
              <p className="text-xl font-bold text-emerald-300">
                {formatCurrency(data.customerBalance)}
              </p>
            </div>
            <div className="bg-white/10 px-5 py-4 rounded-xl backdrop-blur-md border border-white/10 min-w-[180px]">
              <p className="text-[10px] text-green-200 uppercase font-bold mb-1">
                Supplier Balance
              </p>
              <p className="text-xl font-bold text-rose-300">
                {formatCurrency(data.supplierBalance)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* RECENT PURCHASES & SALES */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 flex-1 min-h-0 overflow-hidden">
        {data.recentPurchases?.length > 0 && (
          <section className="animate-in fade-in duration-700 flex flex-col min-h-0 overflow-hidden">
            <SectionHeader
              title="Recent Purchases"
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              }
            />
            <PurchasesListing data={data.recentPurchases} />
          </section>
        )}

        {data.recentSales?.length > 0 && (
          <section className="animate-in fade-in duration-700 flex flex-col min-h-0 overflow-hidden">
            <SectionHeader
              title="Recent Sales"
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            />
            <SalesListing data={data.recentSales} />
          </section>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;
