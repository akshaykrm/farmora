import { Box, Grid, Typography, CircularProgress } from "@mui/material";
import { TrendingUp, Package, Activity, ShoppingCart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { StatCard } from "./components/StatCard";
import { SalesChart } from "./components/SalesChart";
import { ItemDistributionChart } from "./components/ItemDistributionChart";
import { RecentActivity } from "./components/RecentActivity";
import { StockLevels } from "./components/StockLevels";
import { BatchStatusChart } from "./components/BatchStatusChart";
import { useAuth } from "@store/authentication/context";
import dashboard from "./manager/api";
import type { AdminDashboardData } from "./manager/types";

export const Dashboard = () => {
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery<AdminDashboardData>({
    queryKey: ["admin-dashboard"],
    queryFn: dashboard.fetchAdminDashboard,
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
        <Typography color="error">Failed to load dashboard data</Typography>
      </Box>
    );
  }

  const {
    stats,
    salesData,
    itemDistribution,
    batchStatus,
    recentActivity,
    stockLevels,
  } = data;

  return (
    <Box sx={{ py: 4, px: 3, width: "100%" }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Hi, {user?.name} 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back! Here's what's happening with your farm today.
        </Typography>
      </Box>
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4, width: "100%" }}>
        <Grid size={{ md: 6, lg: 3, sm: 6, xs: 12 }}>
          <StatCard
            title="Total Revenue"
            value={`₹${stats.totalRevenue.toLocaleString()}`}
            icon={<TrendingUp size={24} />}
            trend="+12.5%"
          />
        </Grid>
        <Grid size={{ md: 6, lg: 3, sm: 6, xs: 12 }}>
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={<ShoppingCart size={24} />}
            trend="+8.2%"
          />
        </Grid>
        <Grid size={{ md: 6, lg: 3, sm: 6, xs: 12 }}>
          <StatCard
            title="Active Batches"
            value={stats.activeBatches}
            icon={<Activity size={24} />}
            trend="+3.1%"
          />
        </Grid>
        <Grid size={{ md: 6, lg: 3, sm: 6, xs: 12 }}>
          <StatCard
            title="Total Items"
            value={stats.totalItems}
            icon={<Package size={24} />}
            trend="+5.7%"
          />
        </Grid>
      </Grid>
      {/* Charts Row 1 */}
      <Grid container spacing={3} sx={{ mb: 4, width: "100%" }}>
        <Grid size={{ md: 6, lg: 6, sm: 12, xs: 12 }}>
          <SalesChart data={salesData} />
        </Grid>
        <Grid size={{ md: 6, lg: 6, sm: 12, xs: 12 }}>
          <ItemDistributionChart data={itemDistribution} />
        </Grid>
      </Grid>
      {/* Charts Row 2 */}
      <Grid container spacing={3} sx={{ width: "100%" }}>
        <Grid size={{ md: 6, lg: 6, sm: 12, xs: 12 }}>
          <BatchStatusChart data={batchStatus} />
        </Grid>
        <Grid size={{ md: 6, lg: 6, sm: 12, xs: 12 }}>
          <StockLevels stocks={stockLevels} />
        </Grid>
      </Grid>
      {/* Recent Activity */}
      <Box sx={{ mt: 4 }}>
        <RecentActivity activities={recentActivity} />
      </Box>
    </Box>
  );
};

export default Dashboard;
