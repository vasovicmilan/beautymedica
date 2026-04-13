import { Router } from 'express';

const router = Router();

// All appointments for admin
router.get("/", (req, res, next) => {
    next();
})

router.get("/detalji/:appointmentId", (req, res, next) => {
    next();
})

router.get("/izmena/:appointmentId", (req, res, next) => {
    next();
})

router.put("/izmena", (req, res, next) => {
    next();
})

router.post("/pretraga", (req, res, next) => {
    next();
})

export default router;