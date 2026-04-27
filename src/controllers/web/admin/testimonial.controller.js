import * as testimonialService from '../../../services/testimonial.service.js';
import * as serviceService from '../../../services/service.service.js';
import * as employeeService from '../../../services/employee.service.js';
import * as userService from '../../../services/user.service.js';
import { badRequest } from '../../../utils/error.util.js';

// Helper za SEO na admin stranicama
function getAdminSeo(title) {
  return {
    title: `Admin - ${title}`,
    robots: 'noindex, follow',
    description: '',
  };
}

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
    const seo = getAdminSeo('Utisci');
    res.render('admin/testimonial/testimonials', {
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
      seo,
    });
  } catch (error) {
    next(error);
  }
}

export async function testimonialDetail(req, res, next) {
  try {
    const { testimonialId } = req.params;
    const testimonial = await testimonialService.findTestimonialById(testimonialId, 'admin');
    // Dohvati dodatne podatke za dropdown (usluge, zaposleni, korisnici)
    const services = await serviceService.findAllServices({ isAdmin: true, raw: true });
    const employeesResult = await employeeService.findEmployees({ role: 'admin', raw: true });
    const employees = employeesResult.data || [];
    const users = await userService.findAllUsers({ raw: true });
    const seo = getAdminSeo(`Utisak: ${testimonial.autor.ime}`);
    res.render('admin/testimonial/testimonial-details', {
      testimonial,
      services,
      employees,
      users,
      seo,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateTestimonial(req, res, next) {
  try {
    const { id, approved } = req.body;
    if (!id) badRequest('Nedostaje ID utiska');
    const isApproved = approved === 'true' || approved === true || approved === 'on';
    const data = { approved: isApproved };
    
    await testimonialService.updateTestimonialById(id, data);
    req.session.flash = { type: 'success', message: `Utisak je ${isApproved ? 'odobren' : 'odbijen'}.` };
    res.redirect(`/admin/utisci/detalji/${id}`);
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
    res.redirect(`/admin/utisci?${query.toString()}`);
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
    res.redirect('/admin/utisci');
  } catch (error) {
    next(error);
  }
}