import Service from "../models/service.model.js";
import { resolveLimit, resolveSkip } from "../utils/pagination.util.js";
import { buildServiceFilter } from "./filters/service.filter.js";

export async function findServices({ search = "", limit: rawLimit, page: rawPage = 1, isAdmin = false, populateFields = null } = {}) {
  const limit  = resolveLimit(rawLimit);
  const skip   = resolveSkip(rawPage, limit);
  const filter = buildServiceFilter({ search, isAdmin });

  let query = Service.find(filter)
                     .sort({ createdAt: -1 })
                     .skip(skip)
                     .limit(limit)
                     .lean();

  if (populateFields) {
    query = query.populate(populateFields);
  }

  const [data, total] = await Promise.all([
    query,
    Service.countDocuments(filter),
  ]);

  return { data, total, page: parseInt(rawPage, 10) || 1, limit };
}

export async function findAllServices(populateFields = null) {
  let query = Service.find()
                     .sort({ createdAt: -1 })
                     .lean();
  if (populateFields) {
    query = query.populate(populateFields);
  }
  return query;
}

export async function findServiceById(id, populateFields = null) {
  let query = Service.findById(id).lean();
  if (populateFields) {
    query = query.populate(populateFields);
  }
  return query;
}

export async function findServiceBySlug(slug, populateFields = null) {
  if (!slug) return null;
  let query = Service.findOne({ slug: slug.toLowerCase().trim() }).lean();
  if (populateFields) {
    query = query.populate(populateFields);
  }
  return query;
}

export async function createService(data) {
  const service = new Service(data);
  return service.save();
}

export async function updateServiceById(id, data) {
  return Service.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true }
  ).lean();
}

export async function deleteServiceById(id) {
  return Service.findByIdAndDelete(id)
                .select("name slug type")
                .lean();
}