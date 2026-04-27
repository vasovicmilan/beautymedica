import * as couponRepository from '../repositories/coupon.repository.js';
import {
  mapCouponForAdminShort,
  mapCouponForAdminDetail,
} from '../mappers/coupon.mapper.js';
import { notFound, badRequest, internalError } from '../utils/error.util.js';
import logger from '../config/logger.config.js';

function mapCoupon(coupon, role = 'admin', viewType = 'short') {
  if (!coupon) return null;
  if (role === 'admin') {
    return viewType === 'short'
      ? mapCouponForAdminShort(coupon)
      : mapCouponForAdminDetail(coupon);
  }

  return {
    code: coupon.code,
    discount: coupon.discount,
    type: coupon.type,
  };
}

async function ensureCouponExists(id) {
  const coupon = await couponRepository.findCouponById(id);
  if (!coupon) notFound('Kupon');
  return coupon;
}

export async function findCoupons(search = '', limit = 20, page = 1, raw = false) {
  try {
    const result = await couponRepository.findCoupons({
      search,
      limit,
      page,
      isAdmin: true,
    });
    if (raw) return result;
    const mappedData = result.data.map(coupon => mapCoupon(coupon, 'admin', 'short'));
    return {
      data: mappedData,
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  } catch (error) {
    logger.error({ error, search, limit, page }, 'findCoupons failed');
    throw internalError('Neuspešno dohvatanje kupona');
  }
}

export async function findCouponById(id, raw = false) {
  try {
    const coupon = await couponRepository.findCouponById(id);
    if (!coupon) notFound('Kupon');
    if (raw) return coupon;
    return mapCoupon(coupon, 'admin', 'detail');
  } catch (error) {
    logger.error({ error, id }, 'findCouponById failed');
    throw error;
  }
}

export async function findCouponByCode(code) {
  try {
    if (!code) return null;
    const coupon = await couponRepository.findCouponByCode(code, false);
    return coupon ? mapCoupon(coupon, 'admin', 'detail') : null;
  } catch (error) {
    logger.error({ error, code }, 'findCouponByCode failed');
    throw internalError('Neuspešno dohvatanje kupona po kodu');
  }
}

export async function validateCouponByCode(code, userId) {
  try {
    if (!code) badRequest('Nedostaje kod kupona');
    const coupon = await couponRepository.findCouponByCode(code, true);
    if (!coupon) badRequest('Kupon nije pronađen ili nije aktivan');
    const usable = await couponRepository.isCouponUsableByUser(coupon._id, userId);
    if (!usable) badRequest('Kupon nije dostupan za ovog korisnika (prekoračen limit ili istekao)');
    return {
      id: coupon._id.toString(),
      code: coupon.code,
      discount: coupon.discount,
      type: coupon.type,
      maxUses: coupon.maxUses,
      usedCount: coupon.usedCount,
      perUserLimit: coupon.perUserLimit,
    };
  } catch (error) {
    logger.error({ error, code, userId }, 'validateCouponByCode failed');
    throw error;
  }
}

export async function updateCouponById(id, data) {
  try {
    await ensureCouponExists(id);
    const updated = await couponRepository.updateCouponById(id, data);
    logger.info({ couponId: id, updatedFields: Object.keys(data) }, 'Coupon updated');
    return updated;
  } catch (error) {
    logger.error({ error, id, data }, 'updateCouponById failed');
    throw error;
  }
}

export async function createCoupon(data) {
  try {
    const existing = await couponRepository.findCouponByCode(data.code, false);
    if (existing) badRequest('Kupon sa istim kodom već postoji');
    const newCoupon = await couponRepository.createCoupon(data);
    logger.info({ couponId: newCoupon._id, code: newCoupon.code }, 'Coupon created');
    return newCoupon;
  } catch (error) {
    logger.error({ error, data }, 'createCoupon failed');
    throw error;
  }
}

export async function deleteCouponById(id) {
  try {
    const deleted = await couponRepository.deleteCouponById(id);
    if (!deleted) notFound('Kupon');
    logger.info({ couponId: id, code: deleted.code }, 'Coupon deleted');
    return deleted;
  } catch (error) {
    logger.error({ error, id }, 'deleteCouponById failed');
    throw error;
  }
}