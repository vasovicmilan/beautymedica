import { Router } from 'express';

const router = Router();

// All contacts for admin
router.get("/", (req, res, next) => {
    next();
})

router.get("/detalji/:contactId", (req, res, next) => {
    next();
})

router.get("/dodavanje", (req, res, next) => {
    next();
})

router.get("/izmena/:contactId", (req, res, next) => {
    next();
})

router.put("/izmena", (req, res, next) => {
    next();
})

router.post("/pretraga", (req, res, next) => {
    next();
})

export default router;