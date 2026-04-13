import { Router } from 'express';

const router = Router();

router.get("/dashboard", (req, res, next) => {
    next();
})

export default router;