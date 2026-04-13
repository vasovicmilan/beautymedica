export function buildTagFilter({
  search = "",
  isAdmin = false,
  domain = null,
  type = null,
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
  if (type) filter.type = type;
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