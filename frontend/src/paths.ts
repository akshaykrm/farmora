import type { Paths } from "./types/paths.types";

export const paths: Paths = [
  { pathname: "Dashboard", link: "/dashboard" },
  // { pathname: "Packages", link: "/packages" },
  // { pathname: "Subscriptions", link: "/subscriptions" },
  {
    pathname: "Expense",
    children: [
      { pathname: "Purchase", link: "/expense/purchase" },
      { pathname: "Returns", link: "/expense/returns" },
      { pathname: "Purchase Book", link: "/expense/purchase-book" },
      { pathname: "Integration Book", link: "/expense/integration-book" },
      { pathname: "Working Cost", link: "/expense/working-cost" },
    ],
  },
  {
    pathname: "Sales",
    children: [
      { pathname: "Sale", link: "/sales/sale" },
      { pathname: "Sales Book", link: "/sales/sales-book" },
    ],
  },
  {
    pathname: "General",
    children: [
      { pathname: "General Expense", link: "/general/general-expense" },
      { pathname: "General Sales", link: "/general/general-sales" },
    ],
  },
  { pathname: "Balance Sheet", link: "/balance-sheet" },
  {
    pathname: "Overview",
    children: [
      { pathname: "Season Overview", link: "/overview/season" },
      { pathname: "Batch Overview", link: "/overview/batch" },
    ],
  },
  {
    pathname: "Configuration",
    children: [
      { pathname: "Items", link: "/configuration/items" },
      { pathname: "Farms", link: "/configuration/farms" },
      { pathname: "Seasons", link: "/configuration/seasons" },
      { pathname: "Batches", link: "/configuration/batches" },
      { pathname: "Vendors", link: "/configuration/vendors" },
      { pathname: "Investors", link: "/configuration/investors" },
      { pathname: "Employees", link: "/configuration/employees" },
    ],
  },
];
