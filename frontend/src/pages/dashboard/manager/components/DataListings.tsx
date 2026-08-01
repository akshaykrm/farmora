import type { ReactNode } from "react";
import dayjs from "dayjs";
import type { RecentSale, RecentPurchase } from "../types";

const TableHeader = ({ children }: { children: ReactNode }) => (
  <th className="px-4 py-2.5 text-left text-[10px] font-bold text-brand-ink-muted uppercase tracking-widest border-b border-brand-border">
    {children}
  </th>
);

const Badge = ({
  variant,
  children,
}: {
  variant: "green" | "blue" | "slate" | "amber" | "red";
  children: ReactNode;
}) => {
  const styles = {
    green:
      "bg-brand-success-soft text-brand-success-strong border-brand-success-soft",
    blue: "bg-brand-info-soft text-brand-info-strong border-brand-info-soft",
    slate: "bg-brand-canvas text-brand-ink-soft border-brand-border",
    amber:
      "bg-brand-warning-soft text-brand-warning-strong border-brand-warning-soft",
    red: "bg-brand-danger-soft text-brand-danger-strong border-brand-danger-soft",
  };
  return (
    <span
      className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border uppercase tracking-wider ${styles[variant]}`}
    >
      {children}
    </span>
  );
};

export const SalesListing = ({ data }: { data: RecentSale[] }) => (
  <div className="bg-brand-card rounded-xl border border-brand-border shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
    <div className="overflow-y-auto flex-1 min-h-0">
      <table className="w-full text-sm">
        <thead className="bg-brand-canvas">
          <tr>
            <TableHeader>Date</TableHeader>
            <TableHeader>Batch</TableHeader>
            <TableHeader>Buyer</TableHeader>
            <TableHeader>Weight (kg)</TableHeader>
            <TableHeader>Birds</TableHeader>
            <TableHeader>Payment</TableHeader>
            <TableHeader>Amount</TableHeader>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-border">
          {data.map((sale) => (
            <tr
              key={sale.id}
              className="hover:bg-brand-canvas transition-colors"
            >
              <td className="px-4 py-2.5 text-brand-ink-muted text-xs">
                {dayjs(sale.date).format("DD MMM YYYY")}
              </td>
              <td className="px-4 py-2.5 font-bold text-brand-ink text-xs">
                {sale.batch}
              </td>
              <td className="px-4 py-2.5 text-brand-ink-soft font-medium text-xs">
                {sale.buyer}
              </td>
              <td className="px-4 py-2.5 text-brand-ink-soft text-xs">
                {parseFloat(sale.weight).toLocaleString()}
              </td>
              <td className="px-4 py-2.5 text-brand-ink-soft text-xs">
                {sale.birds?.toLocaleString() ?? "-"}
              </td>
              <td className="px-4 py-2.5">
                <Badge
                  variant={sale.payment_type === "paid" ? "green" : "amber"}
                >
                  {sale.payment_type}
                </Badge>
              </td>
              <td className="px-4 py-2.5 font-bold text-brand-ink">
                ₹{parseFloat(sale.amount).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {data.length === 0 && (
      <div className="p-4 pt-8 text-center text-brand-ink-muted flex items-start justify-center flex-1">
        No sales found
      </div>
    )}
  </div>
);

export const PurchasesListing = ({ data }: { data: RecentPurchase[] }) => (
  <div className="bg-brand-card rounded-xl border border-brand-border shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
    <div className="overflow-y-auto flex-1 min-h-0">
      <table className="w-full text-sm">
        <thead className="bg-brand-canvas">
          <tr>
            <TableHeader>Invoice #</TableHeader>
            <TableHeader>Date</TableHeader>
            <TableHeader>Type</TableHeader>
            <TableHeader>Quantity</TableHeader>
            <TableHeader>Supplier</TableHeader>
            <TableHeader>Amount</TableHeader>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-border">
          {data.map((purchase) => (
            <tr
              key={purchase.id}
              className="hover:bg-brand-canvas transition-colors"
            >
              <td className="px-4 py-2.5 text-brand-ink-muted text-xs font-medium">
                {purchase.invoice_number}
              </td>
              <td className="px-4 py-2.5 text-brand-ink-muted text-xs">
                {dayjs(purchase.invoice_date).format("DD MMM YYYY")}
              </td>
              <td className="px-4 py-2.5">
                <Badge variant={purchase.type === "paid" ? "green" : "amber"}>
                  {purchase.type}
                </Badge>
              </td>
              <td className="px-4 py-2.5 text-brand-ink-soft font-medium text-xs">
                {purchase.quantity}
              </td>
              <td className="px-4 py-2.5 font-bold text-brand-ink">
                {purchase.supplier_name}
              </td>
              <td className="px-4 py-2.5 font-bold text-brand-ink">
                ₹{parseFloat(purchase.amount).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {data.length === 0 && (
      <div className="p-4 pt-8 text-center text-brand-ink-muted flex items-start justify-center flex-1">
        No purchases found
      </div>
    )}
  </div>
);
