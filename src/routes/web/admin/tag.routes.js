import { Router } from 'express';

const router = Router();

// All tags for admin
router.get("/", (req, res, next) => {
    next();
})

router.get("/detalji/:tagId", (req, res, next) => {
    next();
})

router.get("/dodavanje", (req, res, next) => {
    next();
})

router.get("/izmena/:tagId", (req, res, next) => {
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

router.delete("/brisanje/:tagId", (req, res, next) => {
    next();
})

export default router;