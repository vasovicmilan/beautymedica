export function buildUserFilter({ search = "", isAdmin = false } = {}) {
  const filter = {};

  if (!isAdmin) {
    filter.isActive = true;
  }

  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), "i");
    filter.$or = [
      { email: regex },
      { firstName: regex },
      { lastName: regex },
    ];
  }

  return filter;
}