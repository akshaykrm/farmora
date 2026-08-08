import type { ReactNode } from "react";
import type {
  Farm,
  Batch,
  Season,
  Transaction,
} from "../types";
import type { RecentPurchase, RecentSale } from "@app-types/dashboard.types";
import dayjs from "dayjs";

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
    green: "bg-brand-success-soft text-brand-success-strong border-brand-success-soft",
    blue: "bg-brand-info-soft text-brand-info-strong border-brand-info-soft",
    slate: "bg-brand-canvas text-brand-ink-soft border-brand-border",
    amber: "bg-brand-warning-soft text-brand-warning-strong border-brand-warning-soft",
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

export const FarmsListing = ({ data }: { data: Farm[] }) => (
  <div className="bg-brand-card rounded-xl border border-brand-border shadow-sm overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-brand-canvas">
          <tr>
            <TableHeader>Farm Name</TableHeader>
            <TableHeader>Location</TableHeader>
            <TableHeader>Capacity</TableHeader>
            <TableHeader>Status</TableHeader>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-border">
          {data.map((farm) => (
            <tr
              key={farm.id}
              className="hover:bg-brand-canvas transition-colors"
            >
              <td className="px-4 py-2.5 font-bold text-brand-ink">
                {farm.name}
              </td>
              <td className="px-4 py-2.5 text-brand-ink-muted">{farm.place || "-"}</td>
              <td className="px-4 py-2.5 text-brand-ink-soft font-medium">
                {farm.capacity || "-"}
              </td>
              <td className="px-4 py-2.5">
                <Badge variant={farm.status === "active" ? "green" : "slate"}>
                  {farm.status}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {data.length === 0 && (
      <div className="p-4 pt-8 text-center text-brand-ink-muted flex items-start justify-center flex-1">No farms found</div>
    )}
  </div>
);

export const BatchesListing = ({ data }: { data: Batch[] }) => (
  <div className="bg-brand-card rounded-xl border border-brand-border shadow-sm overflow-hidden h-full flex flex-col">
    <div className="p-4 border-b border-brand-border flex justify-between items-center">
      <span className="text-xs font-bold text-brand-ink-muted uppercase tracking-widest">
        Recent Batches
      </span>
    </div>
    <div className="overflow-x-auto flex-1">
      <table className="w-full text-sm">
        <thead className="bg-brand-canvas">
          <tr>
            <TableHeader>Name</TableHeader>
            <TableHeader>Season / Farm</TableHeader>
            <TableHeader>Profit</TableHeader>
            <TableHeader>Status</TableHeader>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-border">
          {data.map((batch) => (
            <tr
              key={batch.id}
              className="hover:bg-brand-canvas transition-colors"
            >
              <td className="px-4 py-2.5 font-bold text-brand-ink">
                {batch.name}
              </td>
              <td className="px-4 py-2.5 text-brand-ink-muted text-xs">
                {batch.season_name} / {batch.farm_name}
              </td>
              <td
                className={`px-4 py-2.5 font-bold text-xs ${
                  (batch.profit || 0) >= 0
                    ? "text-brand-success"
                    : "text-brand-danger"
                }`}
              >
                ₹{(batch.profit || 0).toLocaleString()}
              </td>
              <td className="px-4 py-2.5">
                <Badge variant={batch.status === "active" ? "blue" : "slate"}>
                  {batch.status}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {data.length === 0 && (
      <div className="p-4 pt-8 text-center text-brand-ink-muted flex items-start justify-center flex-1">No batches found</div>
    )}
  </div>
);

export const SeasonsListing = ({ data }: { data: Season[] }) => (
  <div className="bg-brand-card rounded-xl border border-brand-border shadow-sm overflow-hidden h-full flex flex-col">
    <div className="p-4 border-b border-brand-border flex justify-between items-center">
      <span className="text-xs font-bold text-brand-ink-muted uppercase tracking-widest">
        Seasonal Data
      </span>
    </div>
    <div className="overflow-x-auto flex-1">
      <table className="w-full text-sm">
        <thead className="bg-brand-canvas">
          <tr>
            <TableHeader>Season</TableHeader>
            <TableHeader>Period</TableHeader>
            <TableHeader>Margin</TableHeader>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-border">
          {data.map((season) => (
            <tr
              key={season.id}
              className="hover:bg-brand-canvas transition-colors"
            >
              <td className="px-4 py-2.5 font-bold text-brand-ink">
                {season.name}
              </td>
              <td className="px-4 py-2.5 text-brand-ink-muted text-xs">
                {dayjs(season.from_date).format("MMM YYYY")} -{" "}
                {season.to_date
                  ? dayjs(season.to_date).format("MMM YYYY")
                  : "Present"}
              </td>
              <td className="px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-brand-card-soft rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-success"
                      style={{ width: `${season.margin || 0}%` }}
                    ></div>
                  </div>
                  <span className="font-bold text-xs">
                    {season.margin || 0}%
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {data.length === 0 && (
      <div className="p-4 pt-8 text-center text-brand-ink-muted flex items-start justify-center flex-1">No seasons found</div>
    )}
  </div>
);

export const SalesListing = ({ data }: { data: RecentSale[] }) => (
  <div className="bg-brand-card rounded-xl border border-brand-border shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
    <div className="overflow-y-auto flex-1 min-h-[240px]">
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
                <Badge variant={sale.payment_type === "paid" ? "green" : "amber"}>
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
      <div className="p-4 pt-8 text-center text-brand-ink-muted flex items-start justify-center flex-1">No sales found</div>
    )}
  </div>
);

export const PurchasesListing = ({ data }: { data: RecentPurchase[] }) => (
  <div className="bg-brand-card rounded-xl border border-brand-border shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
    <div className="overflow-y-auto flex-1 min-h-[240px]">
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
      <div className="p-4 pt-8 text-center text-brand-ink-muted flex items-start justify-center flex-1">No purchases found</div>
    )}
  </div>
);

export const TransactionsListing = ({ data }: { data: Transaction[] }) => (
  <div className="bg-brand-card rounded-xl border border-brand-border shadow-sm overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-brand-canvas">
          <tr>
            <TableHeader>Transaction Details</TableHeader>
            <TableHeader>Type</TableHeader>
            <TableHeader>Amount</TableHeader>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-border">
          {data.map((tx) => (
            <tr key={tx.id} className="hover:bg-brand-canvas transition-colors">
              <td className="px-4 py-2.5">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      tx.type === "credit"
                        ? "bg-brand-success-soft text-brand-success"
                        : "bg-brand-danger-soft text-brand-danger"
                    }`}
                  >
                    {tx.type === "credit" ? (
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
                          d="M7 11l5-5m0 0l5 5m-5-5v12"
                        />
                      </svg>
                    ) : (
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
                          d="M17 13l-5 5m0 0l-5-5m5 5V6"
                        />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-brand-ink">{tx.description}</p>
                    <p className="text-[10px] text-brand-ink-muted uppercase tracking-widest">
                      {dayjs(tx.date).format("DD MMM YYYY")} • {tx.category}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-2.5">
                <Badge variant={tx.type === "credit" ? "green" : "red"}>
                  {tx.type}
                </Badge>
              </td>
              <td
                className={`px-4 py-2.5 font-bold text-base ${
                  tx.type === "credit" ? "text-brand-success" : "text-brand-danger"
                }`}
              >
                {tx.type === "credit" ? "+" : "-"}₹{tx.amount.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {data.length === 0 && (
      <div className="p-4 pt-8 text-center text-brand-ink-muted flex items-start justify-center flex-1">
        No transactions found
      </div>
    )}
  </div>
);

const DataListings = {
  FarmsListing,
  BatchesListing,
  SeasonsListing,
  SalesListing,
  PurchasesListing,
  TransactionsListing,
};

export default DataListings;
