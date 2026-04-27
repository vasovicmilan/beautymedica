import { Router } from 'express';
import {
  listPosts,
  postDetail,
  postForm,
  createPost,
  updatePost,
  searchPosts,
  deletePost,
} from '../../../controllers/web/admin/post.controller.js';

const router = Router();

router.get('/', listPosts);
router.get('/detalji/:postId', postDetail);
router.get('/dodavanje', postForm);
router.get('/izmena/:postId', postForm);
router.post('/dodavanje', createPost);
router.put('/izmena', updatePost);
router.post('/pretraga', searchPosts);
router.delete('/brisanje', deletePost);

export default router;