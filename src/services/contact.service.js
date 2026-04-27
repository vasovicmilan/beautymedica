import * as contactRepository from '../repositories/contact.repository.js';
import {
  mapContact,
} from '../mappers/contact.mapper.js';
import { notFound, badRequest, internalError } from '../utils/error.util.js';
import logger from '../config/logger.config.js';
import { decrypt } from './crypto.service.js';

function decryptContact(contact) {
  if (!contact) return contact;
  const decrypted = { ...contact };
  if (contact.phone) decrypted.phone = decrypt(contact.phone);
  if (contact.message) decrypted.message = decrypt(contact.message);
  return decrypted;
}

function mapContactData(contact, role, viewType = 'short') {
  if (!contact) return null;
  const decrypted = decryptContact(contact);
  return mapContact(decrypted, role, viewType);
}

async function ensureContactExists(id) {
  const contact = await contactRepository.findContactById(id);
  if (!contact) notFound('Kontakt poruka');
  return contact;
}

export async function findContacts({
  search = '',
  limit = 20,
  page = 1,
  role = 'admin',
  userId = null,
  status = null,
  type = null,
  raw = false,
} = {}) {
  try {
    const isAdmin = role === 'admin';
    if (!isAdmin && !userId) {
      badRequest('Nedostaje ID korisnika za prikaz poruka');
    }
    const result = await contactRepository.findContacts({
      search,
      limit,
      page,
      isAdmin,
      userId: isAdmin ? null : userId,
      status,
      type,
      populateFields: isAdmin ? { path: 'user', select: 'firstName lastName email' } : null,
    });
    if (raw) return result;
    const mappedData = result.data.map(contact => mapContactData(contact, role, 'short'));
    return {
      data: mappedData,
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  } catch (error) {
    logger.error({ error, params: { search, limit, page, role, userId } }, 'findContacts failed');
    throw internalError('Neuspešno dohvatanje kontakt poruka');
  }
}

export async function findContactById(id, role = 'admin', userId = null, raw = false) {
  try {
    const contact = await contactRepository.findContactById(id, { path: 'user', select: 'firstName lastName email' });
    if (!contact) notFound('Kontakt poruka');
    if (role !== 'admin') {
      const contactUserId = contact.user?._id?.toString() || contact.user?.toString();
      if (contactUserId !== userId) {
        badRequest('Nemate pristup ovoj poruci');
      }
    }
    if (raw) return contact;
    const viewType = role === 'admin' ? 'detail' : 'detail';
    return mapContactData(contact, role, viewType);
  } catch (error) {
    logger.error({ error, id, role }, 'findContactById failed');
    throw error;
  }
}

export async function updateContactById(id, data) {
  try {
    await ensureContactExists(id);
    const updated = await contactRepository.updateContactById(id, data);
    logger.info({ contactId: id, updatedFields: Object.keys(data) }, 'Contact updated');
    return updated;
  } catch (error) {
    logger.error({ error, id, data }, 'updateContactById failed');
    throw error;
  }
}

export async function createContact(data) {
  try {
    if (!data.firstName || !data.email || !data.title || !data.message) {
      badRequest('Nedostaju obavezna polja (ime, email, naslov, poruka)');
    }
    if (data.acceptance !== true) {
      badRequest('Morate prihvatiti uslove privatnosti');
    }
    const newContact = await contactRepository.createContact(data);
    logger.info({ contactId: newContact._id, email: newContact.email }, 'Contact created');
    return newContact;
  } catch (error) {
    logger.error({ error, data }, 'createContact failed');
    throw error;
  }
}

export async function deleteContactById(id) {
  try {
    const deleted = await contactRepository.deleteContactById(id);
    if (!deleted) notFound('Kontakt poruka');
    logger.info({ contactId: id }, 'Contact deleted');
    return deleted;
  } catch (error) {
    logger.error({ error, id }, 'deleteContactById failed');
    throw error;
  }
}

export async function findContactsByUser(userId, options = {}) {
  return findContacts({ ...options, role: 'user', userId });
}

export async function findContactsByType(type, options = {}) {
  return findContacts({ ...options, role: 'admin', type });
}