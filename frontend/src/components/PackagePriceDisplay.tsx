import { formatCurrency } from "@utils/currency";
import {
  getEffectivePrice,
  hasPackageDiscount,
  isFreePackage,
  type PackagePricingFields,
} from "@utils/package-price";

type Props = {
  pkg: PackagePricingFields;
  size?: "landing" | "compact";
};

const PackagePriceDisplay = ({ pkg, size = "landing" }: Props) => {
  const actual = Number(pkg.actual_price ?? 0);
  const effective = getEffectivePrice(pkg);
  const discounted = hasPackageDiscount(pkg);
  const free = isFreePackage(pkg);

  const primaryClass =
    size === "landing"
      ? "text-4xl font-bold text-brand-accent"
      : "text-sm font-medium text-brand-ink";

  if (free) {
    return (
      <div className="flex flex-wrap items-baseline gap-2">
        {actual > 0 && (
          <span
            className={`text-brand-ink-muted line-through ${
              size === "landing" ? "text-xl" : "text-sm"
            }`}
          >
            {formatCurrency(actual)}
          </span>
        )}
        <span className={primaryClass}>Free</span>
      </div>
    );
  }

  if (discounted) {
    return (
      <div className="flex flex-wrap items-baseline gap-2">
        <span
          className={`text-brand-ink-muted line-through ${
            size === "landing" ? "text-xl" : "text-sm"
          }`}
        >
          {formatCurrency(actual)}
        </span>
        <span className={primaryClass}>{formatCurrency(effective)}</span>
      </div>
    );
  }

  return <span className={primaryClass}>{formatCurrency(actual)}</span>;
};

export default PackagePriceDisplay;
