import * as roleRepository from '../repositories/role.repository.js';
import {
  mapRoleForAdminShort,
  mapRoleForAdminDetail,
} from '../mappers/role.mapper.js';
import { notFound, badRequest, internalError } from '../utils/error.util.js';
import logger from '../config/logger.config.js';

function mapRole(role, viewType = 'short') {
  if (!role) return null;
  return viewType === 'short'
    ? mapRoleForAdminShort(role)
    : mapRoleForAdminDetail(role);
}

async function ensureRoleExists(id) {
  const role = await roleRepository.findRoleById(id);
  if (!role) notFound('Uloga');
  return role;
}

export async function findAllRoles({ raw = false } = {}) {
  try {
    const roles = await roleRepository.findAllRoles();
    if (raw) return roles;
    return roles.map(role => mapRole(role, 'short'));
  } catch (error) {
    logger.error({ error }, 'findAllRoles failed');
    throw internalError('Neuspešno dohvatanje uloga');
  }
}

export async function findRoles(search = '', limit = 20, page = 1, raw = false) {
  try {
    const result = await roleRepository.findRoles({
      search,
      limit,
      page,
      isAdmin: true,
    });
    if (raw) return result;
    const mappedData = result.data.map(role => mapRole(role, 'short'));
    return {
      data: mappedData,
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  } catch (error) {
    logger.error({ error, search, limit, page }, 'findRoles failed');
    throw internalError('Neuspešno dohvatanje uloga');
  }
}

export async function findRoleById(id, raw = false) {
  try {
    const role = await roleRepository.findRoleById(id);
    if (!role) notFound('Uloga');
    if (raw) return role;
    return mapRole(role, 'detail');
  } catch (error) {
    logger.error({ error, id }, 'findRoleById failed');
    throw error;
  }
}

export async function updateRoleById(id, data) {
  try {
    await ensureRoleExists(id);

    if (data.name) {
      badRequest('Nije dozvoljeno menjanje naziva uloge');
    }
    const updated = await roleRepository.updateRoleById(id, data);
    logger.info({ roleId: id, updatedFields: Object.keys(data) }, 'Role updated');
    return updated;
  } catch (error) {
    logger.error({ error, id, data }, 'updateRoleById failed');
    throw error;
  }
}

export async function createNewRole(data) {
  try {
    const existing = await roleRepository.findRoles({ search: data.name, isAdmin: true });
    if (existing.data.length > 0) badRequest('Uloga sa tim imenom već postoji');
    const newRole = await roleRepository.createRole(data);
    logger.info({ roleId: newRole._id, name: newRole.name }, 'Role created');
    return newRole;
  } catch (error) {
    logger.error({ error, data }, 'createNewRole failed');
    throw error;
  }
}

export async function deleteRoleById(id) {
  try {
    const role = await ensureRoleExists(id);
    if (['admin', 'employee', 'user'].includes(role.name)) {
      badRequest('Nije dozvoljeno brisanje sistemskih uloga');
    }
    const deleted = await roleRepository.deleteRoleById(id);
    logger.info({ roleId: id, name: deleted.name }, 'Role deleted');
    return deleted;
  } catch (error) {
    logger.error({ error, id }, 'deleteRoleById failed');
    throw error;
  }
}