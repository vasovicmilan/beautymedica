import { Router } from 'express';

// import { validateCSRF } from "../../middlewares/validators/csrf.validator.js";
// import { validateSpam } from '../../middlewares/validators/spam.validator.js';
// import { loginLimiter } from "../../middlewares/rate.limiter.middleware.js";

const router = Router();

// GET rute za renderovanje stranica
// router.get('/prijava', authController.getLoginPage);
// router.get('/registracija', authController.getRegisterPage);

// POST rute za obradu formi
// router.post('/prijava', loginLimiter, validateCSRF, validateSpam, ...validateLoginWeb, authController.postLogin);
// router.post('/odjava', validateCSRF, validateSpam, authController.postLogout);
// router.post('/registracija', validateCSRF, validateSpam, ...validateRegisterWeb, authController.postRegister);

export default router;