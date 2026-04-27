import { Router } from 'express';
import appointmentRoutes from './admin/appointment.routes.js';
import categryRoutes from './admin/category.routes.js';
import tagRoutes from './admin/tag.routes.js';
import serviceRoutes from './admin/services.routes.js';
import roleRoutes from './admin/role.routes.js';
import userRoutes from './admin/user.routes.js';
import expertRoutes from './admin/expert.routes.js';
import employeeRoutes from './admin/employee.routes.js';
import couponRoutes from './admin/coupon.routes.js';
import contactRoutes from './admin/contact.routes.js';
import testimonialRoutes from './admin/testimonial.routes.js';
import postRoutes from './admin/post.routes.js';

const router = Router();

router.get("/dashboard", (req, res, next) => {
    next();
})

router.use("/kategorije", categryRoutes);

router.use('/oznake', tagRoutes);

router.use('/usluge', serviceRoutes);

router.use('/uloge', roleRoutes);

router.use('/korisnici', userRoutes);

router.use('/eksperti', expertRoutes);

router.use('/zaposleni', employeeRoutes);

router.use('/kuponi', couponRoutes);

router.use('/kontakti', contactRoutes);

router.use('/utisci', testimonialRoutes);

router.use('/objave', postRoutes);

router.use('/termini', appointmentRoutes);

export default router;