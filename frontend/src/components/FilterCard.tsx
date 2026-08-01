import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { useState, type ReactNode } from "react";

type Props = {
  title?: string;
  children: ReactNode;
  className?: string;
  filters?: Record<string, unknown>;
  onClearAll?: () => void;
  openByDefault?: boolean;
};

const ignoredFilterKeys = new Set([
  "page",
  "limit",
  "b_page",
  "b_limit",
  "gc_page",
  "gc_limit",
  "gs_page",
  "gs_limit",
  "e_page",
  "e_limit",
  "i_page",
  "i_limit",
  "p_page",
  "p_limit",
  "c_page",
  "c_limit",
]);

const filterLabels: Record<string, string> = {
  buyer_id: "Buyer",
  buyer_name: "Buyer",
  category_id: "Category",
  farm_id: "Farm",
  investor_id: "Investor",
  purpose: "Purpose",
  search: "Search",
  season_id: "Season",
  batch_id: "Batch",
  transaction_type_id: "Transaction type",
  vendor_id: "Vendor",
  return_type: "Return type",
  start_date: "From",
  end_date: "To",
  from_date: "From",
  to_date: "To",
};

const getFilterChips = (filters?: Record<string, unknown>) => {
  if (!filters) return [];

  return Object.entries(filters).flatMap(([key, value]) => {
    if (
      ignoredFilterKeys.has(key) ||
      value === null ||
      value === undefined ||
      value === "" ||
      value === "all"
    ) {
      return [];
    }

    const label = filterLabels[key] || key.replace(/_/g, " ");
    const formattedValue =
      typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)
        ? value.slice(0, 10)
        : String(value);

    return [`${label}: ${formattedValue}`];
  });
};

const FilterCard = ({ title, children, className = "", filters, onClearAll, openByDefault }: Props) => {
  const [isOpen, setIsOpen] = useState(openByDefault ?? false);
  const chips = getFilterChips(filters);

  return (
    <section className={`mb-6 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2 text-sm">
          {chips.length > 0 ? (
            <>
              {chips.map((chip) => (
                <span
                  key={chip}
                  className="max-w-full truncate rounded-full bg-brand-primary-soft px-3 py-1 text-xs font-medium text-brand-accent"
                >
                  {chip}
                </span>
              ))}
              {onClearAll && (
                <button
                  type="button"
                  onClick={onClearAll}
                  className="rounded-md px-2 py-1 text-xs font-medium text-brand-ink-muted transition-colors hover:text-brand-danger"
                >
                  Clear all
                </button>
              )}
            </>
          ) : (
            <span className="text-xs text-brand-ink-muted">No active filters</span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          className="inline-flex items-center gap-2 rounded-md border border-brand-border-strong bg-brand-card px-3 py-2 text-sm font-medium text-brand-ink transition-colors hover:border-brand-primary hover:text-brand-accent"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {title || "Filters"}
          {chips.length > 0 && (
            <span className="rounded-full bg-brand-primary-soft px-2 py-0.5 text-xs text-brand-accent">
              {chips.length}
            </span>
          )}
          <ChevronDown
            className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 rounded-xl border border-brand-border bg-brand-card p-4 shadow-xs">
          {children}
        </div>
      )}
    </section>
  );
};

export default FilterCard;
