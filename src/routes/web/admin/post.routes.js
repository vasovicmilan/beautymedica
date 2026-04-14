import { Router } from 'express';
import {
  listPosts,
  postDetail,
  addPostForm,
  editPostForm,
  createPost,
  updatePost,
  searchPosts,
  deletePost,
} from '../../../controllers/web/admin/post.controller.js';

const router = Router();

router.get('/', listPosts);
router.get('/detalji/:postId', postDetail);
router.get('/dodavanje', addPostForm);
router.get('/izmena/:postId', editPostForm);
router.post('/dodavanje', createPost);
router.put('/izmena', updatePost);
router.post('/pretraga', searchPosts);
router.delete('/brisanje', deletePost);

export default router;