import { Router } from 'express';
import {
  listTestimonials,
  testimonialDetail,
  updateTestimonial,
  searchTestimonials,
  deleteTestimonial,
} from '../../../controllers/web/admin/testimonial.controller.js';

const router = Router();

router.get('/', listTestimonials);
router.get('/detalji/:testimonialId', testimonialDetail);

router.post('/pretraga', searchTestimonials);

router.put('/izmena', updateTestimonial);

router.delete('/brisanje', deleteTestimonial);

export default router;