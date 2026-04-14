import * as appointmentService from '../../../services/appointment.service.js';
import { badRequest } from '../../../utils/error.util.js';

/**
 * Prikaz svih termina (tabela) – admin
 */
export async function listAppointments(req, res, next) {
  try {
    const { search, limit, page, status, startTimeFrom, startTimeTo } = req.query;
    const result = await appointmentService.findAppointments({
      search,
      limit: limit ? parseInt(limit) : 20,
      page: page ? parseInt(page) : 1,
      userId: req.user.id,
      role: req.user.role,
      filters: { status, startTimeFrom, startTimeTo },
    });
    res.render('admin/appointments/index', {
      appointments: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      search,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Prikaz detalja termina
 */
export async function appointmentDetail(req, res, next) {
  try {
    const { appointmentId } = req.params;
    const { appointment } = await appointmentService.findAppointmentDetailsById(
      appointmentId,
      req.user.id,
      req.user.role
    );
    res.render('admin/appointments/detail', { appointment });
  } catch (error) {
    next(error);
  }
}

/**
 * Forma za izmenu termina (dohvatanje podataka)
 */
export async function editAppointmentForm(req, res, next) {
  try {
    const { appointmentId } = req.params;
    const { appointment } = await appointmentService.findAppointmentDetailsById(
      appointmentId,
      req.user.id,
      req.user.role
    );
    // Ovde možeš dohvatiti i liste zaposlenih, usluga itd.
    res.render('admin/appointments/edit', { appointment });
  } catch (error) {
    next(error);
  }
}

/**
 * Obrada izmene termina (PUT)
 */
export async function updateAppointment(req, res, next) {
  try {
    const { id, startTime, employee, status, note, rejectionReason } = req.body;
    if (!id) badRequest('Nedostaje ID termina');
    const data = {};
    if (startTime) data.startTime = new Date(startTime);
    if (employee) data.employee = employee;
    if (status) data.status = status;
    if (note !== undefined) data.note = note;
    if (rejectionReason !== undefined) data.rejectionReason = rejectionReason;
    await appointmentService.updateAppointmentById(id, data, req.user.id, req.user.role);
    // Tvoj flash sistem
    req.session.flash = { type: 'success', message: 'Termin je uspešno ažuriran' };
    res.redirect(`/admin/appointments/detalji/${id}`);
  } catch (error) {
    next(error);
  }
}

/**
 * Pretraga termina (POST) – redirekcija na GET sa query parametrima
 */
export async function searchAppointments(req, res, next) {
  try {
    const { search, status, startTimeFrom, startTimeTo, limit, page } = req.body;
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (status) query.append('status', status);
    if (startTimeFrom) query.append('startTimeFrom', startTimeFrom);
    if (startTimeTo) query.append('startTimeTo', startTimeTo);
    if (limit) query.append('limit', limit);
    if (page) query.append('page', page);
    res.redirect(`/admin/appointments?${query.toString()}`);
  } catch (error) {
    next(error);
  }
}