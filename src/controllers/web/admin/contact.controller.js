import * as contactService from '../../../services/contact.service.js';
import { badRequest } from '../../../utils/error.util.js';

export async function listContacts(req, res, next) {
  try {
    const { search, limit, page, status, type } = req.query;
    const result = await contactService.findContacts({
      search,
      limit: limit ? parseInt(limit) : 20,
      page: page ? parseInt(page) : 1,
      role: 'admin',
      status,
      type,
    });
    res.render('admin/contacts/index', {
      contacts: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      search,
      status,
      type,
    });
  } catch (error) {
    next(error);
  }
}

export async function contactDetail(req, res, next) {
  try {
    const { contactId } = req.params;
    const contact = await contactService.findContactById(contactId, 'admin');
    res.render('admin/contacts/detail', { contact });
  } catch (error) {
    next(error);
  }
}

export async function editContactForm(req, res, next) {
  try {
    const { contactId } = req.params;
    const contact = await contactService.findContactById(contactId, 'admin', null, true); // raw podaci (bez mape)
    res.render('admin/contacts/edit', { contact });
  } catch (error) {
    next(error);
  }
}

export async function updateContact(req, res, next) {
  try {
    const { id, status, note } = req.body;
    if (!id) badRequest('Nedostaje ID kontakt poruke');
    const data = {};
    if (status) data.status = status;
    if (note !== undefined) data.note = note;
    if (status === 'resolved' && !data.respondedAt) {
      data.respondedAt = new Date();
    }
    await contactService.updateContactById(id, data);
    req.session.flash = { type: 'success', message: 'Kontakt poruka je ažurirana' };
    res.redirect(`/admin/contacts/detalji/${id}`);
  } catch (error) {
    next(error);
  }
}

export async function searchContacts(req, res, next) {
  try {
    const { search, status, type, limit, page } = req.body;
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (status) query.append('status', status);
    if (type) query.append('type', type);
    if (limit) query.append('limit', limit);
    if (page) query.append('page', page);
    res.redirect(`/admin/contacts?${query.toString()}`);
  } catch (error) {
    next(error);
  }
}