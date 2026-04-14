import { formatDateTime, formatDate } from '../utils/date.time.util.js';

function translateType(type) {
  const map = {
    welcome: "Dobrodošlica",
    promo: "Promo",
    limited: "Ograničeni",
  };
  return map[type] || type;
}

function translateActive(isActive) {
  return isActive ? "Aktivan" : "Neaktivan";
}

function formatMaxUses(maxUses) {
  if (maxUses === null) return "Neograničeno";
  return maxUses;
}

export function mapCouponForAdminShort(coupon) {
  return {
    id: coupon._id.toString(),
    kod: coupon.code,
    tip: translateType(coupon.type),
    popust: `${coupon.discount}%`,
    maxUpotreba: formatMaxUses(coupon.maxUses),
    iskorišćeno: coupon.usedCount,
    aktivnost: translateActive(coupon.isActive),
    važiOd: formatDate(coupon.startDate),
    važiDo: formatDate(coupon.endDate),
    kreiran: formatDateTime(coupon.createdAt),
  };
}

export function mapCouponForAdminDetail(coupon) {
  return {
    id: coupon._id.toString(),
    osnovno: {
      kod: coupon.code,
      tip: translateType(coupon.type),
      popust: `${coupon.discount}%`,
      aktivnost: translateActive(coupon.isActive),
    },
    ograničenja: {
      maxUpotreba: formatMaxUses(coupon.maxUses),
      trenutnoIskorišćeno: coupon.usedCount,
      poKorisniku: coupon.perUserLimit,
    },
    vremeVaženja: {
      počinje: coupon.startDate ? formatDateTime(coupon.startDate) : null,
      ističe: coupon.endDate ? formatDateTime(coupon.endDate) : null,
    },
    korisnici: coupon.usedBy?.map(userId => userId.toString()) || [],
    vreme: {
      kreiran: formatDateTime(coupon.createdAt),
      poslednjeIzmenjen: formatDateTime(coupon.updatedAt),
    },
  };
}