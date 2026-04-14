import { Router } from 'express';
import {
  listAppointments,
  appointmentDetail,
  editAppointmentForm,
  updateAppointment,
  searchAppointments,
} from '../../../controllers/web/admin/appointment.controller.js';

const router = Router();

router.get('/', listAppointments);

router.get('/detalji/:appointmentId', appointmentDetail);

router.get('/izmena/:appointmentId', editAppointmentForm);

router.put('/izmena', updateAppointment);

router.post('/pretraga', searchAppointments);

export default router;