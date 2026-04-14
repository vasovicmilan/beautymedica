import { Router } from 'express';
import {
  listContacts,
  contactDetail,
  editContactForm,
  updateContact,
  searchContacts,
} from '../../../controllers/web/admin/contact.controller.js';

const router = Router();

router.get('/', listContacts);
router.get('/detalji/:contactId', contactDetail);
router.get('/izmena/:contactId', editContactForm);

router.put('/izmena', updateContact);

router.post('/pretraga', searchContacts);

export default router;