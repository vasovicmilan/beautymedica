export function buildServiceFilter({ search = "", isAdmin = false } = {}) {
  const filter = {};

  if (!isAdmin) {
    filter.isActive = true;
  }

  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), "i");
    filter.$or = [
      { name: regex },
      { shortDescription: regex },
      { longDescription: regex },
    ];
  }

  return filter;
}