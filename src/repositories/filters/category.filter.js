export function buildCategoryFilter({
  search = "",
  isAdmin = false,
  domain = null,
  parent = null,
  isIndexable = null,
  isActive = null,
} = {}) {
  const filter = {};

  if (!isAdmin && isActive === null) {
    filter["meta.isActive"] = true;
  }

  if (isActive !== null) {
    filter["meta.isActive"] = isActive;
  }

  if (domain) filter.domain = domain;
  if (parent !== undefined && parent !== null) filter.parent = parent === "null" ? null : parent;
  if (isIndexable !== null) filter.isIndexable = isIndexable;

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