import Contact from "../models/contact.model.js";
import { resolveLimit, resolveSkip } from "../utils/pagination.util.js";
import { buildContactFilter } from "./filters/contact.filter.js";

export async function findContacts({
  search = "",
  limit: rawLimit,
  page: rawPage = 1,
  isAdmin = false,
  userId = null,
  status = null,
  type = null,
  populateFields = null,
  sort = { createdAt: -1 },
} = {}) {
  const limit = resolveLimit(rawLimit);
  const skip = resolveSkip(rawPage, limit);
  const filter = buildContactFilter({ search, isAdmin, userId, status, type });

  let query = Contact.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();

  if (populateFields) {
    query = query.populate(populateFields);
  }

  const [data, total] = await Promise.all([query, Contact.countDocuments(filter)]);
  return { data, total, page: parseInt(rawPage, 10) || 1, limit };
}

export async function findAllContacts(populateFields = null) {
  let query = Contact.find().sort({ createdAt: -1 }).lean();
  if (populateFields) query = query.populate(populateFields);
  return query;
}

export async function findContactById(id, populateFields = null) {
  let query = Contact.findById(id).lean();
  if (populateFields) query = query.populate(populateFields);
  return query;
}

export async function findContactsByUser(userId, options = {}) {
  return findContacts({ ...options, userId, isAdmin: true });
}

export async function findContactsByType(type, options = {}) {
  return findContacts({ ...options, type, isAdmin: true });
}

export async function createContact(data) {
  const contact = new Contact(data);
  return contact.save();
}

export async function updateContactById(id, data) {
  return Contact.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).lean();
}

export async function deleteContactById(id) {
  return Contact.findByIdAndDelete(id).lean();
}
