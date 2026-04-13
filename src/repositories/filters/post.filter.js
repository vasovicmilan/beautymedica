export function buildPostFilter({
  search = "",
  isAdmin = false,
  status = null,
  expertId = null,
  categories = null,
  tags = null,
  isIndexable = null,
} = {}) {
  const filter = {};

  if (!isAdmin && !status) {
    filter.status = { $in: ["published", "featured"] };
  }

  if (status) {
    filter.status = Array.isArray(status) ? { $in: status } : status;
  }

  if (expertId) filter.expert = expertId;
  if (categories && categories.length) filter.categories = { $in: categories };
  if (tags && tags.length) filter.tags = { $in: tags };
  if (isIndexable !== null) filter.isIndexable = isIndexable;

  if (search && search.trim()) {
    filter.$text = { $search: search.trim() };
  }

  return filter;
}