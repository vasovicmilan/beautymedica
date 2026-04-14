import * as expertService from '../../../services/expert.service.js';
import { badRequest } from '../../../utils/error.util.js';

export async function listExperts(req, res, next) {
  try {
    const { search, limit, page } = req.query;
    const result = await expertService.findExperts({
      search,
      limit: limit ? parseInt(limit) : 20,
      page: page ? parseInt(page) : 1,
      role: 'admin',
    });
    res.render('admin/experts/index', {
      experts: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      search,
    });
  } catch (error) {
    next(error);
  }
}

export async function expertDetail(req, res, next) {
  try {
    const { expertId } = req.params;
    const expert = await expertService.findExpertById(expertId, 'admin');
    res.render('admin/experts/detail', { expert });
  } catch (error) {
    next(error);
  }
}

export async function addExpertForm(req, res, next) {
  try {
    res.render('admin/experts/add');
  } catch (error) {
    next(error);
  }
}

export async function editExpertForm(req, res, next) {
  try {
    const { expertId } = req.params;
    const expert = await expertService.findExpertById(expertId, 'admin', true); // raw podaci
    res.render('admin/experts/edit', { expert });
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
        url: imageUrl.trim(),
        alt: imageAlt?.trim() || `${firstName} ${lastName}`,
      } : null,
      isActive: isActive === 'on' || isActive === true,
    };

    await expertService.createExpert(data);
    req.session.flash = { type: 'success', message: 'Stručnjak je uspešno kreiran' };
    res.redirect('/admin/experts');
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
        url: imageUrl.trim(),
        alt: imageAlt?.trim() || `${firstName} ${lastName}`,
      } : null,
      isActive: isActive === 'on' || isActive === true,
    };

    await expertService.updateExpertById(id, data);
    req.session.flash = { type: 'success', message: 'Stručnjak je uspešno ažuriran' };
    res.redirect(`/admin/experts/detalji/${id}`);
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
    res.redirect(`/admin/experts?${query.toString()}`);
  } catch (error) {
    next(error);
  }
}

export async function deleteExpert(req, res, next) {
  try {
    const { expertId } = req.body;
    await expertService.deleteExpertById(expertId);
    req.session.flash = { type: 'success', message: 'Stručnjak je obrisan' };
    res.redirect('/admin/experts');
  } catch (error) {
    next(error);
  }
}