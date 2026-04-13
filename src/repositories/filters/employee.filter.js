export function buildEmployeeFilter({ isAdmin = false } = {}) {
  const filter = {};

  if (!isAdmin) {
    filter.isActive = true;
  }

  return filter;
}