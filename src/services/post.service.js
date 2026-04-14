import * as postRepository from '../repositories/post.repository.js';
import {
  mapPostForAdminShort,
  mapPostForAdminDetail,
  mapPostForPublicCard,
  mapPostForPublicDetail,
} from '../mappers/post.mapper.js';
import { notFound, badRequest, internalError } from '../utils/error.util.js';
import logger from '../utils/logger.config.js';
import { buildPostSeo } from '../seo/builders/post.builder.js';

const SITE_CONFIG = {
  siteName: process.env.SITE_NAME || 'Moj Salon',
  defaultDescription: process.env.SITE_DESCRIPTION || 'Članci i novosti',
  defaultImage: process.env.SITE_IMAGE || '/images/default-og.jpg',
};

function mapPost(post, role = 'public', viewType = 'short') {
  if (!post) return null;
  if (role === 'admin') {
    return viewType === 'short' ? mapPostForAdminShort(post) : mapPostForAdminDetail(post);
  }
  return viewType === 'short' ? mapPostForPublicCard(post) : mapPostForPublicDetail(post);
}

async function ensurePostExists(id) {
  const post = await postRepository.findPostById(id);
  if (!post) notFound('Post');
  return post;
}

export async function findFeaturedPosts(limit = 10, page = 1, raw = false) {
  try {
    const result = await postRepository.findPosts({
      status: 'featured',
      isAdmin: true,
      limit,
      page,
      populateFields: { path: 'expert', select: 'firstName lastName bio image' },
    });
    if (raw) return result;
    const mappedData = result.data.map(post => mapPost(post, 'public', 'short'));
    return {
      data: mappedData,
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  } catch (error) {
    logger.error({ error, limit, page }, 'findFeaturedPosts failed');
    throw internalError('Neuspešno dohvatanje istaknutih postova');
  }
}

export async function findPosts({
  search = '',
  limit = 20,
  page = 1,
  isAdmin = false,
  status = null,
  expertId = null,
  categories = null,
  tags = null,
  raw = false,
} = {}) {
  try {
    const result = await postRepository.findPosts({
      search,
      limit,
      page,
      isAdmin,
      status,
      expertId,
      categories,
      tags,
      populateFields: [
        { path: 'expert', select: 'firstName lastName bio image' },
        { path: 'categories', select: 'name slug' },
        { path: 'tags', select: 'name slug' },
      ],
    });
    if (raw) return result;
    const role = isAdmin ? 'admin' : 'public';
    const viewType = 'short';
    const mappedData = result.data.map(post => mapPost(post, role, viewType));
    return {
      data: mappedData,
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  } catch (error) {
    logger.error({ error, search, limit, page, isAdmin }, 'findPosts failed');
    throw internalError('Neuspešno dohvatanje postova');
  }
}

export async function findPostDetailsById(id, isAdmin = false, raw = false) {
  try {
    const post = await postRepository.findPostById(id, {
      path: [
        { path: 'expert', select: 'firstName lastName bio image' },
        { path: 'categories', select: 'name slug' },
        { path: 'tags', select: 'name slug' },
      ],
    });
    if (!post) notFound('Post');
    if (!isAdmin && !['published', 'featured'].includes(post.status)) {
      notFound('Post');
    }
    if (raw) return post;
    const role = isAdmin ? 'admin' : 'public';
    const viewType = 'detail';
    return mapPost(post, role, viewType);
  } catch (error) {
    logger.error({ error, id, isAdmin }, 'findPostDetailsById failed');
    throw error;
  }
}

export async function findPostDetailsBySlug(slug, raw = false) {
  try {
    if (!slug) badRequest('Nedostaje slug');
    const post = await postRepository.findPostBySlug(slug, false, {
      path: [
        { path: 'expert', select: 'firstName lastName bio image' },
        { path: 'categories', select: 'name slug' },
        { path: 'tags', select: 'name slug' },
      ],
    });
    if (!post) notFound('Post');
    if (raw) return post;
    return mapPost(post, 'public', 'detail');
  } catch (error) {
    logger.error({ error, slug }, 'findPostDetailsBySlug failed');
    throw error;
  }
}

export async function updatePostById(id, data) {
  try {
    await ensurePostExists(id);
    const updated = await postRepository.updatePostById(id, data);
    logger.info({ postId: id, updatedFields: Object.keys(data) }, 'Post updated');
    return updated;
  } catch (error) {
    logger.error({ error, id, data }, 'updatePostById failed');
    throw error;
  }
}

export async function createNewPost(data) {
  try {
    if (data.slug) {
      const existing = await postRepository.findPostBySlug(data.slug, true);
      if (existing) badRequest('Post sa istim slug-om već postoji');
    }
    const newPost = await postRepository.createPost(data);
    logger.info({ postId: newPost._id, title: newPost.title }, 'Post created');
    return newPost;
  } catch (error) {
    logger.error({ error, data }, 'createNewPost failed');
    throw error;
  }
}

export async function deletePostById(id) {
  try {
    const deleted = await postRepository.deletePostById(id);
    if (!deleted) notFound('Post');
    logger.info({ postId: id, title: deleted.title }, 'Post deleted');
    return deleted;
  } catch (error) {
    logger.error({ error, id }, 'deletePostById failed');
    throw error;
  }
}

export async function getPublicPostBySlug(slug, req) {
  try {
    if (!slug) badRequest('Nedostaje slug');
    const rawPost = await postRepository.findPostBySlug(slug, false, {
      path: [
        { path: 'expert', select: 'firstName lastName bio image' },
        { path: 'categories', select: 'name slug' },
        { path: 'tags', select: 'name slug' },
      ],
    });
    if (!rawPost) notFound('Post');
    if (!['published', 'featured'].includes(rawPost.status)) notFound('Post');

    const seo = await buildPostSeo(rawPost, req, SITE_CONFIG);

    const mappedData = mapPost(rawPost, 'public', 'detail');

    return { data: mappedData, seo };
  } catch (error) {
    logger.error({ error, slug }, 'getPublicPostBySlug failed');
    throw error;
  }
}

export async function getPublicPosts({ page = 1, limit = 12, search = '' } = {}, req = null) {
  try {
    const result = await postRepository.findPosts({
      search,
      limit,
      page,
      isAdmin: false,
      populateFields: [
        { path: 'expert', select: 'firstName lastName' },
        { path: 'categories', select: 'name slug' },
        { path: 'tags', select: 'name slug' },
      ],
    });
    const mappedData = result.data.map(post => mapPost(post, 'public', 'short'));
    const response = {
      data: mappedData,
      total: result.total,
      page: result.page,
      limit: result.limit,
    };

    if (req) {
      const seo = {
        title: `Blog | ${SITE_CONFIG.siteName}`,
        description: SITE_CONFIG.defaultDescription,
        canonical: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
        robots: 'index, follow',
        og: {
          title: `Blog | ${SITE_CONFIG.siteName}`,
          description: SITE_CONFIG.defaultDescription,
          type: 'website',
          image: SITE_CONFIG.defaultImage,
        },
        twitter: { card: 'summary', title: 'Blog', description: SITE_CONFIG.defaultDescription },
      };
      response.seo = seo;
    }
    return response;
  } catch (error) {
    logger.error({ error, page, limit, search }, 'getPublicPosts failed');
    throw internalError('Neuspešno dohvatanje postova');
  }
}