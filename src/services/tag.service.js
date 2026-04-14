import * as tagRepository from '../repositories/tag.repository.js';
import {
  mapTagForAdminShort,
  mapTagForAdminDetail,
  mapTagForPublic,
} from '../mappers/tag.mapper.js';
import { notFound, badRequest, internalError } from '../utils/error.util.js';
import logger from '../utils/logger.config.js';
import { buildTagSeo } from '../seo/builders/tag.builder.js';

const SITE_CONFIG = {
  siteName: process.env.SITE_NAME || 'Moj Salon',
  defaultDescription: process.env.SITE_DESCRIPTION || 'Tagovi usluga i članaka',
  defaultImage: process.env.SITE_IMAGE || '/images/default-og.jpg',
};

function mapTag(tag, role = 'public', viewType = 'short') {
  if (!tag) return null;
  if (role === 'admin') {
    return viewType === 'short'
      ? mapTagForAdminShort(tag)
      : mapTagForAdminDetail(tag);
  }
  return mapTagForPublic(tag);
}

async function ensureTagExists(id) {
  const tag = await tagRepository.findTagById(id);
  if (!tag) notFound('Tag');
  return tag;
}

export async function findAllTags({ isAdmin = false, raw = false } = {}) {
  try {
    let tags;
    if (isAdmin) {
      tags = await tagRepository.findAllTags();
    } else {
      const result = await tagRepository.findTags({ isAdmin: false, limit: 1000, page: 1 });
      tags = result.data;
    }
    if (raw) return tags;
    return tags.map(t => mapTag(t, isAdmin ? 'admin' : 'public', 'short'));
  } catch (error) {
    logger.error({ error, isAdmin }, 'findAllTags failed');
    throw internalError('Neuspešno dohvatanje tagova');
  }
}

export async function findTags({
  search = '',
  limit = 20,
  page = 1,
  role = 'public',
  domain = null,
  type = null,
  isIndexable = null,
  isActive = null,
  raw = false,
} = {}) {
  try {
    const isAdmin = role === 'admin';
    const result = await tagRepository.findTags({
      search,
      limit,
      page,
      isAdmin,
      domain,
      type,
      isIndexable,
      isActive,
    });
    if (raw) return result;
    const mappedData = result.data.map(t => mapTag(t, role, 'short'));
    return {
      data: mappedData,
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  } catch (error) {
    logger.error({ error, search, limit, page, role, domain, type }, 'findTags failed');
    throw internalError('Neuspešno dohvatanje tagova');
  }
}

export async function findTagById(id, role = 'admin', raw = false) {
  try {
    const tag = await tagRepository.findTagById(id);
    if (!tag) notFound('Tag');
    if (raw) return tag;
    const viewType = role === 'admin' ? 'detail' : 'short';
    return mapTag(tag, role, viewType);
  } catch (error) {
    logger.error({ error, id, role }, 'findTagById failed');
    throw error;
  }
}

export async function findTagBySlugDomainType(slug, domain, type, role = 'public', raw = false) {
  try {
    if (!slug || !domain || !type) badRequest('Nedostaje slug, domen ili tip');
    const tag = await tagRepository.findTagBySlugDomainType(slug, domain, type);
    if (!tag) notFound('Tag');
    if (role !== 'admin' && tag.meta?.isActive !== true) {
      notFound('Tag');
    }
    if (raw) return tag;
    const viewType = role === 'admin' ? 'detail' : 'short';
    return mapTag(tag, role, viewType);
  } catch (error) {
    logger.error({ error, slug, domain, type, role }, 'findTagBySlugDomainType failed');
    throw error;
  }
}

export async function updateTagById(id, data) {
  try {
    await ensureTagExists(id);
    const updated = await tagRepository.updateTagById(id, data);
    logger.info({ tagId: id, updatedFields: Object.keys(data) }, 'Tag updated');
    return updated;
  } catch (error) {
    logger.error({ error, id, data }, 'updateTagById failed');
    throw error;
  }
}

export async function createTag(data) {
  try {
    const existing = await tagRepository.findTagBySlugDomainType(data.slug, data.domain, data.type);
    if (existing) badRequest('Tag sa istim slug-om, domenom i tipom već postoji');
    const newTag = await tagRepository.createTag(data);
    logger.info({ tagId: newTag._id, name: newTag.name }, 'Tag created');
    return newTag;
  } catch (error) {
    logger.error({ error, data }, 'createTag failed');
    throw error;
  }
}

export async function deleteTagById(id) {
  try {
    const deleted = await tagRepository.deleteTagById(id);
    if (!deleted) notFound('Tag');
    logger.info({ tagId: id, name: deleted.name }, 'Tag deleted');
    return deleted;
  } catch (error) {
    logger.error({ error, id }, 'deleteTagById failed');
    throw error;
  }
}

export async function getPublicTagBySlugDomainType(slug, domain, type, req) {
  try {
    if (!slug || !domain || !type) badRequest('Nedostaje slug, domen ili tip');
    const rawTag = await tagRepository.findTagBySlugDomainType(slug, domain, type);
    if (!rawTag) notFound('Tag');
    if (rawTag.meta?.isActive !== true) notFound('Tag');

    const seo = await buildTagSeo(rawTag, req, SITE_CONFIG);

    const mappedData = mapTag(rawTag, 'public', 'short');

    return { data: mappedData, seo };
  } catch (error) {
    logger.error({ error, slug, domain, type }, 'getPublicTagBySlugDomainType failed');
    throw error;
  }
}

export async function getPublicTags(domain, req = null) {
  try {
    const result = await tagRepository.findTags({
      domain,
      isAdmin: false,
      limit: 1000,
      page: 1,
      isActive: true,
    });
    const mappedData = result.data.map(t => mapTag(t, 'public', 'short'));
    const response = { data: mappedData };
    if (req) {
      const seo = {
        title: `Tagovi ${domain === 'service' ? 'usluga' : 'članaka'} | ${SITE_CONFIG.siteName}`,
        description: SITE_CONFIG.defaultDescription,
        canonical: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
        robots: 'index, follow',
        og: {
          title: `Tagovi ${domain === 'service' ? 'usluga' : 'članaka'} | ${SITE_CONFIG.siteName}`,
          description: SITE_CONFIG.defaultDescription,
          type: 'website',
          image: SITE_CONFIG.defaultImage,
        },
        twitter: { card: 'summary', title: 'Tagovi', description: SITE_CONFIG.defaultDescription },
      };
      response.seo = seo;
    }
    return response;
  } catch (error) {
    logger.error({ error, domain }, 'getPublicTags failed');
    throw internalError('Neuspešno dohvatanje tagova');
  }
}