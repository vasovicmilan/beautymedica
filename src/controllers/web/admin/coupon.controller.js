import * as couponService from '../../../services/coupon.service.js';
import { badRequest } from '../../../utils/error.util.js';

// Helper za SEO na admin stranicama
function getAdminSeo(title) {
  return {
    title: `Admin - ${title}`,
    robots: 'noindex, follow',
    description: '',
  };
}

export async function listCoupons(req, res, next) {
  try {
    const { search, limit, page } = req.query;
    const result = await couponService.findCoupons(
      search,
      limit ? parseInt(limit) : 20,
      page ? parseInt(page) : 1
    );
    const seo = getAdminSeo('Kuponi');
    res.render('admin/coupon/coupons', {
      coupons: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      search,
      seo,
    });
  } catch (error) {
    next(error);
  }
}

export async function couponDetail(req, res, next) {
  try {
    const { couponId } = req.params;
    const coupon = await couponService.findCouponById(couponId);
    const seo = getAdminSeo(`Kupon: ${coupon.osnovno.kod}`);
    res.render('admin/coupon/coupon-details', { coupon, seo });
  } catch (error) {
    next(error);
  }
}

export async function addCouponForm(req, res, next) {
  try {
    const seo = getAdminSeo('Dodavanje kupona');
    res.render('admin/coupon/new-coupon', { seo });
  } catch (error) {
    next(error);
  }
}

export async function editCouponForm(req, res, next) {
  try {
    const { couponId } = req.params;
    const coupon = await couponService.findCouponById(couponId, true); // raw podaci
    const seo = getAdminSeo(`Izmena kupona: ${coupon.code}`);
    res.render('admin/coupon/new-coupon', { coupon, seo });
  } catch (error) {
    next(error);
  }
}

export async function createCoupon(req, res, next) {
  try {
    const {
      code,
      type,
      discount,
      maxUses,
      perUserLimit,
      startDate,
      endDate,
      isActive,
    } = req.body;

    if (!code || !type || !discount) {
      badRequest('Kod, tip i popust su obavezni');
    }

    const data = {
      code: code.toUpperCase().trim(),
      type,
      discount: parseInt(discount),
      maxUses: maxUses ? (maxUses === 'null' ? null : parseInt(maxUses)) : null,
      perUserLimit: parseInt(perUserLimit) || 1,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      isActive: isActive === 'on' || isActive === true,
    };

    await couponService.createCoupon(data);
    req.session.flash = { type: 'success', message: 'Kupon je uspešno kreiran' };
    res.redirect('/admin/kuponi');
  } catch (error) {
    next(error);
  }
}

export async function updateCoupon(req, res, next) {
  try {
    const {
      id,
      code,
      type,
      discount,
      maxUses,
      perUserLimit,
      startDate,
      endDate,
      isActive,
    } = req.body;

    if (!id) badRequest('Nedostaje ID kupona');

    const data = {
      code: code.toUpperCase().trim(),
      type,
      discount: parseInt(discount),
      maxUses: maxUses ? (maxUses === 'null' ? null : parseInt(maxUses)) : null,
      perUserLimit: parseInt(perUserLimit) || 1,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      isActive: isActive === 'on' || isActive === true,
    };

    await couponService.updateCouponById(id, data);
    req.session.flash = { type: 'success', message: 'Kupon je uspešno ažuriran' };
    res.redirect(`/admin/kuponi/detalji/${id}`);
  } catch (error) {
    next(error);
  }
}

export async function searchCoupons(req, res, next) {
  try {
    const { search, limit, page } = req.body;
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (limit) query.append('limit', limit);
    if (page) query.append('page', page);
    res.redirect(`/admin/kuponi?${query.toString()}`);
  } catch (error) {
    next(error);
  }
}

export async function deleteCoupon(req, res, next) {
  try {
    const { couponId } = req.body;
    await couponService.deleteCouponById(couponId);
    req.session.flash = { type: 'success', message: 'Kupon je obrisan' };
    res.redirect('/admin/kuponi');
  } catch (error) {
    next(error);
  }
}