import { Router } from 'express';

const router = Router();

// All employee for admin
router.get("/", (req, res, next) => {
    next();
})

router.get("/detalji/:employeeId", (req, res, next) => {
    next();
})

router.get("/dodavanje", (req, res, next) => {
    next();
})

router.get("/izmena/:employeeId", (req, res, next) => {
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

router.delete("/brisanje/:employeeId", (req, res, next) => {
    next();
})

export default router;