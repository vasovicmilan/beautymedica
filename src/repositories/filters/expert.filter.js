export function buildExpertFilter({ search = "", isAdmin = false } = {}) {
  const filter = {};

  if (!isAdmin) {
    filter.isActive = true;
  }

  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), "i");
    filter.$or = [
      { firstName: regex },
      { lastName: regex },
      { title: regex },
      { bio: regex },
    ];
  }

  return filter;
}