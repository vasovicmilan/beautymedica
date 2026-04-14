import * as categoryRepository from '../repositories/category.repository.js';
import {
  mapCategoryForAdminShort,
  mapCategoryForAdminDetail,
  mapCategoryForPublic,
} from '../mappers/category.mapper.js';
import { notFound, badRequest, internalError } from '../utils/error.util.js';
import logger from '../utils/logger.config.js';
import { buildCategorySeo } from '../seo/builders/category.builder.js'; 

const SITE_CONFIG = {
  siteName: process.env.SITE_NAME || 'Moj Salon',
  defaultDescription: process.env.SITE_DESCRIPTION || 'Kategorije usluga',
  defaultImage: process.env.SITE_IMAGE || '/images/default-og.jpg',
};

function mapCategory(category, role = 'public', viewType = 'short') {
  if (!category) return null;
  if (role === 'admin') {
    return viewType === 'short'
      ? mapCategoryForAdminShort(category)
      : mapCategoryForAdminDetail(category);
  }
  return mapCategoryForPublic(category);
}

async function ensureCategoryExists(id) {
  const category = await categoryRepository.findCategoryById(id);
  if (!category) notFound('Kategorija');
  return category;
}

export async function findAllCategories({ isAdmin = false, domain = null, raw = false } = {}) {
  try {
    const result = await categoryRepository.findCategories({
      isAdmin,
      domain,
      limit: 1000,
      page: 1,
      isActive: !isAdmin ? true : undefined,
    });
    if (raw) return result.data;
    return result.data.map(cat => mapCategory(cat, isAdmin ? 'admin' : 'public', 'short'));
  } catch (error) {
    logger.error({ error, isAdmin, domain }, 'findAllCategories failed');
    throw internalError('Neuspešno dohvatanje kategorija');
  }
}

export async function findCategories({
  search = '',
  limit = 20,
  page = 1,
  role = 'public',
  domain = null,
  parent = null,
  isIndexable = null,
  isActive = null,
  raw = false,
} = {}) {
  try {
    const isAdmin = role === 'admin';
    const result = await categoryRepository.findCategories({
      search,
      limit,
      page,
      isAdmin,
      domain,
      parent,
      isIndexable,
      isActive,
      populateFields: parent ? { path: 'parent', select: 'name slug' } : null,
    });
    if (raw) return result;
    const mappedData = result.data.map(cat => mapCategory(cat, role, 'short'));
    return {
      data: mappedData,
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  } catch (error) {
    logger.error({ error, params: { search, limit, page, role, domain } }, 'findCategories failed');
    throw internalError('Neuspešno dohvatanje kategorija');
  }
}

export async function findCategoryById(id, role = 'admin', raw = false) {
  try {
    const category = await categoryRepository.findCategoryById(id, { path: 'parent', select: 'name slug' });
    if (!category) notFound('Kategorija');
    if (raw) return category;
    const viewType = role === 'admin' ? 'detail' : 'short';
    return mapCategory(category, role, viewType);
  } catch (error) {
    logger.error({ error, id, role }, 'findCategoryById failed');
    throw error;
  }
}

export async function findCategoryBySlugAndDomain(slug, domain, role = 'public', raw = false) {
  try {
    if (!slug || !domain) badRequest('Nedostaje slug ili domen');
    const category = await categoryRepository.findCategoryBySlugAndDomain(slug, domain, { path: 'parent', select: 'name slug' });
    if (!category) notFound('Kategorija');
    if (role !== 'admin' && category.meta?.isActive !== true) {
      notFound('Kategorija');
    }
    if (raw) return category;
    return mapCategory(category, role, role === 'admin' ? 'detail' : 'short');
  } catch (error) {
    logger.error({ error, slug, domain, role }, 'findCategoryBySlugAndDomain failed');
    throw error;
  }
}

export async function updateCategoryById(id, data) {
  try {
    await ensureCategoryExists(id);
    const updated = await categoryRepository.updateCategoryById(id, data);
    logger.info({ categoryId: id, updatedFields: Object.keys(data) }, 'Category updated');
    return updated;
  } catch (error) {
    logger.error({ error, id, data }, 'updateCategoryById failed');
    throw error;
  }
}

export async function createCategory(data) {
  try {
    const existing = await categoryRepository.findCategoryBySlugAndDomain(data.slug, data.domain);
    if (existing) badRequest('Kategorija sa istim slug-om i domenom već postoji');
    const newCategory = await categoryRepository.createCategory(data);
    logger.info({ categoryId: newCategory._id, name: newCategory.name }, 'Category created');
    return newCategory;
  } catch (error) {
    logger.error({ error, data }, 'createCategory failed');
    throw error;
  }
}

export async function deleteCategoryById(id) {
  try {
    const deleted = await categoryRepository.deleteCategoryById(id);
    if (!deleted) notFound('Kategorija');
    logger.info({ categoryId: id, name: deleted.name }, 'Category deleted');
    return deleted;
  } catch (error) {
    logger.error({ error, id }, 'deleteCategoryById failed');
    throw error;
  }
}

export async function findRootCategories(domain, role = 'public') {
  try {
    const isAdmin = role === 'admin';
    const result = await categoryRepository.findRootCategories({ domain, isAdmin });
    return result.data.map(cat => mapCategory(cat, role, 'short'));
  } catch (error) {
    logger.error({ error, domain, role }, 'findRootCategories failed');
    throw internalError('Neuspešno dohvatanje root kategorija');
  }
}

export async function findSubcategories(parentId, domain, role = 'public') {
  try {
    const isAdmin = role === 'admin';
    const result = await categoryRepository.findSubcategories(parentId, { domain, isAdmin });
    return result.data.map(cat => mapCategory(cat, role, 'short'));
  } catch (error) {
    logger.error({ error, parentId, domain, role }, 'findSubcategories failed');
    throw internalError('Neuspešno dohvatanje podkategorija');
  }
}

export async function getPublicCategoryBySlugAndDomain(slug, domain, req) {
  try {
    if (!slug || !domain) badRequest('Nedostaje slug ili domen');
    const rawCategory = await categoryRepository.findCategoryBySlugAndDomain(slug, domain, { path: 'parent', select: 'name slug' });
    if (!rawCategory) notFound('Kategorija');
    if (rawCategory.meta?.isActive !== true) notFound('Kategorija');

    const seo = await buildCategorySeo(rawCategory, req, SITE_CONFIG);

    const mappedData = mapCategory(rawCategory, 'public', 'short');

    return { data: mappedData, seo };
  } catch (error) {
    logger.error({ error, slug, domain }, 'getPublicCategoryBySlugAndDomain failed');
    throw error;
  }
}

export async function getPublicCategories(domain, req = null) {
  try {
    const result = await categoryRepository.findCategories({
      domain,
      isAdmin: false,
      limit: 1000,
      page: 1,
      isActive: true,
      parent: null,
    });
    const mappedData = result.data.map(cat => mapCategory(cat, 'public', 'short'));
    const response = { data: mappedData };
    if (req) {
      const seo = {
        title: `Kategorije ${domain === 'service' ? 'usluga' : 'članaka'} | ${SITE_CONFIG.siteName}`,
        description: SITE_CONFIG.defaultDescription,
        canonical: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
        robots: 'index, follow',
        og: {
          title: `Kategorije ${domain === 'service' ? 'usluga' : 'članataka'} | ${SITE_CONFIG.siteName}`,
          description: SITE_CONFIG.defaultDescription,
          type: 'website',
          image: SITE_CONFIG.defaultImage,
        },
        twitter: { card: 'summary', title: 'Kategorije', description: SITE_CONFIG.defaultDescription },
      };
      response.seo = seo;
    }
    return response;
  } catch (error) {
    logger.error({ error, domain }, 'getPublicCategories failed');
    throw internalError('Neuspešno dohvatanje kategorija');
  }
}