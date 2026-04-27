import Role from "../models/role.model.js";
import { resolveLimit, resolveSkip } from "../utils/pagination.util.js";
import { buildRoleFilter } from "./filters/role.filter.js";

export async function findRoles({ search = "", limit: rawLimit, page: rawPage = 1, isAdmin = false } = {}) {
  const limit  = resolveLimit(rawLimit);
  const skip   = resolveSkip(rawPage, limit);
  const filter = buildRoleFilter({ search, isAdmin });

  const [data, total] = await Promise.all([
    Role.find(filter)
        .select("name permissions createdAt updatedAt")
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    Role.countDocuments(filter),
  ]);

  return { data, total, page: parseInt(rawPage, 10) || 1, limit };
}

export async function findAllRoles() {
  return Role.find()
             .select("name permissions")
             .sort({ name: 1 })
             .lean();
}

export async function findRoleById(id) {
  return Role.findById(id)
             .select("name permissions createdAt updatedAt")
             .lean();
}

// ✅ Added this function
export async function findRoleByName(name) {
  return Role.findOne({ name }).lean();
}

export async function createRole(data) {
  const role = new Role(data);
  return role.save();
}

export async function updateRoleById(id, data) {
  return Role.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true }
  ).select("name permissions createdAt updatedAt");
}

export async function deleteRoleById(id) {
  return Role.findByIdAndDelete(id)
             .select("name permissions")
             .lean();
}