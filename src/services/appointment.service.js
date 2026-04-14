import * as appointmentRepository from '../repositories/appointment.repository.js';
import { mapAppointment } from '../mappers/appointment.mapper.js';
import { badRequest, notFound, forbidden, internalError } from '../utils/error.util.js';
import logger from '../utils/logger.config.js';
import eventEmitter from '../events/eventEmitter.js';

function canAccessAppointment(appointment, userId, role) {
  if (role === 'admin') return true;
  if (role === 'employee') {
    const empId = appointment.employee?._id?.toString() || appointment.employee?.toString();
    const assignedId = appointment.assignedTo?._id?.toString() || appointment.assignedTo?.toString();
    return empId === userId || assignedId === userId;
  }
  const userIdStr = appointment.user?._id?.toString() || appointment.user?.toString();
  return userIdStr === userId;
}

async function validateNoOverlap(employeeId, startTime, endTime, excludeId = null) {
  if (!employeeId) return;
  const overlapping = await appointmentRepository.findOverlappingAppointments(
    employeeId, startTime, endTime, excludeId
  );
  if (overlapping.length > 0) {
    badRequest('Termin se preklapa sa postojećom rezervacijom', {
      count: overlapping.length,
      conflictStarts: overlapping.map(a => a.startTime),
    });
  }
}

function calculateEndTime(startTime, durationMinutes) {
  if (!startTime || !durationMinutes) return null;
  return new Date(startTime.getTime() + durationMinutes * 60000);
}

function mapAppointmentData(appointment, role, viewType = 'short') {
  if (!appointment) return null;
  return mapAppointment(appointment, role, viewType);
}

async function getPopulatedAppointment(id) {
  return appointmentRepository.findAppointmentById(id, {
    path: [
      { path: 'user', select: 'firstName lastName email phone' },
      { path: 'service', select: 'name slug' },
      { path: 'employee', populate: { path: 'userId', select: 'firstName lastName email telegramChatId' } },
      { path: 'assignedTo', populate: { path: 'userId', select: 'firstName lastName email telegramChatId' } },
      { path: 'coupon', select: 'code' },
    ],
  });
}

export async function findAppointments({
  search = '',
  limit = 20,
  page = 1,
  userId = null,
  role = 'user',
  filters = {},
  raw = false,
}) {
  try {
    const isAdmin = role === 'admin';
    let extraFilters = { ...filters };
    if (!isAdmin) {
      if (role === 'user') {
        extraFilters.userId = userId;
      } else if (role === 'employee') {
        extraFilters.employeeId = userId;
      }
    }
    const result = await appointmentRepository.findAppointments({
      search,
      limit,
      page,
      isAdmin,
      ...extraFilters,
      populateFields: [
        { path: 'user', select: 'firstName lastName email phone' },
        { path: 'service', select: 'name slug' },
        { path: 'employee', populate: { path: 'userId', select: 'firstName lastName' } },
        { path: 'assignedTo', populate: { path: 'userId', select: 'firstName lastName' } },
        { path: 'coupon', select: 'code' },
      ],
    });
    if (raw) return result;
    const mappedData = result.data.map(app => mapAppointmentData(app, role, 'short'));
    return {
      data: mappedData,
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  } catch (error) {
    logger.error({ error, params: { search, limit, page, role } }, 'findAppointments failed');
    throw internalError('Neuspešno dohvatanje termina');
  }
}

export async function findAppointmentDetailsById(id, userId, role) {
  try {
    const appointment = await getPopulatedAppointment(id);
    if (!appointment) notFound('Termin');
    if (!canAccessAppointment(appointment, userId, role)) {
      forbidden('Nemate pristup ovom terminu');
    }
    const mapped = mapAppointmentData(appointment, role, 'detail');
    return { appointment: mapped };
  } catch (error) {
    logger.error({ error, id, role }, 'findAppointmentDetailsById failed');
    throw error;
  }
}

export async function updateAppointmentById(id, data, userId, role) {
  try {
    const existing = await appointmentRepository.findAppointmentById(id);
    if (!existing) notFound('Termin');
    if (!canAccessAppointment(existing, userId, role)) forbidden();

    const newStart = data.startTime || existing.startTime;
    const duration = existing.variant?.duration;
    const newEnd = data.startTime && duration
      ? calculateEndTime(newStart, duration)
      : existing.endTime;
    const employeeId = data.employee || existing.employee || existing.assignedTo;
    if ((data.startTime || data.employee) && employeeId) {
      await validateNoOverlap(employeeId, newStart, newEnd, id);
      if (data.startTime && !data.endTime) data.endTime = newEnd;
    }

    const oldStatus = existing.status;
    const updated = await appointmentRepository.updateAppointmentById(id, data);
    logger.info({ appointmentId: id, updatedBy: userId, role }, 'Appointment updated');

    // Dohvati popunjen termin za event
    const populated = await getPopulatedAppointment(id);
    if (!populated) return updated;

    // Emituj događaj na osnovu promene statusa
    if (data.status && data.status !== oldStatus) {
      if (data.status === 'confirmed') {
        eventEmitter.emit('appointment.confirmed', populated);
      } else if (data.status === 'cancelled') {
        eventEmitter.emit('appointment.cancelled', populated);
      } else {
        eventEmitter.emit('appointment.updated', populated);
      }
    } else {
      eventEmitter.emit('appointment.updated', populated);
    }
    return updated;
  } catch (error) {
    logger.error({ error, id, data }, 'updateAppointmentById failed');
    throw error;
  }
}

export async function createNewAppointment(data, userId, role) {
  try {
    if (role === 'user') {
      data.user = userId;
    }
    if (!data.startTime || !data.variant?.duration) {
      badRequest('Nedostaje početak termina ili trajanje usluge');
    }
    const endTime = calculateEndTime(data.startTime, data.variant.duration);
    data.endTime = endTime;
    if (data.employee) {
      await validateNoOverlap(data.employee, data.startTime, endTime);
    }
    const newAppointment = await appointmentRepository.createAppointment(data);
    logger.info({ appointmentId: newAppointment._id, userId, role }, 'Appointment created');

    // Dohvati popunjen termin za event
    const populated = await getPopulatedAppointment(newAppointment._id);
    if (populated) {
      eventEmitter.emit('appointment.created', populated);
    }
    return newAppointment;
  } catch (error) {
    logger.error({ error, data }, 'createNewAppointment failed');
    throw error;
  }
}

export async function rescheduleAppointmentById(id, newStartTime, userId, role) {
  try {
    const existing = await appointmentRepository.findAppointmentById(id);
    if (!existing) notFound('Termin');
    if (!canAccessAppointment(existing, userId, role)) forbidden();
    const duration = existing.variant?.duration;
    if (!duration) badRequest('Termin nema definisano trajanje');
    const newEnd = calculateEndTime(newStartTime, duration);
    const employeeId = existing.employee || existing.assignedTo;
    if (employeeId) {
      await validateNoOverlap(employeeId, newStartTime, newEnd, id);
    }
    const updated = await appointmentRepository.updateAppointmentById(id, {
      startTime: newStartTime,
      endTime: newEnd,
      status: 'pending',
    });
    logger.info({ appointmentId: id, newStartTime, userId }, 'Appointment rescheduled');

    const populated = await getPopulatedAppointment(id);
    if (populated) {
      eventEmitter.emit('appointment.rescheduled', populated);
    }
    return updated;
  } catch (error) {
    logger.error({ error, id, newStartTime }, 'rescheduleAppointmentById failed');
    throw error;
  }
}

export async function cancelAppointmentById(id, userId, role, reason = null) {
  try {
    const existing = await appointmentRepository.findAppointmentById(id);
    if (!existing) notFound('Termin');
    if (!canAccessAppointment(existing, userId, role)) forbidden();
    const updated = await appointmentRepository.updateAppointmentById(id, {
      status: 'cancelled',
      rejectionReason: reason,
      rejectedAt: new Date(),
      rejectedBy: role === 'admin' ? 'admin' : (role === 'employee' ? 'employee' : 'system'),
    });
    logger.info({ appointmentId: id, cancelledBy: userId, role, reason }, 'Appointment cancelled');

    const populated = await getPopulatedAppointment(id);
    if (populated) {
      eventEmitter.emit('appointment.cancelled', populated);
    }
    return updated;
  } catch (error) {
    logger.error({ error, id }, 'cancelAppointmentById failed');
    throw error;
  }
}

export async function findAppointmentsByEmployee(employeeId, options = {}) {
  try {
    const result = await appointmentRepository.findAppointmentsByEmployee(employeeId, {
      ...options,
      populateFields: [
        { path: 'user', select: 'firstName lastName email' },
        { path: 'service', select: 'name' },
        { path: 'assignedTo', populate: { path: 'userId', select: 'firstName lastName' } },
      ],
    });
    return result;
  } catch (error) {
    logger.error({ error, employeeId }, 'findAppointmentsByEmployee failed');
    throw internalError('Neuspešno dohvatanje termina za zaposlenog');
  }
}

export async function findAppointmentsByUser(userId, options = {}) {
  try {
    const result = await appointmentRepository.findAppointmentsByUser(userId, {
      ...options,
      populateFields: [
        { path: 'service', select: 'name slug' },
        { path: 'employee', populate: { path: 'userId', select: 'firstName lastName' } },
      ],
    });
    return result;
  } catch (error) {
    logger.error({ error, userId }, 'findAppointmentsByUser failed');
    throw internalError('Neuspešno dohvatanje termina za korisnika');
  }
}