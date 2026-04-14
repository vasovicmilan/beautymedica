import { Router } from 'express';
import {
  listServices,
  serviceDetail,
  addServiceForm,
  editServiceForm,
  createService,
  updateService,
  searchServices,
  deleteService,
} from '../../../controllers/web/admin/service.controller.js';

const router = Router();

router.get('/', listServices);
router.get('/detalji/:serviceId', serviceDetail);
router.get('/dodavanje', addServiceForm);
router.get('/izmena/:serviceId', editServiceForm);

router.post('/dodavanje', createService);
router.post('/pretraga', searchServices);

router.put('/izmena', updateService);

router.delete('/brisanje', deleteService);

export default router;