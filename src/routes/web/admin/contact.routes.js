import { Router } from 'express';
import {
  listContacts,
  contactDetail,
  updateContact,
  searchContacts,
} from '../../../controllers/web/admin/contact.controller.js';

const router = Router();

router.get('/', listContacts);
router.get('/detalji/:contactId', contactDetail);

router.put('/izmena', updateContact);

router.post('/pretraga', searchContacts);

export default router;