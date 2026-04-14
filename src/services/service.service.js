import * as serviceRepository from '../repositories/service.repository.js';
import {
  mapServiceForAdminShort,
  mapServiceForAdminDetail,
  mapServiceForPublicCard,
  mapServiceForPublicDetail,
} from '../mappers/service.mapper.js';
import { notFound, badRequest, internalError } from '../utils/error.util.js';
import logger from '../utils/logger.config.js';
import { generateSeo } from '../seo/index.seo.js';

const SITE_CONFIG = {
  siteName: process.env.SITE_NAME || 'Moj Salon',
  defaultDescription: process.env.SITE_DESCRIPTION || 'Profesionalne usluge nege i masaže',
  defaultImage: process.env.SITE_IMAGE || '/images/default-og.jpg',
};

function mapService(service, role = 'public', viewType = 'short') {
  if (!service) return null;
  if (role === 'admin') {
    return viewType === 'short' ? mapServiceForAdminShort(service) : mapServiceForAdminDetail(service);
  }
  return viewType === 'short' ? mapServiceForPublicCard(service) : mapServiceForPublicDetail(service);
}

async function ensureServiceExists(id) {
  const service = await serviceRepository.findServiceById(id);
  if (!service) notFound('Usluga');
  return service;
}

export async function findFeaturedServices(limit = 6, raw = false) {
  try {
    const result = await serviceRepository.findServices({
      search: '',
      limit,
      page: 1,
      isAdmin: false,
    });
    const featured = result.data.filter(s => s.highlight === true);
    if (raw) return featured;
    return featured.map(service => mapService(service, 'public', 'short'));
  } catch (error) {
    logger.error({ error, limit }, 'findFeaturedServices failed');
    throw internalError('Neuspešno dohvatanje istaknutih usluga');
  }
}

export async function findServices({
  search = '',
  limit = 20,
  page = 1,
  isAdmin = false,
  raw = false,
} = {}) {
  try {
    const result = await serviceRepository.findServices({
      search,
      limit,
      page,
      isAdmin,
      populateFields: [
        { path: 'categories', select: 'name' },
        { path: 'tags', select: 'name' },
        { path: 'employees', populate: { path: 'userId', select: 'firstName lastName' } },
      ],
    });
    if (raw) return result;
    const role = isAdmin ? 'admin' : 'public';
    const viewType = 'short';
    const mappedData = result.data.map(service => mapService(service, role, viewType));
    return {
      data: mappedData,
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  } catch (error) {
    logger.error({ error, search, limit, page, isAdmin }, 'findServices failed');
    throw internalError('Neuspešno dohvatanje usluga');
  }
}

export async function findServiceById(id, isAdmin = false, raw = false) {
  try {
    const service = await serviceRepository.findServiceById(id, {
      path: [
        { path: 'categories', select: 'name slug' },
        { path: 'tags', select: 'name slug' },
        { path: 'employees', populate: { path: 'userId', select: 'firstName lastName' } },
      ],
    });
    if (!service) notFound('Usluga');
    if (!isAdmin && !service.isActive) notFound('Usluga');
    if (raw) return service;
    const role = isAdmin ? 'admin' : 'public';
    const viewType = 'detail';
    return mapService(service, role, viewType);
  } catch (error) {
    logger.error({ error, id, isAdmin }, 'findServiceById failed');
    throw error;
  }
}

export async function findServiceBySlug(slug, raw = false) {
  try {
    if (!slug) badRequest('Nedostaje slug');
    const service = await serviceRepository.findServiceBySlug(slug, {
      path: [
        { path: 'categories', select: 'name slug' },
        { path: 'tags', select: 'name slug' },
        { path: 'employees', populate: { path: 'userId', select: 'firstName lastName' } },
      ],
    });
    if (!service) notFound('Usluga');
    if (!service.isActive) notFound('Usluga');
    if (raw) return service;
    return mapService(service, 'public', 'detail');
  } catch (error) {
    logger.error({ error, slug }, 'findServiceBySlug failed');
    throw error;
  }
}

export async function updateServiceById(id, data) {
  try {
    await ensureServiceExists(id);
    if (data.slug) {
      const existing = await serviceRepository.findServiceBySlug(data.slug);
      if (existing && existing._id.toString() !== id) {
        badRequest('Usluga sa istim slug-om već postoji');
      }
    }
    const updated = await serviceRepository.updateServiceById(id, data);
    logger.info({ serviceId: id, updatedFields: Object.keys(data) }, 'Service updated');
    return updated;
  } catch (error) {
    logger.error({ error, id, data }, 'updateServiceById failed');
    throw error;
  }
}

export async function createNewService(data) {
  try {
    if (data.slug) {
      const existing = await serviceRepository.findServiceBySlug(data.slug);
      if (existing) badRequest('Usluga sa istim slug-om već postoji');
    }
    const newService = await serviceRepository.createService(data);
    logger.info({ serviceId: newService._id, name: newService.name }, 'Service created');
    return newService;
  } catch (error) {
    logger.error({ error, data }, 'createNewService failed');
    throw error;
  }
}

export async function deleteServiceById(id) {
  try {
    const deleted = await serviceRepository.deleteServiceById(id);
    if (!deleted) notFound('Usluga');
    logger.info({ serviceId: id, name: deleted.name }, 'Service deleted');
    return deleted;
  } catch (error) {
    logger.error({ error, id }, 'deleteServiceById failed');
    throw error;
  }
}

export async function getPublicServiceBySlug(slug, req) {
  try {
    if (!slug) badRequest('Nedostaje slug');
    const rawService = await serviceRepository.findServiceBySlug(slug, {
      path: [
        { path: 'categories', select: 'name slug' },
        { path: 'tags', select: 'name slug' },
        { path: 'employees', populate: { path: 'userId', select: 'firstName lastName' } },
      ],
    });
    if (!rawService) notFound('Usluga');
    if (!rawService.isActive) notFound('Usluga');

    const seo = await generateSeo('service', rawService, req, SITE_CONFIG);

    const mappedData = mapService(rawService, 'public', 'detail');

    return { data: mappedData, seo };
  } catch (error) {
    logger.error({ error, slug }, 'getPublicServiceBySlug failed');
    throw error;
  }
}

export async function getPublicServices({ page = 1, limit = 12, search = '' } = {}, req = null) {
  try {
    const result = await serviceRepository.findServices({
      search,
      limit,
      page,
      isAdmin: false, // samo aktivne usluge
      populateFields: [
        { path: 'categories', select: 'name' },
        { path: 'tags', select: 'name' },
      ],
    });
    const mappedData = result.data.map(service => mapService(service, 'public', 'short'));
    const response = {
      data: mappedData,
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
    // Ako je prosleđen req, generiši SEO za listu (opciono)
    if (req) {
      // Možete napraviti poseban SEO builder za listu, ili koristiti default
      // Ovdje koristimo statički SEO – može se prilagoditi
      const seo = {
        title: `Usluge | ${SITE_CONFIG.siteName}`,
        description: SITE_CONFIG.defaultDescription,
        canonical: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
        robots: 'index, follow',
        og: {
          title: `Usluge | ${SITE_CONFIG.siteName}`,
          description: SITE_CONFIG.defaultDescription,
          type: 'website',
          image: SITE_CONFIG.defaultImage,
        },
        twitter: { card: 'summary', title: 'Usluge', description: SITE_CONFIG.defaultDescription },
      };
      response.seo = seo;
    }
    return response;
  } catch (error) {
    logger.error({ error, page, limit, search }, 'getPublicServices failed');
    throw internalError('Neuspešno dohvatanje usluga');
  }
}