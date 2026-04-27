import { Router } from 'express';
import * as indexController from "../../controllers/web/index.controller.js";
import adminRoutes from "./admin.routes.js";
import authRoutes from './auth.routes.js';

const router = Router();

router.get('/', indexController.showHomePage);

router.use('/auth', authRoutes);

router.use('/korisnik', (req, res, next) => {
    return res.render("landing/home");
});

router.use('/admin', adminRoutes);


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