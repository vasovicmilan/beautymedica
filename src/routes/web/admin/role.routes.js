import { Router } from 'express';
import {
  listRoles,
  roleDetail,
  addRoleForm,
  editRoleForm,
  createRole,
  updateRole,
  searchRoles,
  deleteRole,
} from '../../../controllers/web/admin/role.controller.js';

const router = Router();

router.get('/', listRoles);
router.get('/detalji/:roleId', roleDetail);
router.get('/dodavanje', addRoleForm);
router.get('/izmena/:roleId', editRoleForm);

router.post('/dodavanje', createRole);
router.post('/pretraga', searchRoles);

router.put('/izmena', updateRole);

router.delete('/brisanje', deleteRole);

export default router;