import PendingInvoicesList from "@components/pending-invoices/pending-invoices-list";
import type { PendingInvoicesSummary } from "@app-types/dashboard.types";
import Badge from "@components/Badge";

const PendingInvoicesCard = ({ data }: { data?: PendingInvoicesSummary }) => {
  if (!data || data.total === 0) return null;

  return (
    <section className="animate-in fade-in duration-700 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-brand-ink">
          Incomplete Invoices
        </h2>
        <Badge variant="warning">{data.total} pending</Badge>
        <span className="text-xs text-brand-ink-muted">
          {data.purchases} purchases · {data.sales} sales. These must be
          completed before closing a batch or season.
        </span>
      </div>
      <PendingInvoicesList items={data.items} total={data.total} />
    </section>
  );
};

export default PendingInvoicesCard;
