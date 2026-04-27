import * as postService from '../../../services/post.service.js';
import * as expertService from '../../../services/expert.service.js';
import * as categoryService from '../../../services/category.service.js';
import * as tagService from '../../../services/tag.service.js';
import { badRequest } from '../../../utils/error.util.js';

// Helper za SEO (admin stranice se ne indeksiraju)
function getAdminSeo(title) {
  return {
    title: `Admin - ${title}`,
    robots: 'noindex, follow',
    description: '',
  };
}

// Lista svih postova (tabela)
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
    const seo = getAdminSeo('Blog postovi');
    res.render('admin/blog/posts', {
      posts: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      search,
      status,
      seo,
    });
  } catch (error) {
    next(error);
  }
}

// Detalji posta (samo prikaz, sa dugmetom za izmenu)
export async function postDetail(req, res, next) {
  try {
    const { postId } = req.params;
    const post = await postService.findPostDetailsById(postId, true);
    const seo = getAdminSeo(`Post: ${post.naslov}`);
    res.render('admin/blog/post-details', { post, seo });
  } catch (error) {
    next(error);
  }
}

// Zajednička forma za dodavanje/izmenu
export async function postForm(req, res, next) {
  try {
    const isEdit = req.params.postId ? true : false;
    let post = null;
    let postCategoryIds = [];
    let postTagIds = [];

    const experts = await expertService.findAllExperts({ isAdmin: true, raw: true });
    const categories = await categoryService.findAllCategories({ isAdmin: true, raw: true });
    const tags = await tagService.findAllTags({ isAdmin: true, raw: true });

    if (isEdit) {
      // raw = true, isAdmin = true (dohvati sirove podatke)
      post = await postService.findPostDetailsById(req.params.postId, true, true);
      postCategoryIds = post.categories?.map(c => c._id?.toString() || c.toString()) || [];
      postTagIds = post.tags?.map(t => t._id?.toString() || t.toString()) || [];
    }

    const seo = getAdminSeo(isEdit ? `Izmena posta: ${post?.title}` : 'Dodavanje novog posta');
    res.render('admin/blog/new-post', {
      post,
      experts,
      categories,
      tags,
      postCategoryIds,
      postTagIds,
      isEdit,
      seo,
    });
  } catch (error) {
    next(error);
  }
}

// Kreiranje novog posta (sa uploadom slike)
// Očekuje se da je `upload.single('imageFile')` primenjen pre ove akcije
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
      categories,
      tags,
      seoKeywords,
      faq,
      isIndexable,
    } = req.body;

    if (!title || !slug || !expert) {
      badRequest('Naslov, slug i autor su obavezni');
    }

    // Parsiranje JSON polja
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

    // Slika – ako je fajl uploadovan, čuvamo putanju; inače null
    let imageData = null;
    if (req.file) {
      imageData = {
        img: `/uploads/posts/${req.file.filename}`,
        imgDesc: req.body.imageAlt || title,
      };
    }

    const data = {
      title: title.trim(),
      slug: slug.toLowerCase().trim(),
      status: status || 'draft',
      expert,
      shortDescription: shortDescription || '',
      description: description || '',
      content: parsedContent,
      image: imageData,                       // sada koristi img i imgDesc
      categories: Array.isArray(categories) ? categories : (categories ? [categories] : []),
      tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
      seoKeywords: keywordsArray,
      faq: parsedFaq,
      isIndexable: isIndexable === 'on' || isIndexable === true,
    };

    await postService.createNewPost(data);
    req.session.flash = { type: 'success', message: 'Post je uspešno kreiran' };
    res.redirect('/admin/objave');
  } catch (error) {
    next(error);
  }
}

// Ažuriranje posta (sa uloadom slike)
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
      categories,
      tags,
      seoKeywords,
      faq,
      isIndexable,
      removeImage,
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

    let imageData = undefined; // undefined = ne menjamo sliku
    if (req.file) {
      // novi fajl uploadovan
      imageData = {
        img: `/uploads/posts/${req.file.filename}`,
        imgDesc: req.body.imageAlt || title,
      };
    } else if (removeImage === '1') {
      imageData = null; // brišemo sliku
    }

    const data = {
      title: title?.trim(),
      slug: slug?.toLowerCase().trim(),
      status,
      expert,
      shortDescription: shortDescription || '',
      description: description || '',
      content: parsedContent,
      image: imageData,
      categories: Array.isArray(categories) ? categories : (categories ? [categories] : []),
      tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
      seoKeywords: keywordsArray,
      faq: parsedFaq,
      isIndexable: isIndexable === 'on' || isIndexable === true,
    };

    await postService.updatePostById(id, data);
    req.session.flash = { type: 'success', message: 'Post je uspešno ažuriran' };
    res.redirect(`/admin/objave/detalji/${id}`);
  } catch (error) {
    next(error);
  }
}

// Pretraga – redirekcija
export async function searchPosts(req, res, next) {
  try {
    const { search, status, limit, page } = req.body;
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (status) query.append('status', status);
    if (limit) query.append('limit', limit);
    if (page) query.append('page', page);
    res.redirect(`/admin/objave?${query.toString()}`);
  } catch (error) {
    next(error);
  }
}

// Brisanje
export async function deletePost(req, res, next) {
  try {
    const { postId } = req.body;
    await postService.deletePostById(postId);
    req.session.flash = { type: 'success', message: 'Post je obrisan' };
    res.redirect('/admin/objave');
  } catch (error) {
    next(error);
  }
}