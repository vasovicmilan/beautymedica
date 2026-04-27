import { Router } from 'express';
import * as authController from '../../controllers/web/auth/auth.controller.js';

const router = Router();

// Prikaz stranica za prijavu i registraciju
router.get('/prijava', authController.showLoginPage);
router.get('/registracija', authController.showRegisterPage);

// Google OAuth rute
router.get('/google', authController.redirectToGoogle);
router.get('/google/callback', authController.googleCallback);

// Odjava (GET zahtev – uništava sesiju)
router.get('/odjava', authController.logout);

// API: dohvatanje trenutnog korisnika (za proveru sesije)
router.get('/trenutni-korisnik', authController.currentUser);

export default router;