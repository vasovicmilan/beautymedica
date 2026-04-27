import * as testimonialRepository from '../repositories/testimonial.repository.js';
import {
  mapTestimonialForAdminShort,
  mapTestimonialForAdminDetail,
  mapTestimonialForPublic,
} from '../mappers/testimonial.mapper.js';
import { notFound, badRequest, internalError } from '../utils/error.util.js';
import logger from '../config/logger.config.js';

function mapTestimonial(testimonial, role = 'public', viewType = 'short') {
  if (!testimonial) return null;
  if (role === 'admin') {
    return viewType === 'short'
      ? mapTestimonialForAdminShort(testimonial)
      : mapTestimonialForAdminDetail(testimonial);
  }
  return mapTestimonialForPublic(testimonial);
}

async function ensureTestimonialExists(id) {
  const testimonial = await testimonialRepository.findTestimonialById(id);
  if (!testimonial) notFound('Utisak');
  return testimonial;
}

export async function findFeaturedTestimonials(limit = 6, raw = false) {
  try {
    const result = await testimonialRepository.findTestimonials({
      isAdmin: false,
      approved: true,
      limit,
      page: 1,
      populateFields: [
        { path: 'user', select: 'firstName lastName email' },
        { path: 'service', select: 'name' },
        { path: 'employee', populate: { path: 'userId', select: 'firstName lastName' } },
      ],
    });
    if (raw) return result.data;
    return result.data.map(t => mapTestimonial(t, 'public', 'short'));
  } catch (error) {
    logger.error({ error, limit }, 'findFeaturedTestimonials failed');
    throw internalError('Neuspešno dohvatanje istaknutih utisaka');
  }
}

export async function findTestimonials({
  search = '',
  limit = 20,
  page = 1,
  role = 'public',
  rating = null,
  serviceId = null,
  employeeId = null,
  userId = null,
  approved = null,
  raw = false,
} = {}) {
  try {
    const isAdmin = role === 'admin';
    let approvedFilter = approved;
    if (!isAdmin && approvedFilter === null) {
      approvedFilter = true;
    }
    const result = await testimonialRepository.findTestimonials({
      search,
      limit,
      page,
      isAdmin,
      rating,
      serviceId,
      employeeId,
      userId,
      approved: approvedFilter,
      populateFields: [
        { path: 'user', select: 'firstName lastName email' },
        { path: 'service', select: 'name' },
        { path: 'employee', populate: { path: 'userId', select: 'firstName lastName' } },
      ],
    });
    if (raw) return result;
    const mappedData = result.data.map(t => mapTestimonial(t, role, 'short'));
    return {
      data: mappedData,
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  } catch (error) {
    logger.error({ error, search, limit, page, role }, 'findTestimonials failed');
    throw internalError('Neuspešno dohvatanje utisaka');
  }
}

export async function findTestimonialById(id, role = 'admin', raw = false) {
  try {
    const testimonial = await testimonialRepository.findTestimonialById(id,
      [
        { path: 'user', select: 'firstName lastName email' },
        { path: 'service', select: 'name' },
        { path: 'employee', populate: { path: 'userId', select: 'firstName lastName' } },
      ],
    );
    if (!testimonial) notFound('Utisak');
    if (role !== 'admin' && !testimonial.approved) {
      notFound('Utisak');
    }
    if (raw) return testimonial;
    const viewType = role === 'admin' ? 'detail' : 'short';
    return mapTestimonial(testimonial, role, viewType);
  } catch (error) {
    logger.error({ error, id, role }, 'findTestimonialById failed');
    throw error;
  }
}

export async function updateTestimonialById(id, data) {
  try {
    await ensureTestimonialExists(id);
    const updated = await testimonialRepository.updateTestimonialById(id, data);
    logger.info({ testimonialId: id, updatedFields: Object.keys(data) }, 'Testimonial updated');
    return updated;
  } catch (error) {
    logger.error({ error, id, data }, 'updateTestimonialById failed');
    throw error;
  }
}

export async function createNewTestimonial(data) {
  try {
    if (!data.rating || !data.comment) {
      badRequest('Ocena i komentar su obavezni');
    }

    if (!data.displayName) {
      data.displayName = 'Anonymous';
    }

    if (data.approved === undefined) {
      data.approved = false;
    }
    const newTestimonial = await testimonialRepository.createTestimonial(data);
    logger.info({ testimonialId: newTestimonial._id, rating: newTestimonial.rating }, 'Testimonial created');
    return newTestimonial;
  } catch (error) {
    logger.error({ error, data }, 'createNewTestimonial failed');
    throw error;
  }
}

export async function deleteTestimonialById(id) {
  try {
    const deleted = await testimonialRepository.deleteTestimonialById(id);
    if (!deleted) notFound('Utisak');
    logger.info({ testimonialId: id }, 'Testimonial deleted');
    return deleted;
  } catch (error) {
    logger.error({ error, id }, 'deleteTestimonialById failed');
    throw error;
  }
}

export async function getTotalApprovedTestimonialsCount() {
  try {
    const total = await testimonialRepository.countTestimonialsByParams({
      isAdmin: false,
      approved: true,
    });
    return total;
  } catch (error) {
    logger.error({ error }, 'getTotalApprovedTestimonialsCount failed');
    throw internalError('Neuspešno dohvatanje broja utisaka');
  }
}

export async function getTestimonialsStats() {
  try {
    const [total, { averageRating }] = await Promise.all([
      testimonialRepository.countTestimonialsByParams({
        isAdmin: false,
        approved: true,
      }),
      testimonialRepository.getAverageRating({
        isAdmin: false,
        approved: true,
      }),
    ]);
    return { total, averageRating };
  } catch (error) {
    logger.error({ error }, 'getTestimonialsStats failed');
    throw internalError('Neuspešno dohvatanje statistike utisaka');
  }
}