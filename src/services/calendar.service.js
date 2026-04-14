import * as appointmentRepository from '../repositories/appointment.repository.js';
import * as employeeRepository from '../repositories/employee.repository.js';
import * as serviceRepository from '../repositories/service.repository.js';
import { badRequest, internalError } from '../utils/error.util.js';
import logger from '../utils/logger.config.js';

export async function getAvailableSlotsForEmployee(employeeId, serviceId, date, options = {}) {
  try {
    if (!employeeId || !serviceId) badRequest('Nedostaje ID zaposlenog ili usluge');
    const targetDate = new Date(date);
    if (isNaN(targetDate)) badRequest('Neispravan datum');

    const employee = await employeeRepository.findEmployeeById(employeeId, {
      path: { path: 'userId', select: 'firstName lastName' }
    });
    if (!employee) badRequest('Zaposleni nije pronađen');

    const service = await serviceRepository.findServiceById(serviceId);
    if (!service) badRequest('Usluga nije pronađena');
    const duration = service.packages?.[0]?.duration || 60;

    const dayOfWeek = targetDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const workingDay = employee.workingHours?.find(wh => wh.day === dayOfWeek);
    if (!workingDay || !workingDay.slots?.length) {
      return { date: targetDate, slots: [] };
    }

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    const appointments = await appointmentRepository.findAppointments({
      employeeId,
      startTimeFrom: startOfDay,
      startTimeTo: endOfDay,
      isAdmin: false,
      status: ['pending', 'confirmed'],
    });

    const generatedSlots = [];
    for (const slot of workingDay.slots) {
      const startTime = parseTimeString(slot.from, targetDate);
      const endTime = parseTimeString(slot.to, targetDate);
      let currentStart = startTime;
      while (currentStart.getTime() + duration * 60000 <= endTime.getTime()) {
        const slotEnd = new Date(currentStart.getTime() + duration * 60000);
        generatedSlots.push({
          start: currentStart,
          end: slotEnd,
        });
        currentStart = slotEnd;
      }
    }

    const busyIntervals = appointments.data.map(app => ({
      start: new Date(app.startTime),
      end: new Date(app.endTime),
    }));

    const availableSlots = generatedSlots.filter(slot => {
      return !busyIntervals.some(busy => 
        (slot.start < busy.end && slot.end > busy.start)
      );
    });

    const formattedSlots = availableSlots.map(slot => ({
      start: slot.start.toISOString(),
      end: slot.end.toISOString(),
      available: true,
    }));

    return {
      date: targetDate.toISOString().split('T')[0],
      employee: {
        id: employee._id,
        name: employee.userId?.firstName + ' ' + employee.userId?.lastName,
      },
      service: {
        id: service._id,
        name: service.name,
        duration,
      },
      slots: formattedSlots,
    };
  } catch (error) {
    logger.error({ error, employeeId, serviceId, date }, 'getAvailableSlotsForEmployee failed');
    throw error;
  }
}

export async function getAvailableSlotsForMultipleEmployees(employeeIds, serviceId, date) {
  const results = await Promise.all(
    employeeIds.map(async (empId) => {
      try {
        const data = await getAvailableSlotsForEmployee(empId, serviceId, date);
        return { employeeId: empId, slots: data.slots };
      } catch {
        return { employeeId: empId, slots: [] };
      }
    })
  );
  return results;
}

function parseTimeString(timeStr, baseDate) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date(baseDate);
  date.setHours(hours, minutes, 0, 0);
  return date;
}