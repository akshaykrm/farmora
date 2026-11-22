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
  duration: number;
};

// Package duration is stored in months (the backend adds `duration` months to
// the subscription start date).
function formatPackageDuration(months: number): string {
  const value = Number(months);
  if (!Number.isFinite(value) || value <= 0) return "";
  if (value % 12 === 0) return `${value / 12}yr`;
  return `${value}mo`;
}

function PackageExpiry({ duration }: { duration: number }) {
  const label = formatPackageDuration(duration);
  if (!label) return null;
  return <span className="text-sm text-brand-ink-muted"> / {label}</span>;
}

const PackagePriceDisplay = ({ pkg, duration, size = "landing" }: Props) => {
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
        <PackageExpiry duration={duration} />
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
        <PackageExpiry duration={duration} />
      </div>
    );
  }

  return (
    <>
      <span className={primaryClass}>{formatCurrency(actual)}</span>
      <PackageExpiry duration={duration} />
    </>
  );
};

export default PackagePriceDisplay;
