import { Router } from 'express';
import webRoutes from './web/index.routes.js';

const router = Router();

router.use('/', webRoutes);

export default router;
