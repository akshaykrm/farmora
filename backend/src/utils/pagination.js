export function calculateOffSet(page, limit) {
  let offset = undefined
  if (page && limit) {
    offset = (page - 1) * limit
    return offset
  }
  return offset
}
