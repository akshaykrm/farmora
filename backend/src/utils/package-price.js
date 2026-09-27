export const getEffectivePackagePrice = (packageRecord) => {
  if (!packageRecord) {
    return 0
  }

  let actual
  let discount

  if (typeof packageRecord.getDataValue === 'function') {
    actual = Number(packageRecord.getDataValue('actual_price') ?? 0)
    discount = Number(packageRecord.getDataValue('discount_price') ?? 0)
  } else {
    actual = Number(packageRecord.actual_price ?? 0)
    discount = Number(packageRecord.discount_price ?? 0)
  }

  return Math.max(0, actual - discount)
}
