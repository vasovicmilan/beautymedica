import * as userService from '../../../services/user.service.js';
import * as roleService from '../../../services/role.service.js';
import { badRequest } from '../../../utils/error.util.js';

// Helper za SEO na admin stranicama (ne indeksira se)
function getAdminSeo(title) {
  return {
    title: `Admin - ${title}`,
    robots: 'noindex, follow',
    description: '',
  };
}

export async function listUsers(req, res, next) {
  try {
    const { search, limit, page } = req.query;
    const result = await userService.findUsers(
      search,
      limit ? parseInt(limit) : 20,
      page ? parseInt(page) : 1
    );
    const seo = getAdminSeo('Korisnici');
    res.render('admin/user/users', {
      users: result.data,
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

export async function userDetail(req, res, next) {
  try {
    const { userId } = req.params;
    const user = await userService.findUserById(userId);
    const seo = getAdminSeo(`Korisnik: ${user.imePrezime}`);
    res.render('admin/user/user-details', { user, seo });
  } catch (error) {
    next(error);
  }
}

export async function editUserForm(req, res, next) {
  try {
    const { userId } = req.params;
    const user = await userService.findUserById(userId, true); // raw
    const roles = await roleService.findAllRoles({ raw: true });
    const seo = getAdminSeo(`Izmena korisnika: ${user.firstName} ${user.lastName}`);
    res.render('admin/user/edit-user', { user, roles, seo });
  } catch (error) {
    next(error);
  }
}

export async function updateUser(req, res, next) {
  try {
    const { id, firstName, lastName, email, phone, roleId, isActive, acceptedTerms, avatar } = req.body;
    if (!id) badRequest('Nedostaje ID korisnika');

    const data = {
      firstName,
      lastName,
      email: email?.toLowerCase().trim(),
      phone: phone || null,
      roleId,
      acceptedTerms: acceptedTerms === 'on' || acceptedTerms === true,
      avatar: avatar || null,
      isActive: isActive === 'on' || isActive === true,
    };

    await userService.updateUserById(id, data);
    req.session.flash = { type: 'success', message: 'Korisnik je uspešno ažuriran' };
    res.redirect(`/admin/korisnici/detalji/${id}`);
  } catch (error) {
    next(error);
  }
}

export async function searchUsers(req, res, next) {
  try {
    const { search, limit, page } = req.body;
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (limit) query.append('limit', limit);
    if (page) query.append('page', page);
    res.redirect(`/admin/korisnici?${query.toString()}`);
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const { userId } = req.body;
    await userService.deleteUserById(userId);
    req.session.flash = { type: 'success', message: 'Korisnik je obrisan' };
    res.redirect('/admin/korisnici');
  } catch (error) {
    next(error);
  }
}