import { devNull } from 'node:os';
import * as appointmentService from '../../../services/appointment.service.js';
import * as employeeService from '../../../services/employee.service.js';
import * as serviceService from '../../../services/service.service.js';
import { badRequest } from '../../../utils/error.util.js';

function getAdminSeo(title) {
  return { title: `Admin - ${title}`, robots: 'noindex, follow', description: '' };
}

export async function listAppointments(req, res, next) {
  try {
    const { search, limit, page, status, startTimeFrom, startTimeTo } = req.query;
    const result = await appointmentService.findAppointments({
      search,
      limit: limit ? parseInt(limit) : 20,
      page: page ? parseInt(page) : 1,
      userId: req.user?.id || "69e0f4b0ea2051d805b88f5c",
      role: 'admin', // ovde forsiraj admin jer je admin deo
      filters: { status, startTimeFrom, startTimeTo },
    });
    const seo = getAdminSeo('Termini');
    res.render('admin/appointment/appointments', {
      appointments: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      search,
      status,
      startTimeFrom,
      startTimeTo,
      seo,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
}

export async function appointmentDetail(req, res, next) {
  try {
    const { appointmentId } = req.params;
    const { appointment } = await appointmentService.findAppointmentDetailsById(
      appointmentId,
      req.user.id,
      'admin'
    );
    const seo = getAdminSeo(`Termin: ${appointment.usluga.naziv} - ${appointment.korisnik.ime}`);
    res.render('admin/appointment/appointment-details', { appointment, seo });
  } catch (error) {
    next(error);
  }
}

export async function editAppointmentForm(req, res, next) {
  try {
    const { appointmentId } = req.params;
    // Dohvati sirove podatke (raw = true)
    const rawAppointment = await appointmentService.findAppointmentDetailsById(
      appointmentId,
      req.user.id,
      'admin',
      true
    );
    // Dohvati zaposlene i usluge za dropdown (samo aktivne)
    const employeesResult = await employeeService.findEmployees({ role: 'admin', raw: true });
    const employees = employeesResult.data || [];
    const services = await serviceService.findAllServices({ raw: true });
    const seo = getAdminSeo(`Izmena termina: ${rawAppointment._id}`);
    res.render('admin/appointment/edit-appointment', {
      appointment: rawAppointment,
      employees,
      services,
      seo,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateAppointment(req, res, next) {
  try {
    const { id, startTime, employee, status, note, rejectionReason } = req.body;
    if (!id) badRequest('Nedostaje ID termina');
    const data = {};
    if (startTime) data.startTime = new Date(startTime);
    if (employee) {
      // employee je ID zaposlenog (string)
      data.employee = employee;
      // Ako se menja employee, možda bi trebalo resetovati assignedTo? Prepustimo servisu
    }
    if (status) data.status = status;
    if (note !== undefined) data.note = note;
    if (rejectionReason !== undefined) data.rejectionReason = rejectionReason;
    await appointmentService.updateAppointmentById(id, data, req.user.id, 'admin');
    req.session.flash = { type: 'success', message: 'Termin je uspešno ažuriran' };
    res.redirect(`/admin/termini/detalji/${id}`);
  } catch (error) {
    next(error);
  }
}

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
    res.redirect(`/admin/termini?${query.toString()}`);
  } catch (error) {
    next(error);
  }
}