import { Router } from 'express';
import {
  listExperts,
  expertDetail,
  addExpertForm,
  editExpertForm,
  createExpert,
  updateExpert,
  searchExperts,
  deleteExpert,
} from '../../../controllers/web/admin/expert.controller.js';

const router = Router();

router.get('/', listExperts);
router.get('/detalji/:expertId', expertDetail);
router.get('/dodavanje', addExpertForm);
router.get('/izmena/:expertId', editExpertForm);

router.post('/dodavanje', createExpert);
router.post('/pretraga', searchExperts);

router.put('/izmena', updateExpert);

router.delete('/brisanje', deleteExpert);

export default router;