import User from "../models/user.model.js";
import { resolveLimit, resolveSkip } from "../utils/pagination.util.js";
import { buildUserFilter } from "./filters/user.filter.js";

export async function findUsers({
  search = "",
  limit: rawLimit,
  page: rawPage = 1,
  isAdmin = false,
  populateFields = null,
} = {}) {
  const limit = resolveLimit(rawLimit);
  const skip = resolveSkip(rawPage, limit);
  const filter = buildUserFilter({ search, isAdmin });

  let query = User.find(filter)
    .select("firstName lastName email phone roleId isActive avatar lastLoginAt createdAt updatedAt")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  if (populateFields) {
    query = query.populate(populateFields);
  }

  const [data, total] = await Promise.all([query, User.countDocuments(filter)]);
  return { data, total, page: parseInt(rawPage, 10) || 1, limit };
}

export async function findAllUsers(populateFields = null) {
  let query = User.find()
    .select("firstName lastName email phone roleId isActive avatar lastLoginAt")
    .sort({ createdAt: -1 })
    .lean();
  if (populateFields) {
    query = query.populate(populateFields);
  }
  return query;
}

export async function findUserById(id, populateFields = null) {
  let query = User.findById(id)
    .select("firstName lastName email phone roleId isActive avatar lastLoginAt acceptedTerms createdAt updatedAt")
    .lean();
  if (populateFields) {
    query = query.populate(populateFields);
  }
  return query;
}

export async function findUserByEmail(email) {
  if (!email) return null;
  return User.findOne({ email: email.toLowerCase().trim() })
    .select("firstName lastName email phone roleId isActive avatar lastLoginAt acceptedTerms googleId")
    .lean();
}

export async function findUserByGoogleId(googleId) {
  if (!googleId) return null;
  return User.findOne({ googleId })
    .select("firstName lastName email phone roleId isActive avatar lastLoginAt acceptedTerms")
    .lean();
}

export async function createUser(data) {
  const user = new User(data);
  return user.save();
}

export async function updateUserById(id, data) {
  return User.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true }
  ).select("firstName lastName email phone roleId isActive avatar lastLoginAt acceptedTerms");
}

export async function deleteUserById(id) {
  return User.findByIdAndDelete(id)
    .select("firstName lastName email roleId")
    .lean();
}