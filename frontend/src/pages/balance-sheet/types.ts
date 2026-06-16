export type BalanceSheetFilterRequest = {
  from_date?: string;
  to_date?: string;
  purpose?: string;
};

export type BalanceSheetBreakdown = {
  in: number;
  out: number;
  liability?: number;
  receivable?: number;
  liability_reduction?: number;
};

export type BalanceSheetBreakdownMap = {
  purchases: BalanceSheetBreakdown;
  sales: BalanceSheetBreakdown;
  purchase_returns: BalanceSheetBreakdown;
  working_costs: BalanceSheetBreakdown;
  general_expenses: BalanceSheetBreakdown;
  expense_sales: BalanceSheetBreakdown;
  integration_books: BalanceSheetBreakdown;
  investor_capital?: BalanceSheetBreakdown;
  investor_profit?: BalanceSheetBreakdown;
};

export type BalanceSheetSummary = {
  total_in: number;
  total_out: number;
  liability: number;
  receivable: number;
  net: number;
  closing_balance: number;
};

export type Transaction = {
  date: string;
  purpose: string;
  type: "in" | "out";
  amount: number;
  balance: number;
};

export type BalanceSheetResponse = {
  opening_balance: number;
  from_date: string | null;
  to_date: string | null;
  summary: BalanceSheetSummary;
  breakdown: BalanceSheetBreakdownMap;
  transactions: Transaction[];
};
