import * as tagService from '../../../services/tag.service.js';
import { badRequest } from '../../../utils/error.util.js';

const TAG_DOMAINS = [
  { value: 'service', label: 'Usluga' },
  { value: 'post', label: 'Blog' },
];

const TAG_TYPES = [
  { value: 'body_part', label: 'Deo tela' },
  { value: 'goal', label: 'Cilj' },
  { value: 'technology', label: 'Tehnologija' },
  { value: 'intensity', label: 'Intenzitet' },
  { value: 'duration', label: 'Trajanje' },
  { value: 'custom', label: 'Prilagođeno' },
];

export async function listTags(req, res, next) {
  try {
    const { search, limit, page, domain, type } = req.query;
    const result = await tagService.findTags({
      search,
      limit: limit ? parseInt(limit) : 20,
      page: page ? parseInt(page) : 1,
      role: 'admin',
      domain,
      type,
    });
    res.render('admin/tags/index', {
      tags: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      search,
      domain,
      type,
      tagDomains: TAG_DOMAINS,
      tagTypes: TAG_TYPES,
    });
  } catch (error) {
    next(error);
  }
}

export async function tagDetail(req, res, next) {
  try {
    const { tagId } = req.params;
    const tag = await tagService.findTagById(tagId, 'admin');
    res.render('admin/tags/detail', { tag });
  } catch (error) {
    next(error);
  }
}

export async function addTagForm(req, res, next) {
  try {
    res.render('admin/tags/add', {
      tagDomains: TAG_DOMAINS,
      tagTypes: TAG_TYPES,
    });
  } catch (error) {
    next(error);
  }
}

export async function editTagForm(req, res, next) {
  try {
    const { tagId } = req.params;
    const tag = await tagService.findTagById(tagId, 'admin', true);
    res.render('admin/tags/edit', {
      tag,
      tagDomains: TAG_DOMAINS,
      tagTypes: TAG_TYPES,
    });
  } catch (error) {
    next(error);
  }
}

export async function createTag(req, res, next) {
  try {
    const {
      name,
      slug,
      domain,
      type,
      isIndexable,
      shortDescription,
      longDescription,
      metaPriority,
      metaIsActive,
    } = req.body;

    if (!name || !slug || !domain || !type) {
      badRequest('Naziv, slug, domen i tip su obavezni');
    }

    const data = {
      name: name.trim(),
      slug: slug.toLowerCase().trim(),
      domain,
      type,
      isIndexable: isIndexable === 'on' || isIndexable === true,
      shortDescription: shortDescription || null,
      longDescription: longDescription || null,
      meta: {
        priority: parseInt(metaPriority) || 0,
        isActive: metaIsActive === 'on' || metaIsActive === true,
      },
    };

    await tagService.createTag(data);
    req.session.flash = { type: 'success', message: 'Tag je uspešno kreiran' };
    res.redirect('/admin/tags');
  } catch (error) {
    next(error);
  }
}

export async function updateTag(req, res, next) {
  try {
    const {
      id,
      name,
      slug,
      domain,
      type,
      isIndexable,
      shortDescription,
      longDescription,
      metaPriority,
      metaIsActive,
    } = req.body;

    if (!id) badRequest('Nedostaje ID taga');

    const data = {
      name: name?.trim(),
      slug: slug?.toLowerCase().trim(),
      domain,
      type,
      isIndexable: isIndexable === 'on' || isIndexable === true,
      shortDescription: shortDescription || null,
      longDescription: longDescription || null,
      meta: {
        priority: parseInt(metaPriority) || 0,
        isActive: metaIsActive === 'on' || metaIsActive === true,
      },
    };

    await tagService.updateTagById(id, data);
    req.session.flash = { type: 'success', message: 'Tag je uspešno ažuriran' };
    res.redirect(`/admin/tags/detalji/${id}`);
  } catch (error) {
    next(error);
  }
}

export async function searchTags(req, res, next) {
  try {
    const { search, domain, type, limit, page } = req.body;
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (domain) query.append('domain', domain);
    if (type) query.append('type', type);
    if (limit) query.append('limit', limit);
    if (page) query.append('page', page);
    res.redirect(`/admin/tags?${query.toString()}`);
  } catch (error) {
    next(error);
  }
}

export async function deleteTag(req, res, next) {
  try {
    const { tagId } = req.body;
    await tagService.deleteTagById(tagId);
    req.session.flash = { type: 'success', message: 'Tag je obrisan' };
    res.redirect('/admin/tags');
  } catch (error) {
    next(error);
  }
}