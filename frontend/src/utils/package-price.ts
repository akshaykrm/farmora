export type PackagePricingFields = {
  actual_price: number | string;
  discount_price?: number | string | null;
  price?: number | string | null;
};

const toNumber = (value: number | string | null | undefined) =>
  Number(value ?? 0);

export const getEffectivePrice = (pkg: PackagePricingFields) => {
  if (
    (pkg.actual_price === undefined || pkg.actual_price === null) &&
    pkg.price != null
  ) {
    return Math.max(0, toNumber(pkg.price));
  }
  const actual = toNumber(pkg.actual_price);
  const discount = toNumber(pkg.discount_price);
  return Math.max(0, actual - discount);
};

export const isFreePackage = (pkg: PackagePricingFields) =>
  getEffectivePrice(pkg) === 0;

export const hasPackageDiscount = (pkg: PackagePricingFields) =>
  toNumber(pkg.discount_price) > 0;
