export function buildContactFilter({
  search = "",
  isAdmin = false,
  userId = null,
  status = null,
  type = null,
} = {}) {
  const filter = {};

  if (!isAdmin) {
    if (!userId) {
      throw new Error("userId is required for non-admin contact search");
    }
    filter.user = userId;
  }

  if (status) filter.status = status;
  if (type) filter.type = type;

  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), "i");
    filter.$or = [
      { firstName: regex },
      { lastName: regex },
      { email: regex },
      { title: regex },
    ];
  }

  return filter;
}