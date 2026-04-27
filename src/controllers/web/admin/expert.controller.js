// src/controllers/web/admin/expert.controller.js
import * as expertService from '../../../services/expert.service.js';
import { badRequest } from '../../../utils/error.util.js';

function getAdminSeo(title) {
  return {
    title: `Admin - ${title}`,
    robots: 'noindex, follow',
    description: '',
  };
}

export async function listExperts(req, res, next) {
  try {
    const { search, limit, page } = req.query;
    const result = await expertService.findExperts({
      search,
      limit: limit ? parseInt(limit) : 20,
      page: page ? parseInt(page) : 1,
      role: 'admin',
    });
    const seo = getAdminSeo('Stručnjaci');
    res.render('admin/expert/experts', {
      experts: result.data,
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

export async function expertDetail(req, res, next) {
  try {
    const { expertId } = req.params;
    const expert = await expertService.findExpertById(expertId, 'admin');
    const seo = getAdminSeo(`Stručnjak: ${expert.imePrezime}`);
    res.render('admin/expert/expert-details', { expert, seo });
  } catch (error) {
    next(error);
  }
}

export async function addExpertForm(req, res, next) {
  try {
    const seo = getAdminSeo('Dodavanje stručnjaka');
    res.render('admin/expert/new-expert', { seo });
  } catch (error) {
    next(error);
  }
}

export async function editExpertForm(req, res, next) {
  try {
    const { expertId } = req.params;
    const expert = await expertService.findExpertById(expertId, 'admin', true);
    const seo = getAdminSeo(`Izmena stručnjaka: ${expert.firstName} ${expert.lastName}`);
    res.render('admin/expert/new-expert', { expert, seo });
  } catch (error) {
    next(error);
  }
}

export async function createExpert(req, res, next) {
  try {
    const {
      firstName,
      lastName,
      title,
      slug,
      bio,
      imageUrl,
      imageAlt,
      isActive,
    } = req.body;

    if (!firstName || !lastName || !title || !slug) {
      badRequest('Ime, prezime, titula i slug su obavezni');
    }

    const data = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      title: title.trim(),
      slug: slug.toLowerCase().trim(),
      bio: bio || null,
      image: imageUrl ? {
        img: imageUrl.trim(),
        imgDesc: imageAlt?.trim() || `${firstName} ${lastName}`,
      } : null,
      isActive: isActive === 'on' || isActive === true,
    };

    await expertService.createExpert(data);
    req.session.flash = { type: 'success', message: 'Stručnjak je uspešno kreiran' };
    res.redirect('/admin/eksperti');
  } catch (error) {
    next(error);
  }
}

export async function updateExpert(req, res, next) {
  try {
    const {
      id,
      firstName,
      lastName,
      title,
      slug,
      bio,
      imageUrl,
      imageAlt,
      isActive,
    } = req.body;

    if (!id) badRequest('Nedostaje ID stručnjaka');

    const data = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      title: title.trim(),
      slug: slug.toLowerCase().trim(),
      bio: bio || null,
      image: imageUrl ? {
        img: imageUrl.trim(),
        imgDesc: imageAlt?.trim() || `${firstName} ${lastName}`,
      } : null,
      isActive: isActive === 'on' || isActive === true,
    };

    await expertService.updateExpertById(id, data);
    req.session.flash = { type: 'success', message: 'Stručnjak je uspešno ažuriran' };
    res.redirect(`/admin/eksperti/detalji/${id}`);
  } catch (error) {
    next(error);
  }
}

export async function searchExperts(req, res, next) {
  try {
    const { search, limit, page } = req.body;
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (limit) query.append('limit', limit);
    if (page) query.append('page', page);
    res.redirect(`/admin/eksperti?${query.toString()}`);
  } catch (error) {
    next(error);
  }
}

export async function deleteExpert(req, res, next) {
  try {
    const { expertId } = req.body;
    if (!expertId) badRequest('Nedostaje ID stručnjaka');
    await expertService.deleteExpertById(expertId);
    req.session.flash = { type: 'success', message: 'Stručnjak je obrisan' };
    res.redirect('/admin/eksperti');
  } catch (error) {
    next(error);
  }
}