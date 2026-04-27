import * as userRepository from '../repositories/user.repository.js';
import {
  mapUserForAdminShort,
  mapUserForAdminDetail,
  mapUserForEmployeeShort,
  mapUserForEmployeeDetail,
  mapUserForProfile,
} from '../mappers/user.mapper.js';
import { notFound, badRequest, internalError } from '../utils/error.util.js';
import logger from '../config/logger.config.js';

function mapUser(user, role, viewType = 'short', isOwnProfile = false) {
  if (!user) return null;
  if (isOwnProfile) {
    return mapUserForProfile(user);
  }
  if (role === 'admin') {
    return viewType === 'short' ? mapUserForAdminShort(user) : mapUserForAdminDetail(user);
  }
  if (role === 'employee') {
    return viewType === 'short' ? mapUserForEmployeeShort(user) : mapUserForEmployeeDetail(user);
  }
  return {
    id: user._id.toString(),
    imePrezime: `${user.firstName} ${user.lastName}`,
    email: user.email,
    avatar: user.avatar,
  };
}

async function ensureUserExists(id) {
  const user = await userRepository.findUserById(id);
  if (!user) notFound('Korisnik');
  return user;
}

export async function findUserProfile(id) {
  try {
    const user = await userRepository.findUserById(id, { path: 'roleId', select: 'name' });
    if (!user) notFound('Korisnik');
    return mapUser(user, null, null, true);
  } catch (error) {
    logger.error({ error, id }, 'findUserProfile failed');
    throw error;
  }
}

export async function findUsers(search = '', limit = 20, page = 1, raw = false) {
  try {
    const result = await userRepository.findUsers({
      search,
      limit,
      page,
      isAdmin: true,
      populateFields: { path: 'roleId', select: 'name' },
    });
    if (raw) return result;
    const mappedData = result.data.map(user => mapUser(user, 'admin', 'short'));
    return {
      data: mappedData,
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  } catch (error) {
    logger.error({ error, search, limit, page }, 'findUsers failed');
    throw internalError('Neuspešno dohvatanje korisnika');
  }
}

export async function findAllUsers({ raw = false } = {}) {
  try {
    const result = await userRepository.findUsers({
      limit: 1000,
      page: 1,
      isAdmin: true,
      populateFields: { path: 'roleId', select: 'name' },
    });
    if (raw) return result.data;
    return result.data.map(user => mapUser(user, 'admin', 'short'));
  } catch (error) {
    logger.error({ error }, 'findAllUsers failed');
    throw internalError('Neuspešno dohvatanje korisnika');
  }
}

export async function findUserById(id, raw = false) {
  try {
    const user = await userRepository.findUserById(id, { path: 'roleId', select: 'name' });
    if (!user) notFound('Korisnik');
    if (raw) return user;
    return mapUser(user, 'admin', 'detail');
  } catch (error) {
    logger.error({ error, id }, 'findUserById failed');
    throw error;
  }
}

export async function updateUserById(id, data) {
  try {
    await ensureUserExists(id);
    if (data.email) {
      const existing = await userRepository.findUserByEmail(data.email);
      if (existing && existing._id.toString() !== id) {
        badRequest('Email već koristi drugi korisnik');
      }
    }
    const updated = await userRepository.updateUserById(id, data);
    logger.info({ userId: id, updatedFields: Object.keys(data) }, 'User updated');
    return updated;
  } catch (error) {
    logger.error({ error, id, data }, 'updateUserById failed');
    throw error;
  }
}

export async function deactivateUserById(id) {
  try {
    const user = await ensureUserExists(id);
    if (!user.isActive) badRequest('Korisnik je već deaktiviran');
    const updated = await userRepository.updateUserById(id, { isActive: false });
    logger.info({ userId: id }, 'User deactivated');
    return updated;
  } catch (error) {
    logger.error({ error, id }, 'deactivateUserById failed');
    throw error;
  }
}

export async function deleteUserById(id) {
  try {
    const deleted = await userRepository.deleteUserById(id);
    if (!deleted) notFound('Korisnik');
    logger.info({ userId: id, email: deleted.email }, 'User deleted');
    return deleted;
  } catch (error) {
    logger.error({ error, id }, 'deleteUserById failed');
    throw error;
  }
}