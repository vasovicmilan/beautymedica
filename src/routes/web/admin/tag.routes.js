import { Router } from 'express';
import {
  listTags,
  tagDetail,
  addTagForm,
  editTagForm,
  createTag,
  updateTag,
  searchTags,
  deleteTag,
} from '../../../controllers/web/admin/tag.controller.js';

const router = Router();

router.get('/', listTags);
router.get('/detalji/:tagId', tagDetail);
router.get('/dodavanje', addTagForm);
router.get('/izmena/:tagId', editTagForm);

router.post('/dodavanje', createTag);
router.post('/pretraga', searchTags);

router.put('/izmena', updateTag);

router.delete('/brisanje', deleteTag);

export default router;