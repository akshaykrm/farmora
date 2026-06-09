import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Navigate, Route, Routes } from "react-router";
import LoginPage from "./pages/login";
import LandingPage from "./pages/landing";
import { useAuth } from "@store/authentication/context";
import type { ReactNode } from "react";
import Layout from "@components/layout";
import { paths } from "./paths";
import BatchesPage from "@pages/batches";
import SeasonsPage from "@pages/seasons";
import FarmsPage from "@pages/farms";
import PurchasePage from "@pages/purchases";
import ItemReturnsPage from "@pages/item-returns";
import PackagesPage from "@pages/packages";
import SubscriptionsPage from "@pages/subscriptions";
import PurchaseBookPage from "@pages/purchase-book";
import IntegrationBookPage from "@pages/integration-book";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import ItemsPage from "@pages/items";
import type { PathItem } from "./types/paths.types";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import theme from "./theme";
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
import InvestorManagementPage from "@pages/investors/management";

const queryClient = new QueryClient();

const pageComponents: Record<string, React.ComponentType> = {
  "/dashboard": Dashboard,
  "/configuration/batches": BatchesPage,
  "/configuration/employees": EmployeesPage,
  "/configuration/seasons": SeasonsPage,
  "/configuration/farms": FarmsPage,
  "/configuration/vendors": VendorPage,
  "/configuration/investors": InvestorManagementPage,
  "/configuration/items": ItemsPage,
  "/expense/purchase": PurchasePage,
  "/expense/purchase-book": PurchaseBookPage,
  "/expense/integration-book": IntegrationBookPage,
  "/expense/returns": ItemReturnsPage,
  "/expense/working-cost": WorkingCostPage,
  "/sales/sale": SalePage,
  "/sales/sales-book": SalesBookPage,
  "/general/general-expense": GeneralExpensePage,
  "/general/general-sales": GeneralSalesPage,
  "/overview/season": SeasonOverviewPage,
  "/overview/batch": BatchOverviewPage,
  "/balance-sheet": BalanceSheetPage,
  "/packages": PackagesPage,
  "/subscriptions": SubscriptionsPage,
};

// Flatten nested paths into a single array
const flattenPaths = (items: PathItem[]): PathItem[] => {
  const result: PathItem[] = [];
  items.forEach((item) => {
    if (item.link) {
      result.push(item);
    }
    if (item.children) {
      result.push(...flattenPaths(item.children));
    }
  });
  return result;
};

function App() {
  const flatPaths = flattenPaths(paths);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
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
                    <Routes>
                      <Route
                        path="/dashboard"
                        element={<RoleBasedDashboard />}
                      />
                      {flatPaths.map((path) => {
                        const Component = pageComponents[path.link!];
                        return (
                          <Route
                            key={path.link}
                            path={path.link}
                            element={
                              Component ? (
                                <Component />
                              ) : (
                                <h1>{path.pathname}</h1>
                              )
                            }
                          />
                        );
                      })}
                    </Routes>
                  </Layout>
                </AuthGuard>
              }
            />
          </Routes>
        </LocalizationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

const RoleBasedDashboard = () => {
  const { user } = useAuth();

  if (user?.role === "manager") {
    return <ManagerDashboard />;
  }

  return <Dashboard />;
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
