import Coupon from "../models/coupon.model.js";
import { resolveLimit, resolveSkip } from "../utils/pagination.util.js";
import { buildCouponFilter } from "./filters/coupon.filter.js";

export async function findCoupons({
  search = "",
  limit: rawLimit,
  page: rawPage = 1,
  isAdmin = false,
  type = null,
  isActive = null,
  validAt = new Date(),
} = {}) {
  const limit = resolveLimit(rawLimit);
  const skip = resolveSkip(rawPage, limit);
  const filter = buildCouponFilter({ search, isAdmin, type, isActive, validAt });

  const [data, total] = await Promise.all([
    Coupon.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Coupon.countDocuments(filter),
  ]);

  return { data, total, page: parseInt(rawPage, 10) || 1, limit };
}

export async function findAllCoupons() {
  return Coupon.find().sort({ createdAt: -1 }).lean();
}

export async function findCouponById(id) {
  return Coupon.findById(id).lean();
}

export async function findCouponByCode(code, validateForNonAdmin = false, validAt = new Date()) {
  if (!code) return null;
  const filter = { code: code.toUpperCase().trim() };
  if (validateForNonAdmin) {
    filter.isActive = true;
    filter.startDate = { $lte: validAt };
    filter.endDate = { $gte: validAt };
  }
  return Coupon.findOne(filter).lean();
}

export async function createCoupon(data) {
  const coupon = new Coupon(data);
  return coupon.save();
}

export async function updateCouponById(id, data) {
  return Coupon.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).lean();
}

export async function deleteCouponById(id) {
  return Coupon.findByIdAndDelete(id).lean();
}

export async function incrementCouponUsage(couponId, userId) {
  return Coupon.findByIdAndUpdate(
    couponId,
    {
      $inc: { usedCount: 1 },
      $addToSet: { usedBy: userId },
    },
    { new: true, runValidators: true }
  ).lean();
}

export async function isCouponUsableByUser(couponId, userId) {
  const coupon = await Coupon.findById(couponId).lean();
  if (!coupon) return false;
  if (!coupon.isActive) return false;
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) return false;
  const userUsedCount = coupon.usedBy.filter(id => id.toString() === userId.toString()).length;
  if (userUsedCount >= coupon.perUserLimit) return false;
  const now = new Date();
  if (coupon.startDate && coupon.startDate > now) return false;
  if (coupon.endDate && coupon.endDate < now) return false;
  return true;
}