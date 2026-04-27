import Testimonial from "../models/testimonial.model.js";
import { resolveLimit, resolveSkip } from "../utils/pagination.util.js";
import { buildTestimonialFilter } from "./filters/testimonial.filter.js";

export async function findTestimonials({
  search = "",
  limit: rawLimit,
  page: rawPage = 1,
  isAdmin = false,
  rating = null,
  serviceId = null,
  employeeId = null,
  userId = null,
  approved = null,
  populateFields = null,
  sort = { createdAt: -1 },
} = {}) {
  const limit = resolveLimit(rawLimit);
  const skip = resolveSkip(rawPage, limit);
  const filter = buildTestimonialFilter({
    search,
    isAdmin,
    rating,
    serviceId,
    employeeId,
    userId,
    approved,
  });

  let query = Testimonial.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();

  if (populateFields) {
    query = query.populate(populateFields);
  }

  const [data, total] = await Promise.all([query, Testimonial.countDocuments(filter)]);
  return { data, total, page: parseInt(rawPage, 10) || 1, limit };
}

export async function findAllTestimonials(populateFields = null) {
  let query = Testimonial.find().sort({ createdAt: -1 }).lean();
  if (populateFields) query = query.populate(populateFields);
  return query;
}

export async function findTestimonialById(id, populateFields = null) {
  let query = Testimonial.findById(id).lean();
  if (populateFields) query = query.populate(populateFields);
  return query;
}

export async function findTestimonialsByService(serviceId, options = {}) {
  return findTestimonials({ ...options, serviceId });
}

export async function findTestimonialsByEmployee(employeeId, options = {}) {
  return findTestimonials({ ...options, employeeId });
}

export async function findTestimonialsByUser(userId, options = {}) {
  return findTestimonials({ ...options, userId });
}

export async function getAverageRating({ isAdmin = false, serviceId = null, employeeId = null, approved = null } = {}) {
  const filter = buildTestimonialFilter({
    isAdmin,
    serviceId,
    employeeId,
    approved,
  });
  const result = await Testimonial.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        total: { $sum: 1 },
      },
    },
  ]);
  if (result.length === 0) {
    return { averageRating: 0, total: 0 };
  }
  return {
    averageRating: Math.round(result[0].averageRating * 10) / 10,
    total: result[0].total,
  };
}

export async function createTestimonial(data) {
  const testimonial = new Testimonial(data);
  return testimonial.save();
}

export async function updateTestimonialById(id, data) {
  return Testimonial.findByIdAndUpdate(
    id,
    { $set: data },
    { returnDocument: 'after', runValidators: true }
  ).lean();
}

export async function deleteTestimonialById(id) {
  return Testimonial.findByIdAndDelete(id).lean();
}

export async function countTestimonialsByParams({
  search = "",
  isAdmin = false,
  rating = null,
  serviceId = null,
  employeeId = null,
  userId = null,
  approved = null,
} = {}) {
  const filter = buildTestimonialFilter({
    search,
    isAdmin,
    rating,
    serviceId,
    employeeId,
    userId,
    approved,
  });
  return Testimonial.countDocuments(filter);
}