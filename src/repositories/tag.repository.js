import Tag from "../models/tag.model.js";
import { resolveLimit, resolveSkip } from "../utils/pagination.util.js";
import { buildTagFilter } from "./filters/tag.filter.js";

export async function findTags({
  search = "",
  limit: rawLimit,
  page: rawPage = 1,
  isAdmin = false,
  domain = null,
  type = null,
  isIndexable = null,
  isActive = null,
  populateFields = null,
} = {}) {
  const limit = resolveLimit(rawLimit);
  const skip = resolveSkip(rawPage, limit);
  const filter = buildTagFilter({
    search,
    isAdmin,
    domain,
    type,
    isIndexable,
    isActive,
  });

  let query = Tag.find(filter)
    .sort({ "meta.priority": -1, name: 1 })
    .skip(skip)
    .limit(limit)
    .lean();

  if (populateFields) {
    query = query.populate(populateFields);
  }

  const [data, total] = await Promise.all([query, Tag.countDocuments(filter)]);
  return { data, total, page: parseInt(rawPage, 10) || 1, limit };
}

export async function findAllTags(populateFields = null) {
  let query = Tag.find().sort({ "meta.priority": -1, name: 1 }).lean();
  if (populateFields) query = query.populate(populateFields);
  return query;
}

export async function findTagById(id, populateFields = null) {
  let query = Tag.findById(id).lean();
  if (populateFields) query = query.populate(populateFields);
  return query;
}

export async function findTagBySlugDomainType(slug, domain, type, populateFields = null) {
  if (!slug || !domain || !type) return null;
  let query = Tag.findOne({
    slug: slug.toLowerCase().trim(),
    domain,
    type,
  }).lean();
  if (populateFields) query = query.populate(populateFields);
  return query;
}

export async function findTagsByDomain(domain, options = {}) {
  return findTags({ ...options, domain });
}

export async function findTagsByType(type, options = {}) {
  return findTags({ ...options, type });
}

export async function findTagsByDomainAndType(domain, type, options = {}) {
  return findTags({ ...options, domain, type });
}

export async function createTag(data) {
  const tag = new Tag(data);
  return tag.save();
}

export async function updateTagById(id, data) {
  return Tag.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).lean();
}

export async function deleteTagById(id) {
  return Tag.findByIdAndDelete(id).lean();
}