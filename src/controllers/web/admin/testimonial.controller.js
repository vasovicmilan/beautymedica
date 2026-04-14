import * as testimonialService from '../../../services/testimonial.service.js';
import * as serviceService from '../../../services/service.service.js';
import * as employeeService from '../../../services/employee.service.js';
import * as userService from '../../../services/user.service.js';
import { badRequest } from '../../../utils/error.util.js';

export async function listTestimonials(req, res, next) {
  try {
    const { search, limit, page, rating, serviceId, employeeId, userId, approved } = req.query;
    const result = await testimonialService.findTestimonials({
      search,
      limit: limit ? parseInt(limit) : 20,
      page: page ? parseInt(page) : 1,
      role: 'admin',
      rating: rating ? parseInt(rating) : null,
      serviceId,
      employeeId,
      userId,
      approved: approved === 'true' ? true : (approved === 'false' ? false : null),
    });
    res.render('admin/testimonials/index', {
      testimonials: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      search,
      rating,
      serviceId,
      employeeId,
      userId,
      approved,
    });
  } catch (error) {
    next(error);
  }
}

export async function testimonialDetail(req, res, next) {
  try {
    const { testimonialId } = req.params;
    const testimonial = await testimonialService.findTestimonialById(testimonialId, 'admin');
    res.render('admin/testimonials/detail', { testimonial });
  } catch (error) {
    next(error);
  }
}

export async function addTestimonialForm(req, res, next) {
  try {
    const services = await serviceService.findAllServices({ isAdmin: true, raw: true });
    const employeesResult = await employeeService.findEmployees({ role: 'admin', raw: true });
    const employees = employeesResult.data || [];
    const users = await userService.findAllUsers({ raw: true });
    res.render('admin/testimonials/add', { services, employees, users });
  } catch (error) {
    next(error);
  }
}

export async function editTestimonialForm(req, res, next) {
  try {
    const { testimonialId } = req.params;
    const testimonial = await testimonialService.findTestimonialById(testimonialId, 'admin', true); // raw
    const services = await serviceService.findAllServices({ isAdmin: true, raw: true });
    const employeesResult = await employeeService.findEmployees({ role: 'admin', raw: true });
    const employees = employeesResult.data || [];
    const users = await userService.findAllUsers({ raw: true });
    res.render('admin/testimonials/edit', { testimonial, services, employees, users });
  } catch (error) {
    next(error);
  }
}

export async function createTestimonial(req, res, next) {
  try {
    const {
      user,
      displayName,
      rating,
      comment,
      service,
      employee,
      approved,
    } = req.body;

    if (!rating || !comment) {
      badRequest('Ocena i komentar su obavezni');
    }

    const data = {
      user: user || null,
      displayName: displayName?.trim() || 'Anonymous',
      rating: parseInt(rating),
      comment: comment.trim(),
      service: service || null,
      employee: employee || null,
      approved: approved === 'on' || approved === true,
    };

    await testimonialService.createNewTestimonial(data);
    req.session.flash = { type: 'success', message: 'Utisak je uspešno kreiran' };
    res.redirect('/admin/testimonials');
  } catch (error) {
    next(error);
  }
}

export async function updateTestimonial(req, res, next) {
  try {
    const {
      id,
      user,
      displayName,
      rating,
      comment,
      service,
      employee,
      approved,
    } = req.body;

    if (!id) badRequest('Nedostaje ID utiska');

    const data = {
      user: user || null,
      displayName: displayName?.trim() || 'Anonymous',
      rating: rating ? parseInt(rating) : undefined,
      comment: comment?.trim(),
      service: service || null,
      employee: employee || null,
      approved: approved === 'on' || approved === true,
    };

    Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

    await testimonialService.updateTestimonialById(id, data);
    req.session.flash = { type: 'success', message: 'Utisak je uspešno ažuriran' };
    res.redirect(`/admin/testimonials/detalji/${id}`);
  } catch (error) {
    next(error);
  }
}

export async function searchTestimonials(req, res, next) {
  try {
    const { search, rating, serviceId, employeeId, userId, approved, limit, page } = req.body;
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (rating) query.append('rating', rating);
    if (serviceId) query.append('serviceId', serviceId);
    if (employeeId) query.append('employeeId', employeeId);
    if (userId) query.append('userId', userId);
    if (approved !== undefined && approved !== '') query.append('approved', approved);
    if (limit) query.append('limit', limit);
    if (page) query.append('page', page);
    res.redirect(`/admin/testimonials?${query.toString()}`);
  } catch (error) {
    next(error);
  }
}

export async function deleteTestimonial(req, res, next) {
  try {
    const { id } = req.body;
    if (!id) badRequest('Nedostaje ID utiska');
    await testimonialService.deleteTestimonialById(id);
    req.session.flash = { type: 'success', message: 'Utisak je obrisan' };
    res.redirect('/admin/testimonials');
  } catch (error) {
    next(error);
  }
}