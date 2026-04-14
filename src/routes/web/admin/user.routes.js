import { Router } from 'express';
import {
  listUsers,
  userDetail,
  editUserForm,
  updateUser,
  searchUsers,
  deleteUser,
} from '../../../controllers/web/admin/user.controller.js';

const router = Router();

router.get('/', listUsers);
router.get('/detalji/:userId', userDetail);
router.get('/izmena/:userId', editUserForm);

router.put('/izmena', updateUser);
router.post('/pretraga', searchUsers);
router.delete('/brisanje/:userId', deleteUser);

export default router;