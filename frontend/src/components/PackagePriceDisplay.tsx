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
  duration: numb;
};

//TODO: This needs to calculate duration and automatically calculate the valid
// time span. Currently we only have duration but we don't have identifier for
// months or anything this need to be thought out and implemented
function PackageExpiry(props: { duration: number }) {
  return <span className="text-sm text-brand-ink-muted"> / 1yr</span>;
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
