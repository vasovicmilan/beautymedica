import * as serviceService from '../../../services/service.service.js';
import * as categoryService from '../../../services/category.service.js';
import * as tagService from '../../../services/tag.service.js';
import * as employeeService from '../../../services/employee.service.js';
import { badRequest } from '../../../utils/error.util.js';

// Helper for admin SEO (prevents indexing)
function getAdminSeo(title) {
  return {
    title: `Admin - ${title}`,
    robots: 'noindex, follow',
    description: '',
  };
}

export async function listServices(req, res, next) {
  try {
    const { search, limit, page } = req.query;
    const result = await serviceService.findServices({
      search,
      limit: limit ? parseInt(limit) : 20,
      page: page ? parseInt(page) : 1,
      isAdmin: true,
    });
    const seo = getAdminSeo('Usluge');
    res.render('admin/service/services', {
      services: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      search,
      seo,
    });
  } catch (error) {
    next(error);
  }
}

export async function serviceDetail(req, res, next) {
  try {
    const { serviceId } = req.params;
    const service = await serviceService.findServiceById(serviceId, true);
    const seo = getAdminSeo(`Usluga: ${service.name}`);
    res.render('admin/service/service-details', { service, seo });
  } catch (error) {
    next(error);
  }
}

export async function addServiceForm(req, res, next) {
  try {
    const categories = await categoryService.findAllCategories({ isAdmin: true, raw: true });
    const tags = await tagService.findAllTags({ isAdmin: true, raw: true });
    const employeesResult = await employeeService.findEmployees({ role: 'admin', raw: true });
    const employees = employeesResult.data || [];
    const seo = getAdminSeo('Dodavanje usluge');
    res.render('admin/service/new-service', {
      categories, tags, employees, seo, serviceCategoryIds: [],
      serviceTagIds: [],
      serviceEmployeeIds: [],
    });
  } catch (error) {
    next(error);
  }
}

export async function editServiceForm(req, res, next) {
  try {
    const { serviceId } = req.params;
    const service = await serviceService.findServiceById(serviceId, true, true); // raw podaci
    const categories = await categoryService.findAllCategories({ isAdmin: true, raw: true });
    const tags = await tagService.findAllTags({ isAdmin: true, raw: true });
    const employeesResult = await employeeService.findEmployees({ role: 'admin', raw: true });
    const employees = employeesResult.data || [];
    const serviceCategoryIds = service.categories?.map(c => c._id?.toString() || c.toString()) || [];
    const serviceTagIds = service.tags?.map(t => t._id?.toString() || t.toString()) || [];
    const serviceEmployeeIds = service.employees?.map(e => e._id?.toString() || e.toString()) || [];
    const seo = getAdminSeo(`Izmena usluge: ${service.name}`);
    res.render('admin/service/new-service', {
      service,
      categories,
      tags,
      employees,
      serviceCategoryIds,
      serviceTagIds,
      serviceEmployeeIds,
      seo,
    });
  } catch (error) {
    next(error);
  }
}

export async function createService(req, res, next) {
  try {
    const {
      name,
      slug,
      type,
      shortDescription,
      longDescription,
      imageUrl,
      imageAlt,
      categories,
      tags,
      employees,
      seoKeywords,
      highlight,
      ctaText,
      features,
      packages,
      comparisonColumns,
      comparisonTable,
      faq,
      isActive,
    } = req.body;

    if (!name || !slug || !type) {
      badRequest('Naziv, slug i tip usluge su obavezni');
    }

    let parsedFeatures = [];
    if (features) {
      try {
        parsedFeatures = typeof features === 'string' ? JSON.parse(features) : features;
      } catch (e) {
        badRequest('Neispravan format karakteristika');
      }
    }

    let parsedPackages = [];
    if (packages) {
      try {
        parsedPackages = typeof packages === 'string' ? JSON.parse(packages) : packages;
      } catch (e) {
        badRequest('Neispravan format paketa');
      }
    }

    let parsedComparisonTable = [];
    if (comparisonTable) {
      try {
        parsedComparisonTable = typeof comparisonTable === 'string' ? JSON.parse(comparisonTable) : comparisonTable;
      } catch (e) {
        badRequest('Neispravan format tabele poređenja');
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

    let comparisonCols = [];
    if (comparisonColumns) {
      comparisonCols = Array.isArray(comparisonColumns) ? comparisonColumns : [comparisonColumns];
    }

    let keywordsArray = [];
    if (seoKeywords) {
      if (Array.isArray(seoKeywords)) keywordsArray = seoKeywords;
      else if (typeof seoKeywords === 'string') keywordsArray = seoKeywords.split(',').map(k => k.trim());
    }

    const data = {
      name: name.trim(),
      slug: slug.toLowerCase().trim(),
      type,
      shortDescription: shortDescription || '',
      longDescription: longDescription || '',
      image: imageUrl ? { img: imageUrl.trim(), imgDesc: imageAlt?.trim() || name } : null,
      categories: Array.isArray(categories) ? categories : (categories ? [categories] : []),
      tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
      employees: Array.isArray(employees) ? employees : (employees ? [employees] : []),
      seoKeywords: keywordsArray,
      highlight: highlight === 'on' || highlight === true,
      ctaText: ctaText || 'Zakaži konsultaciju',
      features: parsedFeatures,
      packages: parsedPackages,
      comparisonColumns: comparisonCols,
      comparisonTable: parsedComparisonTable,
      faq: parsedFaq,
      isActive: isActive === 'on' || isActive === true,
    };

    await serviceService.createNewService(data);
    req.session.flash = { type: 'success', message: 'Usluga je uspešno kreirana' };
    res.redirect('/admin/usluge');
  } catch (error) {
    next(error);
  }
}

export async function updateService(req, res, next) {
  try {
    const {
      id,
      name,
      slug,
      type,
      shortDescription,
      longDescription,
      imageUrl,
      imageAlt,
      categories,
      tags,
      employees,
      seoKeywords,
      highlight,
      ctaText,
      features,
      packages,
      comparisonColumns,
      comparisonTable,
      faq,
      isActive,
    } = req.body;

    if (!id) badRequest('Nedostaje ID usluge');

    let parsedFeatures = [];
    if (features) {
      try {
        parsedFeatures = typeof features === 'string' ? JSON.parse(features) : features;
      } catch (e) {
        badRequest('Neispravan format karakteristika');
      }
    }

    let parsedPackages = [];
    if (packages) {
      try {
        parsedPackages = typeof packages === 'string' ? JSON.parse(packages) : packages;
      } catch (e) {
        badRequest('Neispravan format paketa');
      }
    }

    let parsedComparisonTable = [];
    if (comparisonTable) {
      try {
        parsedComparisonTable = typeof comparisonTable === 'string' ? JSON.parse(comparisonTable) : comparisonTable;
      } catch (e) {
        badRequest('Neispravan format tabele poređenja');
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

    let comparisonCols = [];
    if (comparisonColumns) {
      comparisonCols = Array.isArray(comparisonColumns) ? comparisonColumns : [comparisonColumns];
    }

    let keywordsArray = [];
    if (seoKeywords) {
      if (Array.isArray(seoKeywords)) keywordsArray = seoKeywords;
      else if (typeof seoKeywords === 'string') keywordsArray = seoKeywords.split(',').map(k => k.trim());
    }

    const data = {
      name: name?.trim(),
      slug: slug?.toLowerCase().trim(),
      type,
      shortDescription: shortDescription || '',
      longDescription: longDescription || '',
      image: imageUrl ? { img: imageUrl.trim(), imgDesc: imageAlt?.trim() || name } : null,
      categories: Array.isArray(categories) ? categories : (categories ? [categories] : []),
      tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
      employees: Array.isArray(employees) ? employees : (employees ? [employees] : []),
      seoKeywords: keywordsArray,
      highlight: highlight === 'on' || highlight === true,
      ctaText: ctaText || 'Zakaži konsultaciju',
      features: parsedFeatures,
      packages: parsedPackages,
      comparisonColumns: comparisonCols,
      comparisonTable: parsedComparisonTable,
      faq: parsedFaq,
      isActive: isActive === 'on' || isActive === true,
    };

    await serviceService.updateServiceById(id, data);
    req.session.flash = { type: 'success', message: 'Usluga je uspešno ažurirana' };
    res.redirect(`/admin/usluge/detalji/${id}`);
  } catch (error) {
    next(error);
  }
}

export async function searchServices(req, res, next) {
  try {
    const { search, limit, page } = req.body;
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (limit) query.append('limit', limit);
    if (page) query.append('page', page);
    res.redirect(`/admin/usluge?${query.toString()}`);
  } catch (error) {
    next(error);
  }
}

export async function deleteService(req, res, next) {
  try {
    const { id } = req.body;
    if (!id) badRequest('Nedostaje ID usluge');
    await serviceService.deleteServiceById(id);
    req.session.flash = { type: 'success', message: 'Usluga je obrisana' };
    res.redirect('/admin/usluge');
  } catch (error) {
    next(error);
  }
}