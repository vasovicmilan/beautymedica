import * as employeeRepository from '../repositories/employee.repository.js';
import * as userRepository from '../repositories/user.repository.js';
import {
  mapEmployee,
} from '../mappers/employee.mapper.js';
import { notFound, badRequest, forbidden, internalError } from '../utils/error.util.js';
import logger from '../utils/logger.config.js';

function mapEmployeeData(employee, role, viewType = 'short') {
  if (!employee) return null;
  return mapEmployee(employee, role, viewType);
}

async function ensureEmployeeExists(id) {
  const employee = await employeeRepository.findEmployeeById(id);
  if (!employee) notFound('Zaposleni');
  return employee;
}

function validateWorkingHours(workingHours) {
  if (!workingHours || !Array.isArray(workingHours)) return;
  const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  for (const wh of workingHours) {
    if (!validDays.includes(wh.day)) {
      badRequest(`Neispravan dan: ${wh.day}`);
    }
    if (!Array.isArray(wh.slots)) continue;
    for (const slot of wh.slots) {
      if (!slot.from || !slot.to) {
        badRequest(`Nedostaje vreme u slotu za dan ${wh.day}`);
      }
      // opciono: regex za HH:MM
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (!timeRegex.test(slot.from) || !timeRegex.test(slot.to)) {
        badRequest(`Neispravan format vremena (HH:MM) za dan ${wh.day}`);
      }
      if (slot.from >= slot.to) {
        badRequest(`Početak termina mora biti pre kraja za dan ${wh.day}`);
      }
    }
  }
}

export async function findEmployeeProfile(userId, role = 'employee') {
  try {
    const employee = await employeeRepository.findEmployeeByUserId(userId);
    if (!employee) notFound('Zaposleni profil nije pronađen');

    const viewType = role === 'admin' ? 'detail' : 'detail';
    return mapEmployeeData(employee, role, viewType);
  } catch (error) {
    logger.error({ error, userId, role }, 'findEmployeeProfile failed');
    throw error;
  }
}

export async function manageEmployeeWorkingHours(employeeId, workingHours, userId, role) {
  try {
    const employee = await ensureEmployeeExists(employeeId);

    if (role !== 'admin') {
      const employeeUserId = employee.userId?._id?.toString() || employee.userId?.toString();
      if (employeeUserId !== userId) {
        forbidden('Nemate pravo da menjate radno vreme drugog zaposlenog');
      }
    }
    validateWorkingHours(workingHours);
    const updated = await employeeRepository.updateEmployeeById(employeeId, { workingHours });
    logger.info({ employeeId, updatedBy: userId, role }, 'Employee working hours updated');
    return updated;
  } catch (error) {
    logger.error({ error, employeeId, userId, role }, 'manageEmployeeWorkingHours failed');
    throw error;
  }
}

export async function findEmployees({ limit = 20, page = 1, role = 'admin', raw = false } = {}) {
  try {
    const isAdmin = role === 'admin';
    const result = await employeeRepository.findEmployees({
      limit,
      page,
      isAdmin,
      populateFields: [
        { path: 'userId', select: 'firstName lastName email phone' },
        { path: 'services', select: 'name' },
      ],
    });
    if (raw) return result;
    const viewType = 'short';
    const mappedData = result.data.map(emp => mapEmployeeData(emp, role, viewType));
    return {
      data: mappedData,
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  } catch (error) {
    logger.error({ error, limit, page, role }, 'findEmployees failed');
    throw internalError('Neuspešno dohvatanje zaposlenih');
  }
}

export async function findEmployeeById(id, role = 'admin', raw = false) {
  try {
    const employee = await employeeRepository.findEmployeeById(id, {
      path: [
        { path: 'userId', select: 'firstName lastName email phone' },
        { path: 'services', select: 'name' },
      ],
    });
    if (!employee) notFound('Zaposleni');
    if (raw) return employee;
    const viewType = role === 'admin' ? 'detail' : (role === 'employee' ? 'detail' : 'short');
    return mapEmployeeData(employee, role, viewType);
  } catch (error) {
    logger.error({ error, id, role }, 'findEmployeeById failed');
    throw error;
  }
}

export async function updateEmployeeById(id, data, userId, role) {
  try {
    const employee = await ensureEmployeeExists(id);
    if (role !== 'admin') {
      const employeeUserId = employee.userId?._id?.toString() || employee.userId?.toString();
      if (employeeUserId !== userId) {
        forbidden('Nemate pravo da menjate podatke drugog zaposlenog');
      }
    }
    if (data.workingHours) {
      validateWorkingHours(data.workingHours);
    }
    const updated = await employeeRepository.updateEmployeeById(id, data);
    logger.info({ employeeId: id, updatedBy: userId, role, fields: Object.keys(data) }, 'Employee updated');
    return updated;
  } catch (error) {
    logger.error({ error, id, data, userId, role }, 'updateEmployeeById failed');
    throw error;
  }
}

export async function createNewEmployee(data) {
  try {
    const { userId } = data;
    if (!userId) badRequest('Nedostaje userId');
    // Provera da li korisnik već ima employee profil
    const existing = await employeeRepository.findEmployeeByUserId(userId);
    if (existing) badRequest('Korisnik već ima profil zaposlenog');
    // Provera da li korisnik postoji u sistemu
    const user = await userRepository.findUserById(userId);
    if (!user) badRequest('Korisnik ne postoji');
    const newEmployee = await employeeRepository.createEmployee(data);
    logger.info({ employeeId: newEmployee._id, userId }, 'Employee created');
    return newEmployee;
  } catch (error) {
    logger.error({ error, data }, 'createNewEmployee failed');
    throw error;
  }
}

export async function deactivateEmployeeById(id, userId, role) {
  try {
    const employee = await ensureEmployeeExists(id);
    if (role !== 'admin') {
      const employeeUserId = employee.userId?._id?.toString() || employee.userId?.toString();
      if (employeeUserId !== userId) {
        forbidden('Nemate pravo da deaktivirate drugog zaposlenog');
      }
    }
    if (!employee.isActive) {
      badRequest('Zaposleni je već deaktiviran');
    }
    const updated = await employeeRepository.updateEmployeeById(id, { isActive: false });
    logger.info({ employeeId: id, deactivatedBy: userId, role }, 'Employee deactivated');
    return updated;
  } catch (error) {
    logger.error({ error, id, userId, role }, 'deactivateEmployeeById failed');
    throw error;
  }
}

export async function deleteEmployeeById(id) {
  try {
    const deleted = await employeeRepository.deleteEmployeeById(id);
    if (!deleted) notFound('Zaposleni');
    logger.info({ employeeId: id, name: deleted.userId?.firstName }, 'Employee deleted');
    return deleted;
  } catch (error) {
    logger.error({ error, id }, 'deleteEmployeeById failed');
    throw error;
  }
}