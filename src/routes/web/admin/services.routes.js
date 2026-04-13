import { Router } from 'express';

const router = Router();

// All services for admin
router.get("/", (req, res, next) => {
    next();
})

router.get("/detalji/:serviceId", (req, res, next) => {
    next();
})

router.get("/dodavanje", (req, res, next) => {
    next();
})

router.get("/izmena/:serviceId", (req, res, next) => {
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

router.delete("/brisanje/:serviceId", (req, res, next) => {
    next();
})

export default router;