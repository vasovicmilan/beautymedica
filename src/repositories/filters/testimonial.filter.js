export function buildTestimonialFilter({
  search = "",
  isAdmin = false,
  rating = null,
  serviceId = null,
  employeeId = null,
  userId = null,
  approved = null,
} = {}) {
  const filter = {};

  if (!isAdmin && approved === null) {
    filter.approved = true;
  }

  if (approved !== null) {
    filter.approved = approved;
  }

  if (rating !== null && rating >= 1 && rating <= 5) filter.rating = rating;
  if (serviceId) filter.service = serviceId;
  if (employeeId) filter.employee = employeeId;
  if (userId) filter.user = userId;

  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), "i");
    filter.$or = [
      { displayName: regex },
      { comment: regex },
    ];
  }

  return filter;
}