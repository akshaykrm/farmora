import { Link } from "react-router";
import dayjs from "dayjs";
import Badge from "@components/Badge";
import { formatCurrency } from "@utils/currency";
import type { PendingInvoiceItem } from "@app-types/dashboard.types";

const editHref = (item: PendingInvoiceItem) => {
  const params = new URLSearchParams({ is_incomplete: "true" });
  if (item.batch_id) params.set("batch_id", String(item.batch_id));
  return item.type === "purchase"
    ? `/expense/purchase?${params.toString()}`
    : `/sales/sale?${params.toString()}`;
};

const Th = ({ children }: { children: string }) => (
  <th className="px-4 py-2.5 text-left text-[10px] font-bold text-brand-ink-muted uppercase tracking-widest border-b border-brand-border">
    {children}
  </th>
);

type Props = {
  items: PendingInvoiceItem[];
  total: number;
  emptyMessage?: string;
};

const PendingInvoicesList = ({
  items,
  total,
  emptyMessage = "No incomplete invoices",
}: Props) => (
  <div className="bg-brand-card rounded-xl border border-brand-border shadow-sm overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-brand-canvas">
          <tr>
            <Th>Type</Th>
            <Th>Invoice</Th>
            <Th>Date</Th>
            <Th>Party</Th>
            <Th>Batch</Th>
            <Th>Amount</Th>
            <Th>Action</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-border">
          {items.map((item) => (
            <tr
              key={`${item.type}-${item.id}`}
              className="hover:bg-brand-canvas transition-colors"
            >
              <td className="px-4 py-2.5">
                <Badge variant={item.type === "purchase" ? "info" : "success"}>
                  {item.type === "purchase" ? "Purchase" : "Sale"}
                </Badge>
              </td>
              <td className="px-4 py-2.5 font-bold text-brand-ink">
                {item.reference}
              </td>
              <td className="px-4 py-2.5 text-brand-ink-muted text-xs">
                {dayjs(item.date).format("DD MMM YYYY")}
              </td>
              <td className="px-4 py-2.5 text-brand-ink-soft text-xs">
                {item.party}
              </td>
              <td className="px-4 py-2.5 text-brand-ink-muted text-xs">
                {item.batch}
              </td>
              <td className="px-4 py-2.5 text-brand-ink-soft font-medium text-xs">
                {formatCurrency(Number(item.amount))}
              </td>
              <td className="px-4 py-2.5">
                <Link
                  to={editHref(item)}
                  className="text-brand-primary-strong text-xs font-semibold hover:underline"
                >
                  Complete
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {items.length === 0 && (
      <div className="p-4 pt-6 text-center text-brand-ink-muted">
        {emptyMessage}
      </div>
    )}
    {total > items.length && (
      <div className="px-4 py-2 text-xs text-brand-ink-muted border-t border-brand-border">
        Showing {items.length} of {total}. Open the purchase or sale list to see
        the rest.
      </div>
    )}
  </div>
);

export default PendingInvoicesList;
