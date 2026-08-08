import {
  ArrowLeftRight,
  BarChart3,
  Banknote,
  BookOpenCheck,
  BookText,
  Boxes,
  CalendarDays,
  CalendarRange,
  CircleDollarSign,
  ClipboardList,
  Coins,
  Layers,
  LayoutDashboard,
  NotebookTabs,
  Package,
  PiggyBank,
  Receipt,
  Settings,
  ShoppingCart,
  Tag,
  Tractor,
  TrendingUp,
  Truck,
  Undo2,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import type { Paths } from "./types/paths.types";

export const paths: Paths = [
  { pathname: "Dashboard", link: "/dashboard", icon: LayoutDashboard },
  // { pathname: "Packages", link: "/packages" },
  // { pathname: "Subscriptions", link: "/subscriptions" },
  {
    pathname: "Expense",
    icon: Wallet,
    children: [
      { pathname: "Purchase", link: "/expense/purchase", icon: ShoppingCart },
      { pathname: "Returns", link: "/expense/returns", icon: Undo2 },
      {
        pathname: "Purchase Book",
        link: "/expense/purchase-book",
        icon: BookText,
      },
      {
        pathname: "Integration Book",
        link: "/expense/integration-book",
        icon: NotebookTabs,
      },
      {
        pathname: "Working Cost",
        link: "/expense/working-cost",
        icon: ClipboardList,
      },
    ],
  },
  {
    pathname: "Sales",
    icon: TrendingUp,
    children: [
      { pathname: "Sale", link: "/sales/sale", icon: Tag },
      {
        pathname: "Sales Book",
        link: "/sales/sales-book",
        icon: BookOpenCheck,
      },
    ],
  },
  {
    pathname: "General",
    icon: Layers,
    children: [
      {
        pathname: "General Expense",
        link: "/general/general-expense",
        icon: Receipt,
      },
      {
        pathname: "General Sales",
        link: "/general/general-sales",
        icon: Coins,
      },
    ],
  },
  { pathname: "Cash Flow", link: "/cash-flow", icon: ArrowLeftRight },
  {
    pathname: "Overview",
    icon: BarChart3,
    children: [
      {
        pathname: "Season Overview",
        link: "/overview/season",
        icon: CalendarDays,
      },
      { pathname: "Batch Overview", link: "/overview/batch", icon: Boxes },
    ],
  },
  {
    pathname: "Invest",
    icon: PiggyBank,
    children: [
      { pathname: "Management", link: "/investors/management", icon: Users },
      {
        pathname: "Investments",
        link: "/investors/ledger/invest",
        icon: Banknote,
      },
      {
        pathname: "Profits",
        link: "/investors/ledger/profit",
        icon: CircleDollarSign,
      },
    ],
  },
  {
    pathname: "Configuration",
    icon: Settings,
    children: [
      { pathname: "Items", link: "/configuration/items", icon: Package },
      { pathname: "Farms", link: "/configuration/farms", icon: Tractor },
      {
        pathname: "Seasons",
        link: "/configuration/seasons",
        icon: CalendarRange,
      },
      { pathname: "Batches", link: "/configuration/batches", icon: Boxes },
      { pathname: "Vendors", link: "/configuration/vendors", icon: Truck },
      // { pathname: "Employees", link: "/configuration/employees", icon: UserRound },
    ],
  },
];
