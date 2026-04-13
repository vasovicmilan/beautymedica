import Category from "../models/category.model.js";
import { resolveLimit, resolveSkip } from "../utils/pagination.util.js";
import { buildCategoryFilter } from "./filters/category.filter.js";

export async function findCategories({
  search = "",
  limit: rawLimit,
  page: rawPage = 1,
  isAdmin = false,
  domain = null,
  parent = null,
  isIndexable = null,
  isActive = null,
  populateFields = null,
} = {}) {
  const limit = resolveLimit(rawLimit);
  const skip = resolveSkip(rawPage, limit);
  const filter = buildCategoryFilter({
    search,
    isAdmin,
    domain,
    parent,
    isIndexable,
    isActive,
  });

  let query = Category.find(filter)
    .sort({ "meta.priority": -1, name: 1 })
    .skip(skip)
    .limit(limit)
    .lean();

  if (populateFields) {
    query = query.populate(populateFields);
  }

  const [data, total] = await Promise.all([query, Category.countDocuments(filter)]);
  return { data, total, page: parseInt(rawPage, 10) || 1, limit };
}

export async function findAllCategories(populateFields = null) {
  let query = Category.find().sort({ "meta.priority": -1, name: 1 }).lean();
  if (populateFields) query = query.populate(populateFields);
  return query;
}

export async function findCategoryById(id, populateFields = null) {
  let query = Category.findById(id).lean();
  if (populateFields) query = query.populate(populateFields);
  return query;
}

export async function findCategoryBySlugAndDomain(slug, domain, populateFields = null) {
  if (!slug || !domain) return null;
  let query = Category.findOne({ slug: slug.toLowerCase().trim(), domain }).lean();
  if (populateFields) query = query.populate(populateFields);
  return query;
}

export async function findCategoriesByDomain(domain, options = {}) {
  return findCategories({ ...options, domain });
}

export async function findRootCategories({ domain, isAdmin = false, isActive = null } = {}) {
  return findCategories({ domain, parent: "null", isAdmin, isActive });
}

export async function findSubcategories(parentId, { domain, isAdmin = false, isActive = null } = {}) {
  return findCategories({ domain, parent: parentId, isAdmin, isActive });
}

export async function createCategory(data) {
  const category = new Category(data);
  return category.save();
}

export async function updateCategoryById(id, data) {
  return Category.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).lean();
}

export async function deleteCategoryById(id) {
  return Category.findByIdAndDelete(id).lean();
}