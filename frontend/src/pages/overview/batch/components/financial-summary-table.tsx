import {
  RotateCcw,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import type { ReactNode } from "react";
import { formatCurrency } from "@utils/currency";

type Props = {
  totalExpense: number;
  totalSaleAmount: number;
  totalReturnAmount: number;
  totalPurchaseAmount: number;
};

const FinancialSummaryTable = (props: Props) => {
  const {
    totalExpense,
    totalSaleAmount,
    totalReturnAmount,
    totalPurchaseAmount,
  } = props;

  const profit = totalSaleAmount - totalExpense;

  return (
    <section className="rounded-xl border border-brand-border bg-brand-card p-4 shadow-xs">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-8 h-8 rounded-lg bg-brand-primary-soft text-brand-accent flex items-center justify-center">
          <Wallet className="w-4 h-4" />
        </span>
        <h3 className="text-lg font-semibold text-brand-ink">
          Financial Summary
        </h3>
      </div>

      <div
        className={`rounded-lg px-4 py-3 ${
          profit >= 0 ? "bg-brand-success-soft" : "bg-brand-danger-soft"
        }`}
      >
        <p
          className={`text-xs font-medium ${
            profit >= 0 ? "text-brand-success-strong" : "text-brand-danger-strong"
          }`}
        >
          Total Profit
        </p>
        <p
          className={`text-2xl font-bold tabular-nums ${
            profit >= 0 ? "text-brand-success-strong" : "text-brand-danger-strong"
          }`}
        >
          {formatCurrency(profit)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <MiniStat
          icon={<ShoppingCart className="w-4 h-4" />}
          label="Purchases"
          value={formatCurrency(totalPurchaseAmount)}
        />
        <MiniStat
          icon={<RotateCcw className="w-4 h-4" />}
          label="Returns"
          value={formatCurrency(totalReturnAmount)}
        />
        <MiniStat
          icon={<TrendingDown className="w-4 h-4" />}
          label="Expenses"
          value={formatCurrency(totalExpense)}
          valueClassName="text-brand-danger"
        />
        <MiniStat
          icon={<TrendingUp className="w-4 h-4" />}
          label="Sales"
          value={formatCurrency(totalSaleAmount)}
          valueClassName="text-brand-info"
        />
      </div>
    </section>
  );
};

const MiniStat = ({
  icon,
  label,
  value,
  valueClassName = "",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  valueClassName?: string;
}) => {
  return (
    <div className="rounded-lg border border-brand-border bg-brand-canvas p-3">
      <div className="flex items-center gap-2 text-brand-ink-muted mb-1">
        <span className="w-6 h-6 rounded-md bg-brand-primary-soft text-brand-accent flex items-center justify-center">
          {icon}
        </span>
        <span className="text-xs">{label}</span>
      </div>
      <p
        className={`text-base font-semibold tabular-nums text-brand-ink ${valueClassName}`}
      >
        {value}
      </p>
    </div>
  );
};

export default FinancialSummaryTable;
