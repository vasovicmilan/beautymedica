export function buildAppointmentFilter({
  search = "",
  isAdmin = false,
  allowedStatuses = ["confirmed", "completed"],
  userId = null,
  employeeId = null,
  assignedTo = null,
  status = null,
  startTimeFrom = null,
  startTimeTo = null,
} = {}) {
  const filter = {};

  if (!isAdmin && !status) {
    filter.status = { $in: allowedStatuses };
  }

  if (status) {
    filter.status = Array.isArray(status) ? { $in: status } : status;
  }

  if (userId) filter.user = userId;
  if (employeeId) filter.employee = employeeId;
  if (assignedTo) filter.assignedTo = assignedTo;

  if (startTimeFrom || startTimeTo) {
    filter.startTime = {};
    if (startTimeFrom) filter.startTime.$gte = startTimeFrom;
    if (startTimeTo) filter.startTime.$lte = startTimeTo;
  }

  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), "i");
    filter.$or = [
      { "customerSnapshot.firstName": regex },
      { "customerSnapshot.lastName": regex },
      { "customerSnapshot.email": regex },
      { "variant.name": regex },
      { note: regex },
    ];
  }

  return filter;
}