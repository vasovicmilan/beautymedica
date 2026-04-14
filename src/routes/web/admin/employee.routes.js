import { Router } from 'express';
import {
  listEmployees,
  employeeDetail,
  addEmployeeForm,
  editEmployeeForm,
  createEmployee,
  updateEmployee,
  searchEmployees,
  deleteEmployee,
} from '../../../controllers/web/admin/employee.controller.js';

const router = Router();

router.get('/', listEmployees);
router.get('/detalji/:employeeId', employeeDetail);
router.get('/dodavanje', addEmployeeForm);
router.get('/izmena/:employeeId', editEmployeeForm);

router.post('/dodavanje', createEmployee);
router.post('/pretraga', searchEmployees);

router.put('/izmena', updateEmployee);

router.delete('/brisanje', deleteEmployee);

export default router;