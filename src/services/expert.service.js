import * as expertRepository from '../repositories/expert.repository.js';
import {
  mapExpertForAdminShort,
  mapExpertForAdminDetail,
  mapExpertForPublic,
} from '../mappers/expert.mapper.js';
import { notFound, badRequest, internalError } from '../utils/error.util.js';
import logger from '../config/logger.config.js';
import { buildExpertSeo } from '../seo/builders/expert.builder.js';

const SITE_CONFIG = {
  siteName: process.env.SITE_NAME || 'Moj Salon',
  defaultDescription: process.env.SITE_DESCRIPTION || 'Naši stručnjaci',
  defaultImage: process.env.SITE_IMAGE || '/images/default-og.jpg',
};

function mapExpert(expert, role = 'public', viewType = 'short') {
  if (!expert) return null;
  if (role === 'admin') {
    return viewType === 'short'
      ? mapExpertForAdminShort(expert)
      : mapExpertForAdminDetail(expert);
  }
  return mapExpertForPublic(expert);
}

async function ensureExpertExists(id) {
  const expert = await expertRepository.findExpertById(id);
  if (!expert) notFound('Stručnjak');
  return expert;
}

export async function findAllExperts({ isAdmin = false, raw = false } = {}) {
  try {
    let experts;
    if (isAdmin) {
      experts = await expertRepository.findAllExperts();
    } else {
      const result = await expertRepository.findExperts({ isAdmin: false, limit: 1000, page: 1 });
      experts = result.data;
    }
    if (raw) return experts;
    return experts.map(expert => mapExpert(expert, isAdmin ? 'admin' : 'public', 'short'));
  } catch (error) {
    logger.error({ error, isAdmin }, 'findAllExperts failed');
    throw internalError('Neuspešno dohvatanje stručnjaka');
  }
}

export async function findExperts({ search = '', limit = 20, page = 1, role = 'public', raw = false } = {}) {
  try {
    const isAdmin = role === 'admin';
    const result = await expertRepository.findExperts({
      search,
      limit,
      page,
      isAdmin,
    });
    if (raw) return result;
    const mappedData = result.data.map(expert => mapExpert(expert, role, 'short'));
    return {
      data: mappedData,
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  } catch (error) {
    logger.error({ error, search, limit, page, role }, 'findExperts failed');
    throw internalError('Neuspešno dohvatanje stručnjaka');
  }
}

export async function findExpertById(id, role = 'admin', raw = false) {
  try {
    const expert = await expertRepository.findExpertById(id);
    if (!expert) notFound('Stručnjak');
    if (raw) return expert;
    const viewType = role === 'admin' ? 'detail' : 'short';
    return mapExpert(expert, role, viewType);
  } catch (error) {
    logger.error({ error, id, role }, 'findExpertById failed');
    throw error;
  }
}

export async function findExpertBySlug(slug, role = 'public', raw = false) {
  try {
    if (!slug) badRequest('Nedostaje slug');
    const expert = await expertRepository.findExpertBySlug(slug);
    if (!expert) notFound('Stručnjak');
    if (role !== 'admin' && !expert.isActive) {
      notFound('Stručnjak');
    }
    if (raw) return expert;
    const viewType = role === 'admin' ? 'detail' : 'short';
    return mapExpert(expert, role, viewType);
  } catch (error) {
    logger.error({ error, slug, role }, 'findExpertBySlug failed');
    throw error;
  }
}

export async function updateExpertById(id, data) {
  try {
    await ensureExpertExists(id);
    const updated = await expertRepository.updateExpertById(id, data);
    logger.info({ expertId: id, updatedFields: Object.keys(data) }, 'Expert updated');
    return updated;
  } catch (error) {
    logger.error({ error, id, data }, 'updateExpertById failed');
    throw error;
  }
}

export async function createExpert(data) {
  try {
    if (data.slug) {
      const existing = await expertRepository.findExpertBySlug(data.slug);
      if (existing) badRequest('Stručnjak sa istim slug-om već postoji');
    }
    const newExpert = await expertRepository.createExpert(data);
    logger.info({ expertId: newExpert._id, name: `${newExpert.firstName} ${newExpert.lastName}` }, 'Expert created');
    return newExpert;
  } catch (error) {
    logger.error({ error, data }, 'createExpert failed');
    throw error;
  }
}

export async function deleteExpertById(id) {
  try {
    const deleted = await expertRepository.deleteExpertById(id);
    if (!deleted) notFound('Stručnjak');
    logger.info({ expertId: id, name: `${deleted.firstName} ${deleted.lastName}` }, 'Expert deleted');
    return deleted;
  } catch (error) {
    logger.error({ error, id }, 'deleteExpertById failed');
    throw error;
  }
}

export async function getPublicExpertBySlug(slug, req) {
  try {
    if (!slug) badRequest('Nedostaje slug');

    const rawExpert = await expertRepository.findExpertBySlug(slug);
    if (!rawExpert) notFound('Stručnjak');
    if (!rawExpert.isActive) notFound('Stručnjak');


    const seo = await buildExpertSeo(rawExpert, req, SITE_CONFIG);

    const mappedData = mapExpert(rawExpert, 'public', 'short');

    return { data: mappedData, seo };
  } catch (error) {
    logger.error({ error, slug }, 'getPublicExpertBySlug failed');
    throw error;
  }
}

export async function getPublicExperts({ page = 1, limit = 12, search = '' } = {}, req = null) {
  try {
    const result = await expertRepository.findExperts({
      search,
      limit,
      page,
      isAdmin: false,
    });
    const mappedData = result.data.map(expert => mapExpert(expert, 'public', 'short'));
    const response = {
      data: mappedData,
      total: result.total,
      page: result.page,
      limit: result.limit,
    };

    if (req) {
      const seo = {
        title: `Naš tim | ${SITE_CONFIG.siteName}`,
        description: SITE_CONFIG.defaultDescription,
        canonical: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
        robots: 'index, follow',
        og: {
          title: `Naš tim | ${SITE_CONFIG.siteName}`,
          description: SITE_CONFIG.defaultDescription,
          type: 'website',
          image: SITE_CONFIG.defaultImage,
        },
        twitter: { card: 'summary', title: 'Naš tim', description: SITE_CONFIG.defaultDescription },
      };
      response.seo = seo;
    }
    return response;
  } catch (error) {
    logger.error({ error, page, limit, search }, 'getPublicExperts failed');
    throw internalError('Neuspešno dohvatanje stručnjaka');
  }
}