import { Router } from 'express';

const router = Router();

router.get('/', (req, res, next) => {
    return res.render("landing/home");
});

router.use('/korisnik', (req, res, next) => {
    return res.render("landing/home");
});

router.use('/blog', (req, res, next) => {
    return res.render("landing/home");
});

router.use('/usluge', (req, res, next) => {
    return res.render("landing/home");
});

router.get('/o-nama', (req, res, next) => {
    return res.render("landing/home");
});

router.get('/uslovi-koriscenja', (req, res, next) => {
    return res.render("landing/home");
});

router.get('/politika-privatnosti', (req, res, next) => {
    return res.render("landing/home");
});

router.post('/kontakt', (req, res, next) => {
    return res.render("landing/home");
});
export default router;