import { Router } from 'express';
import {
  listCategories,
  categoryDetail,
  addCategoryForm,
  editCategoryForm,
  createCategory,
  updateCategory,
  searchCategories,
  deleteCategory,
} from '../../../controllers/web/admin/category.controller.js';

const router = Router();

router.get('/', listCategories);
router.get('/detalji/:categoryId', categoryDetail);
router.get('/dodavanje', addCategoryForm);
router.get('/izmena/:categoryId', editCategoryForm);

router.post('/dodavanje', createCategory);
router.post('/pretraga', searchCategories);

router.put('/izmena', updateCategory);

router.delete('/brisanje', deleteCategory);

export default router;