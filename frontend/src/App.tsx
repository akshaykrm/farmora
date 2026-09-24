import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Navigate, Route, Routes } from "react-router";
import LoginPage from "./pages/login";
import LandingPage from "./pages/landing";
import { useAuth } from "@store/authentication/context";
import { useMemo, type ReactNode } from "react";
import Layout from "@components/layout";
import { paths } from "./paths";
import BatchesPage from "@pages/batches";
import SeasonsPage from "@pages/seasons";
import FarmsPage from "@pages/farms";
import PurchasePage from "@pages/purchases";
import ItemReturnsPage from "@pages/item-returns";
import PackagesPage from "@pages/packages";
import PurchaseBookPage from "@pages/purchase-book";
import IntegrationBookPage from "@pages/integration-book";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import ItemsPage from "@pages/items";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { createAppTheme } from "./theme";
import ThemeModeProvider from "./store/theme";
import { useTheme } from "./store/theme/context";
import Dashboard from "@pages/dashboard";
import ManagerDashboard from "@pages/dashboard/manager";
import WorkingCostPage from "@pages/working-cost";
import SalePage from "@pages/sales/sale";
import SalesBookPage from "@pages/sales-book";
import GeneralExpensePage from "@pages/general-expense";
import GeneralSalesPage from "@pages/general-sales";
import SeasonOverviewPage from "@pages/overview/season";
import BatchOverviewPage from "@pages/overview/batch";
import BalanceSheetPage from "@pages/balance-sheet";
import EmployeesPage from "@pages/employees";
import VendorPage from "@pages/vendors";
import ProfilePage from "@pages/profile";
import InvestorManagementPage from "@pages/investors/management";
import InvestLedgerPage from "@pages/investors/ledger/invest";
import ProfitLedgerPage from "@pages/investors/ledger/profit";
import RolesPage from "@pages/roles";
import SystemRolesPage from "@pages/system-roles";
import SubscribersPage from "@pages/subscribers";
import ReferralsPage from "@pages/referrals";
import ReferralDetailPage from "@pages/referrals/detail";
import usePermissions from "@hooks/use-permissions";
import { filterPaths, flattenPaths } from "@utils/filter-paths";
import type { PathItem } from "./types/paths.types";

const queryClient = new QueryClient();

const pageComponents: Record<string, React.ComponentType> = {
  "/configuration/batches": BatchesPage,
  "/configuration/users": EmployeesPage,
  "/configuration/roles": RolesPage,
  "/system-roles": SystemRolesPage,
  "/configuration/seasons": SeasonsPage,
  "/configuration/farms": FarmsPage,
  "/configuration/vendors": VendorPage,
  "/investors/management": InvestorManagementPage,
  "/investors/ledger/invest": InvestLedgerPage,
  "/investors/ledger/profit": ProfitLedgerPage,
  "/configuration/items": ItemsPage,
  "/expense/purchase": PurchasePage,
  "/expense/purchase-book": PurchaseBookPage,
  "/expense/integration-book": IntegrationBookPage,
  "/expense/returns": ItemReturnsPage,
  "/expense/working-cost-book": WorkingCostPage,
  "/sales/sale": SalePage,
  "/sales/sales-book": SalesBookPage,
  "/general/general-expense": GeneralExpensePage,
  "/general/general-sales": GeneralSalesPage,
  "/overview/season": SeasonOverviewPage,
  "/overview/batch": BatchOverviewPage,
  "/cash-flow": BalanceSheetPage,
  "/packages": PackagesPage,
  "/subscribers": SubscribersPage,
  "/referrals": ReferralsPage,
};

const MuiThemeBridge = ({ children }: { children: ReactNode }) => {
  const { mode } = useTheme();
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

const PermissionGuard = ({
  path,
  children,
}: {
  path: PathItem;
  children: ReactNode;
}) => {
  const { can, isSuperAdmin } = usePermissions();
  if (path.audience === "platform" && !isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  if (path.audience === "tenant" && isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  if (path.permission && !can(path.permission)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeModeProvider>
        <MuiThemeBridge>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Routes>
              <Route
                path="/"
                element={
                  <LoginRouteGuard>
                    <LandingPage />
                  </LoginRouteGuard>
                }
              />
              <Route
                path="/login"
                element={
                  <LoginRouteGuard>
                    <LoginPage />
                  </LoginRouteGuard>
                }
              />
              <Route
                path="/*"
                element={
                  <AuthGuard>
                    <Layout>
                      <AppRoutes />
                    </Layout>
                  </AuthGuard>
                }
              />
            </Routes>
          </LocalizationProvider>
        </MuiThemeBridge>
      </ThemeModeProvider>
    </QueryClientProvider>
  );
}

const AppRoutes = () => {
  const { can, isSuperAdmin } = usePermissions();
  const visiblePaths = filterPaths(paths, { can, isSuperAdmin });
  const flatPaths = flattenPaths(visiblePaths);

  return (
    <Routes>
      <Route path="/dashboard" element={<RoleBasedDashboard />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route
        path="/referrals/:partnerId"
        element={
          <PermissionGuard
            path={{
              pathname: "Referral Detail",
              link: "/referrals",
              audience: "platform",
              permission: "referral:read",
            }}
          >
            <ReferralDetailPage />
          </PermissionGuard>
        }
      />
      {flatPaths
        .filter((path) => path.link && path.link !== "/dashboard")
        .map((path) => {
          const Component = pageComponents[path.link!];
          return (
            <Route
              key={path.link}
              path={path.link}
              element={
                <PermissionGuard path={path}>
                  {Component ? <Component /> : <h1>{path.pathname}</h1>}
                </PermissionGuard>
              }
            />
          );
        })}
    </Routes>
  );
};

const RoleBasedDashboard = () => {
  const { isSuperAdmin, isSubscriber, can } = usePermissions();

  if (isSuperAdmin) {
    return <Dashboard />;
  }

  if (isSubscriber || can("dashboard:read")) {
    return <ManagerDashboard />;
  }

  return (
    <div className="rounded-lg border border-brand-border bg-brand-card p-8 text-center">
      <h1 className="text-lg font-semibold text-brand-ink">No modules assigned</h1>
      <p className="mt-2 text-sm text-brand-ink-soft">
        You do not have permission to view any menus yet. Ask your subscriber to
        assign a role or permissions.
      </p>
    </div>
  );
};

const AuthGuard = ({ children }: { children: ReactNode }) => {
  const user = useAuth();
  if (!user.token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const LoginRouteGuard = ({ children }: { children: ReactNode }) => {
  const user = useAuth();
  if (user.token) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

export default App;
