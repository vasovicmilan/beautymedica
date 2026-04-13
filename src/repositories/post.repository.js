import Post from "../models/post.model.js";
import { resolveLimit, resolveSkip } from "../utils/pagination.util.js";
import { buildPostFilter } from "./filters/post.filter.js";

export async function findPosts({
  search = "",
  limit: rawLimit,
  page: rawPage = 1,
  isAdmin = false,
  status = null,
  expertId = null,
  categories = null,
  tags = null,
  isIndexable = null,
  populateFields = null,
  sort = { createdAt: -1 },
} = {}) {
  const limit = resolveLimit(rawLimit);
  const skip = resolveSkip(rawPage, limit);
  const filter = buildPostFilter({
    search,
    isAdmin,
    status,
    expertId,
    categories,
    tags,
    isIndexable,
  });

  let query = Post.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit);

  if (search && search.trim()) {
    query = query.select({ score: { $meta: "textScore" } });
  }

  query = query.lean();

  if (populateFields) {
    query = query.populate(populateFields);
  }

  const [data, total] = await Promise.all([query, Post.countDocuments(filter)]);
  return { data, total, page: parseInt(rawPage, 10) || 1, limit };
}

export async function findAllPosts(populateFields = null) {
  let query = Post.find().sort({ createdAt: -1 }).lean();
  if (populateFields) query = query.populate(populateFields);
  return query;
}

export async function findPostById(id, populateFields = null) {
  let query = Post.findById(id).lean();
  if (populateFields) query = query.populate(populateFields);
  return query;
}

export async function findPostBySlug(slug, isAdmin = false, populateFields = null) {
  if (!slug) return null;
  const filter = { slug: slug.toLowerCase().trim() };
  if (!isAdmin) {
    filter.status = { $in: ["published", "featured"] };
  }
  let query = Post.findOne(filter).lean();
  if (populateFields) query = query.populate(populateFields);
  return query;
}

export async function findPostsByExpert(expertId, options = {}) {
  return findPosts({ ...options, expertId });
}

export async function findPostsByCategory(categoryId, options = {}) {
  return findPosts({ ...options, categories: [categoryId] });
}

export async function findPostsByTag(tagId, options = {}) {
  return findPosts({ ...options, tags: [tagId] });
}

export async function createPost(data) {
  const post = new Post(data);
  return post.save();
}

export async function updatePostById(id, data) {
  return Post.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).lean();
}

export async function deletePostById(id) {
  return Post.findByIdAndDelete(id).lean();
}