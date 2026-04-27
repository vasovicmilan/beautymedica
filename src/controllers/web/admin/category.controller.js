import * as categoryService from '../../../services/category.service.js';
import { badRequest } from '../../../utils/error.util.js';

/**
 * Prikaz svih kategorija (tabela)
 */
export async function listCategories(req, res, next) {
  try {
    const { search, limit, page, domain, parent } = req.query;
    const result = await categoryService.findCategories({
      search,
      limit: limit ? parseInt(limit) : 20,
      page: page ? parseInt(page) : 1,
      role: 'admin',
      domain,
      parent: parent === 'null' ? null : parent,
    });
    const seo = {
      title: 'Admin panel – Kategorije',
      robots: 'noindex, follow',
      description: 'Upravljanje kategorijama usluga i bloga',
    };
    res.render('admin/taxonomy/categories', {
      categories: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      search,
      domain,
      parent,
      seo
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
}

/**
 * Prikaz detalja kategorije
 */
export async function categoryDetail(req, res, next) {
  try {
    const { categoryId } = req.params;
    const category = await categoryService.findCategoryById(categoryId, 'admin');
        const seo = {
      title: `Admin - Kategorija: ${category.osnovno.naziv}`,
      robots: 'noindex, follow',
    };
    res.render('admin/taxonomy/category-details', { category, seo });
  } catch (error) {
    next(error);
  }
}

/**
 * Forma za dodavanje nove kategorije
 */
export async function addCategoryForm(req, res, next) {
  try {
    // Dohvati sve roditeljske kategorije (opciono)
    const parents = await categoryService.findAllCategories({ isAdmin: true, raw: true });
    const seo = {
      title: 'Admin - Dodavanje kategorije',
      robots: 'noindex, follow',
    };
    res.render('admin/taxonomy/new-category', { parents, seo });
  } catch (error) {
    next(error);
  }
}

/**
 * Forma za izmenu kategorije
 */
export async function editCategoryForm(req, res, next) {
  try {
    const { categoryId } = req.params;
    const category = await categoryService.findCategoryById(categoryId, 'admin');
    const parents = await categoryService.findAllCategories({ isAdmin: true, raw: true });
    const seo = {
      title: `Admin - Izmena kategorije: ${category.osnovno.naziv}`,
      robots: 'noindex, follow',
    };
    res.render('admin/taxonomy/new-category', { category, parents, seo });
  } catch (error) {
    next(error);
  }
}

/**
 * Kreiranje nove kategorije (POST)
 */
export async function createCategory(req, res, next) {
  try {
    const { name, slug, domain, parent, shortDescription, longDescription, featureImageUrl, featureImageDesc, isIndexable, metaPriority, metaIsActive } = req.body;
    if (!name || !slug || !domain) badRequest('Naziv, slug i domen su obavezni');
    const data = {
      name,
      slug,
      domain,
      parent: parent === 'null' || !parent ? null : parent,
      shortDescription,
      longDescription,
      featureImage: featureImageUrl ? { img: featureImageUrl, imgDesc: featureImageDesc } : undefined,
      isIndexable: isIndexable === 'on' || isIndexable === true,
      meta: {
        priority: parseInt(metaPriority) || 0,
        isActive: metaIsActive === 'on' || metaIsActive === true,
      },
    };
    await categoryService.createCategory(data);
    req.session.flash = { type: 'success', message: 'Kategorija je uspešno kreirana' };
    res.redirect('/admin/kategorije');
  } catch (error) {
    next(error);
  }
}

/**
 * Izmena kategorije (PUT)
 */
export async function updateCategory(req, res, next) {
  try {
    const { id, name, slug, domain, parent, shortDescription, longDescription, featureImageUrl, featureImageDesc, isIndexable, metaPriority, metaIsActive } = req.body;
    if (!id) badRequest('Nedostaje ID kategorije');
    const data = {
      name,
      slug,
      domain,
      parent: parent === 'null' || !parent ? null : parent,
      shortDescription,
      longDescription,
      featureImage: featureImageUrl ? { img: featureImageUrl, imgDesc: featureImageDesc } : undefined,
      isIndexable: isIndexable === 'on' || isIndexable === true,
      meta: {
        priority: parseInt(metaPriority) || 0,
        isActive: metaIsActive === 'on' || metaIsActive === true,
      },
    };
    await categoryService.updateCategoryById(id, data);
    req.session.flash = { type: 'success', message: 'Kategorija je uspešno ažurirana' };
    res.redirect(`/admin/kategorije/detalji/${id}`);
  } catch (error) {
    next(error);
  }
}

/**
 * Pretraga kategorija (POST) – redirekcija na GET sa parametrima
 */
export async function searchCategories(req, res, next) {
  try {
    const { search, domain, parent, limit, page } = req.body;
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (domain) query.append('domain', domain);
    if (parent) query.append('parent', parent);
    if (limit) query.append('limit', limit);
    if (page) query.append('page', page);
    res.redirect(`/admin/kategorije?${query.toString()}`);
  } catch (error) {
    next(error);
  }
}

/**
 * Brisanje kategorije (DELETE)
 */
export async function deleteCategory(req, res, next) {
  try {
    const { categoryId } = req.body;
    await categoryService.deleteCategoryById(categoryId);
    req.session.flash = { type: 'success', message: 'Kategorija je obrisana' };
    res.redirect('/admin/kategorije');
  } catch (error) {
    next(error);
  }
}