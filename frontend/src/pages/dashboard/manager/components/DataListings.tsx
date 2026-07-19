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
  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
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
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    slate: "bg-slate-50 text-slate-700 border-slate-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    red: "bg-rose-50 text-rose-700 border-rose-100",
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
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50/30">
          <tr>
            <TableHeader>Farm Name</TableHeader>
            <TableHeader>Location</TableHeader>
            <TableHeader>Capacity</TableHeader>
            <TableHeader>Status</TableHeader>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((farm) => (
            <tr
              key={farm.id}
              className="hover:bg-slate-50/50 transition-colors"
            >
              <td className="px-6 py-4 font-bold text-slate-800">
                {farm.name}
              </td>
              <td className="px-6 py-4 text-slate-500">{farm.place || "-"}</td>
              <td className="px-6 py-4 text-slate-600 font-medium">
                {farm.capacity || "-"}
              </td>
              <td className="px-6 py-4">
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
      <div className="p-8 text-center text-slate-400">No farms found</div>
    )}
  </div>
);

export const BatchesListing = ({ data }: { data: Batch[] }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
    <div className="p-4 border-b border-slate-50 flex justify-between items-center">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
        Recent Batches
      </span>
    </div>
    <div className="overflow-x-auto flex-1">
      <table className="w-full text-sm">
        <thead className="bg-slate-50/30">
          <tr>
            <TableHeader>Name</TableHeader>
            <TableHeader>Season / Farm</TableHeader>
            <TableHeader>Profit</TableHeader>
            <TableHeader>Status</TableHeader>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((batch) => (
            <tr
              key={batch.id}
              className="hover:bg-slate-50/50 transition-colors"
            >
              <td className="px-6 py-4 font-bold text-slate-800">
                {batch.name}
              </td>
              <td className="px-6 py-4 text-slate-500 text-xs">
                {batch.season_name} / {batch.farm_name}
              </td>
              <td
                className={`px-6 py-4 font-bold text-xs ${
                  (batch.profit || 0) >= 0
                    ? "text-emerald-600"
                    : "text-rose-600"
                }`}
              >
                ₹{(batch.profit || 0).toLocaleString()}
              </td>
              <td className="px-6 py-4">
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
      <div className="p-8 text-center text-slate-400">No batches found</div>
    )}
  </div>
);

export const SeasonsListing = ({ data }: { data: Season[] }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
    <div className="p-4 border-b border-slate-50 flex justify-between items-center">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
        Seasonal Data
      </span>
    </div>
    <div className="overflow-x-auto flex-1">
      <table className="w-full text-sm">
        <thead className="bg-slate-50/30">
          <tr>
            <TableHeader>Season</TableHeader>
            <TableHeader>Period</TableHeader>
            <TableHeader>Margin</TableHeader>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((season) => (
            <tr
              key={season.id}
              className="hover:bg-slate-50/50 transition-colors"
            >
              <td className="px-6 py-4 font-bold text-slate-800">
                {season.name}
              </td>
              <td className="px-6 py-4 text-slate-500 text-xs">
                {dayjs(season.from_date).format("MMM YYYY")} -{" "}
                {season.to_date
                  ? dayjs(season.to_date).format("MMM YYYY")
                  : "Present"}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
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
      <div className="p-8 text-center text-slate-400">No seasons found</div>
    )}
  </div>
);

export const SalesListing = ({ data }: { data: RecentSale[] }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50/30">
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
        <tbody className="divide-y divide-slate-100">
          {data.map((sale) => (
            <tr
              key={sale.id}
              className="hover:bg-slate-50/50 transition-colors"
            >
              <td className="px-6 py-4 text-slate-500 text-xs">
                {dayjs(sale.date).format("DD MMM YYYY")}
              </td>
              <td className="px-6 py-4 font-bold text-slate-800 text-xs">
                {sale.batch}
              </td>
              <td className="px-6 py-4 text-slate-600 font-medium text-xs">
                {sale.buyer}
              </td>
              <td className="px-6 py-4 text-slate-600 text-xs">
                {parseFloat(sale.weight).toLocaleString()}
              </td>
              <td className="px-6 py-4 text-slate-600 text-xs">
                {sale.birds?.toLocaleString() ?? "-"}
              </td>
              <td className="px-6 py-4">
                <Badge variant={sale.payment_type === "paid" ? "green" : "amber"}>
                  {sale.payment_type}
                </Badge>
              </td>
              <td className="px-6 py-4 font-bold text-slate-800">
                ₹{parseFloat(sale.amount).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {data.length === 0 && (
      <div className="p-8 text-center text-slate-400">No sales found</div>
    )}
  </div>
);

export const PurchasesListing = ({ data }: { data: RecentPurchase[] }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50/30">
          <tr>
            <TableHeader>Invoice #</TableHeader>
            <TableHeader>Date</TableHeader>
            <TableHeader>Type</TableHeader>
            <TableHeader>Quantity</TableHeader>
            <TableHeader>Supplier</TableHeader>
            <TableHeader>Amount</TableHeader>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((purchase) => (
            <tr
              key={purchase.id}
              className="hover:bg-slate-50/50 transition-colors"
            >
              <td className="px-6 py-4 text-slate-500 text-xs font-medium">
                {purchase.invoice_number}
              </td>
              <td className="px-6 py-4 text-slate-500 text-xs">
                {dayjs(purchase.invoice_date).format("DD MMM YYYY")}
              </td>
              <td className="px-6 py-4">
                <Badge variant={purchase.type === "paid" ? "green" : "amber"}>
                  {purchase.type}
                </Badge>
              </td>
              <td className="px-6 py-4 text-slate-600 font-medium text-xs">
                {purchase.quantity}
              </td>
              <td className="px-6 py-4 font-bold text-slate-800">
                {purchase.supplier_name}
              </td>
              <td className="px-6 py-4 font-bold text-slate-800">
                ₹{parseFloat(purchase.amount).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {data.length === 0 && (
      <div className="p-8 text-center text-slate-400">No purchases found</div>
    )}
  </div>
);

export const TransactionsListing = ({ data }: { data: Transaction[] }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50/30">
          <tr>
            <TableHeader>Transaction Details</TableHeader>
            <TableHeader>Type</TableHeader>
            <TableHeader>Amount</TableHeader>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((tx) => (
            <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      tx.type === "credit"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-rose-50 text-rose-600"
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
                    <p className="font-bold text-slate-800">{tx.description}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                      {dayjs(tx.date).format("DD MMM YYYY")} • {tx.category}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <Badge variant={tx.type === "credit" ? "green" : "red"}>
                  {tx.type}
                </Badge>
              </td>
              <td
                className={`px-6 py-4 font-bold text-base ${
                  tx.type === "credit" ? "text-emerald-600" : "text-rose-600"
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
      <div className="p-8 text-center text-slate-400">
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
