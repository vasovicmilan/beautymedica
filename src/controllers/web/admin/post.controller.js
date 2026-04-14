import * as postService from '../../services/post.service.js';
import * as expertService from '../../services/expert.service.js';
import * as categoryService from '../../services/category.service.js';
import * as tagService from '../../services/tag.service.js';
import { badRequest } from '../../utils/error.util.js';

export async function listPosts(req, res, next) {
  try {
    const { search, limit, page, status } = req.query;
    const result = await postService.findPosts({
      search,
      limit: limit ? parseInt(limit) : 20,
      page: page ? parseInt(page) : 1,
      isAdmin: true,
      status,
    });
    res.render('admin/posts/index', {
      posts: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      search,
      status,
    });
  } catch (error) {
    next(error);
  }
}

export async function postDetail(req, res, next) {
  try {
    const { postId } = req.params;
    const post = await postService.findPostDetailsById(postId, true);
    res.render('admin/posts/detail', { post });
  } catch (error) {
    next(error);
  }
}

export async function addPostForm(req, res, next) {
  try {
    // Dohvati potrebne podatke za dropdownove
    const experts = await expertService.findAllExperts({ isAdmin: true, raw: true });
    const categories = await categoryService.findAllCategories({ isAdmin: true, raw: true });
    const tags = await tagService.findAllTags({ isAdmin: true, raw: true });
    res.render('admin/posts/add', { experts, categories, tags });
  } catch (error) {
    next(error);
  }
}

export async function editPostForm(req, res, next) {
  try {
    const { postId } = req.params;
    const post = await postService.findPostDetailsById(postId, true, true); // raw podaci
    const experts = await expertService.findAllExperts({ isAdmin: true, raw: true });
    const categories = await categoryService.findAllCategories({ isAdmin: true, raw: true });
    const tags = await tagService.findAllTags({ isAdmin: true, raw: true });
    // ID-jevi kategorija i tagova koji su već dodeljeni postu
    const postCategoryIds = post.categories?.map(c => c._id?.toString() || c.toString()) || [];
    const postTagIds = post.tags?.map(t => t._id?.toString() || t.toString()) || [];
    res.render('admin/posts/edit', { post, experts, categories, tags, postCategoryIds, postTagIds });
  } catch (error) {
    next(error);
  }
}

export async function createPost(req, res, next) {
  try {
    const {
      title,
      slug,
      status,
      expert,
      shortDescription,
      description,
      content,
      imageUrl,
      imageAlt,
      categories,
      tags,
      seoKeywords,
      faq,
      isIndexable,
    } = req.body;

    if (!title || !slug || !expert) {
      badRequest('Naslov, slug i autor su obavezni');
    }

    let parsedContent = [];
    if (content) {
      try {
        parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
      } catch (e) {
        badRequest('Neispravan format sadržaja');
      }
    }

    let parsedFaq = [];
    if (faq) {
      try {
        parsedFaq = typeof faq === 'string' ? JSON.parse(faq) : faq;
      } catch (e) {
        badRequest('Neispravan format FAQ');
      }
    }

    let keywordsArray = [];
    if (seoKeywords) {
      if (Array.isArray(seoKeywords)) keywordsArray = seoKeywords;
      else if (typeof seoKeywords === 'string') keywordsArray = seoKeywords.split(',').map(k => k.trim());
    }

    const data = {
      title: title.trim(),
      slug: slug.toLowerCase().trim(),
      status: status || 'draft',
      expert,
      shortDescription: shortDescription || '',
      description: description || '',
      content: parsedContent,
      image: imageUrl ? { url: imageUrl.trim(), alt: imageAlt?.trim() || title } : null,
      categories: Array.isArray(categories) ? categories : (categories ? [categories] : []),
      tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
      seoKeywords: keywordsArray,
      faq: parsedFaq,
      isIndexable: isIndexable === 'on' || isIndexable === true,
    };

    await postService.createNewPost(data);
    req.session.flash = { type: 'success', message: 'Post je uspešno kreiran' };
    res.redirect('/admin/posts');
  } catch (error) {
    next(error);
  }
}

export async function updatePost(req, res, next) {
  try {
    const {
      id,
      title,
      slug,
      status,
      expert,
      shortDescription,
      description,
      content,
      imageUrl,
      imageAlt,
      categories,
      tags,
      seoKeywords,
      faq,
      isIndexable,
    } = req.body;

    if (!id) badRequest('Nedostaje ID posta');

    let parsedContent = [];
    if (content) {
      try {
        parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
      } catch (e) {
        badRequest('Neispravan format sadržaja');
      }
    }

    let parsedFaq = [];
    if (faq) {
      try {
        parsedFaq = typeof faq === 'string' ? JSON.parse(faq) : faq;
      } catch (e) {
        badRequest('Neispravan format FAQ');
      }
    }

    let keywordsArray = [];
    if (seoKeywords) {
      if (Array.isArray(seoKeywords)) keywordsArray = seoKeywords;
      else if (typeof seoKeywords === 'string') keywordsArray = seoKeywords.split(',').map(k => k.trim());
    }

    const data = {
      title: title?.trim(),
      slug: slug?.toLowerCase().trim(),
      status,
      expert,
      shortDescription: shortDescription || '',
      description: description || '',
      content: parsedContent,
      image: imageUrl ? { url: imageUrl.trim(), alt: imageAlt?.trim() || title } : null,
      categories: Array.isArray(categories) ? categories : (categories ? [categories] : []),
      tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
      seoKeywords: keywordsArray,
      faq: parsedFaq,
      isIndexable: isIndexable === 'on' || isIndexable === true,
    };

    await postService.updatePostById(id, data);
    req.session.flash = { type: 'success', message: 'Post je uspešno ažuriran' };
    res.redirect(`/admin/posts/detalji/${id}`);
  } catch (error) {
    next(error);
  }
}

export async function searchPosts(req, res, next) {
  try {
    const { search, status, limit, page } = req.body;
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (status) query.append('status', status);
    if (limit) query.append('limit', limit);
    if (page) query.append('page', page);
    res.redirect(`/admin/posts?${query.toString()}`);
  } catch (error) {
    next(error);
  }
}

export async function deletePost(req, res, next) {
  try {
    const { postId } = req.body;
    await postService.deletePostById(postId);
    req.session.flash = { type: 'success', message: 'Post je obrisan' };
    res.redirect('/admin/posts');
  } catch (error) {
    next(error);
  }
}