import { useAuth } from "@store/authentication/context";
import { useQuery } from "@tanstack/react-query";
import MetricCard from "./components/MetricCard";
import dashboardApi from "@api/dashboard.api";
import type { ManagerDashboardData } from "@app-types/dashboard.types";
import { CircularProgress, Box } from "@mui/material";

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
    <div className="py-4 px-3 w-full space-y-12">
      {/* Welcome Header */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-slate-800 mb-1">
          Hi, {user?.name} 👋
        </h1>
        <p className="text-slate-500">
          Welcome back! Here's what's happening with your farm today.
        </p>
      </div>

      {/* KEY PERFORMANCE INDICATORS */}
      <section className="animate-in fade-in duration-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.metrics.map((metric, idx) => (
            <MetricCard key={idx} {...metric} />
          ))}
        </div>
      </section>

      {/* BALANCE SECTION */}
      <section className="w-full">
        <div className="bg-gradient-to-br from-green-700 to-green-800 p-6 md:p-8 rounded-2xl text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
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
              Balance in Hand
            </p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter">
              ₹{data.balanceInHand.toLocaleString()}
            </h2>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="bg-white/10 px-5 py-4 rounded-xl backdrop-blur-md border border-white/10 min-w-[180px]">
              <p className="text-[10px] text-green-200 uppercase font-bold mb-1">
                Total Credited (30d)
              </p>
              <p className="text-xl font-bold text-emerald-300">
                +₹{data.totalCredited.toLocaleString()}
              </p>
            </div>
            <div className="bg-white/10 px-5 py-4 rounded-xl backdrop-blur-md border border-white/10 min-w-[180px]">
              <p className="text-[10px] text-green-200 uppercase font-bold mb-1">
                Total Debited (30d)
              </p>
              <p className="text-xl font-bold text-rose-300">
                -₹{data.totalDebited.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ManagerDashboard;
