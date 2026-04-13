import Expert from "../models/expert.model.js";
import { resolveLimit, resolveSkip } from "../utils/pagination.util.js";
import { buildExpertFilter } from "./filters/expert.filter.js";

export async function findExperts({ search = "", limit: rawLimit, page: rawPage = 1, isAdmin = false } = {}) {
  const limit  = resolveLimit(rawLimit);
  const skip   = resolveSkip(rawPage, limit);
  const filter = buildExpertFilter({ search, isAdmin });

  const [data, total] = await Promise.all([
    Expert.find(filter)
          .select("firstName lastName title slug image isActive createdAt updatedAt")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
    Expert.countDocuments(filter),
  ]);

  return { data, total, page: parseInt(rawPage, 10) || 1, limit };
}

export async function findAllExperts() {
  return Expert.find()
               .select("firstName lastName title slug image isActive")
               .sort({ createdAt: -1 })
               .lean();
}

export async function findExpertById(id) {
  return Expert.findById(id)
               .select("firstName lastName title slug bio image isActive createdAt updatedAt")
               .lean();
}

export async function findExpertBySlug(slug) {
  if (!slug) return null;
  return Expert.findOne({ slug: slug.toLowerCase().trim() })
               .select("firstName lastName title slug bio image isActive createdAt updatedAt")
               .lean();
}

export async function createExpert(data) {
  const expert = new Expert(data);
  return expert.save();
}

export async function updateExpertById(id, data) {
  return Expert.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true }
  ).select("firstName lastName title slug bio image isActive createdAt updatedAt");
}

export async function deleteExpertById(id) {
  return Expert.findByIdAndDelete(id)
               .select("firstName lastName title slug")
               .lean();
}