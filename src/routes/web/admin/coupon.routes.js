import { Router } from 'express';

const router = Router();

// All coupons for admin
router.get("/", (req, res, next) => {
    next();
})

router.get("/detalji/:couponId", (req, res, next) => {
    next();
})

router.get("/dodavanje", (req, res, next) => {
    next();
})

router.get("/izmena/:couponId", (req, res, next) => {
    next();
})

router.post("/dodavanje", (req, res, next) => {
    next();
})

router.put("/izmena", (req, res, next) => {
    next();
})

router.post("/pretraga", (req, res, next) => {
    next();
})

router.delete("/brisanje/:couponId", (req, res, next) => {
    next();
})

export default router;