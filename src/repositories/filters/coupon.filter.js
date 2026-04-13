export function buildCouponFilter({
  search = "",
  isAdmin = false,
  type = null,
  isActive = null,
  validAt = new Date(),
} = {}) {
  const filter = {};

  if (!isAdmin && isActive === null) {
    filter.isActive = true;
    filter.startDate = { $lte: validAt };
    filter.endDate = { $gte: validAt };
  }

  if (isActive !== null) {
    filter.isActive = isActive;

    if (!isAdmin && isActive === true && filter.startDate === undefined) {
      filter.startDate = { $lte: validAt };
      filter.endDate = { $gte: validAt };
    }
  }

  if (type) filter.type = type;

  if (search && search.trim()) {
    filter.code = new RegExp(search.trim(), "i");
  }

  return filter;
}