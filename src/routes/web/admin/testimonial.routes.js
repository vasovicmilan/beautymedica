import { Router } from 'express';
import {
  listTestimonials,
  testimonialDetail,
  addTestimonialForm,
  editTestimonialForm,
  createTestimonial,
  updateTestimonial,
  searchTestimonials,
  deleteTestimonial,
} from '../../../controllers/web/admin/testimonial.controller.js';

const router = Router();

router.get('/', listTestimonials);
router.get('/detalji/:testimonialId', testimonialDetail);
router.get('/dodavanje', addTestimonialForm);
router.get('/izmena/:testimonialId', editTestimonialForm);

router.post('/dodavanje', createTestimonial);
router.post('/pretraga', searchTestimonials);

router.put('/izmena', updateTestimonial);

router.delete('/brisanje', deleteTestimonial);

export default router;