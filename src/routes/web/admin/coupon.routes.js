import { Router } from 'express';
import {
  listCoupons,
  couponDetail,
  addCouponForm,
  editCouponForm,
  createCoupon,
  updateCoupon,
  searchCoupons,
  deleteCoupon,
} from '../../../controllers/web/admin/coupon.controller.js';

const router = Router();

router.get('/', listCoupons);
router.get('/detalji/:couponId', couponDetail);
router.get('/dodavanje', addCouponForm);
router.get('/izmena/:couponId', editCouponForm);
router.post('/dodavanje', createCoupon);
router.put('/izmena', updateCoupon);
router.post('/pretraga', searchCoupons);
router.delete('/brisanje', deleteCoupon);

export default router;