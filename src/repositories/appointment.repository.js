import Appointment from "../models/appointment.model.js";
import { resolveLimit, resolveSkip } from "../utils/pagination.util.js";
import { buildAppointmentFilter } from "./filters/appointment.filter.js";

export async function findAppointments({
  search = "",
  limit: rawLimit,
  page: rawPage = 1,
  isAdmin = false,
  allowedStatuses = ["confirmed", "completed"],
  userId = null,
  employeeId = null,
  assignedTo = null,
  status = null,
  startTimeFrom = null,
  startTimeTo = null,
  populateFields = null,
} = {}) {
  const limit = resolveLimit(rawLimit);
  const skip = resolveSkip(rawPage, limit);
  const filter = buildAppointmentFilter({
    search,
    isAdmin,
    allowedStatuses,
    userId,
    employeeId,
    assignedTo,
    status,
    startTimeFrom,
    startTimeTo,
  });

  let query = Appointment.find(filter)
    .sort({ startTime: 1 })
    .skip(skip)
    .limit(limit)
    .lean();

  if (populateFields) {
    query = query.populate(populateFields);
  }

  const [data, total] = await Promise.all([query, Appointment.countDocuments(filter)]);
  return { data, total, page: parseInt(rawPage, 10) || 1, limit };
}

export async function findAppointmentById(id, populateFields = null) {
  let query = Appointment.findById(id).lean();
  if (populateFields) query = query.populate(populateFields);
  return query;
}

export async function findAppointmentsByUser(userId, options = {}) {
  return findAppointments({ ...options, userId });
}

export async function findAppointmentsByEmployee(employeeId, options = {}) {
  return findAppointments({ ...options, employeeId });
}

export async function findAppointmentsAssignedTo(assignedTo, options = {}) {
  return findAppointments({ ...options, assignedTo });
}

export async function findOverlappingAppointments(employeeId, startTime, endTime, excludeAppointmentId = null) {
  const filter = {
    $or: [{ employee: employeeId }, { assignedTo: employeeId }],
    status: { $in: ["pending", "confirmed"] },
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
  };
  if (excludeAppointmentId) {
    filter._id = { $ne: excludeAppointmentId };
  }
  return Appointment.find(filter).lean();
}

export async function createAppointment(data) {
  const appointment = new Appointment(data);
  return appointment.save();
}

export async function updateAppointmentById(id, data) {
  return Appointment.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).lean();
}

export async function deleteAppointmentById(id) {
  return Appointment.findByIdAndDelete(id).lean();
}