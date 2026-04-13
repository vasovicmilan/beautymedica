export function buildRoleFilter({ search = "" } = {}) {
  const filter = {};

  if (search && search.trim()) {
    filter.name = new RegExp(search.trim(), "i");
  }

  return filter;
}