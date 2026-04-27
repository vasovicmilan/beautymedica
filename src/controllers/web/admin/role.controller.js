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

export async function listRoles(req, res, next) {
  try {
    const { search, limit, page } = req.query;
    const result = await roleService.findRoles(
      search,
      limit ? parseInt(limit) : 20,
      page ? parseInt(page) : 1
    );
    const seo = getAdminSeo('Uloge');
    res.render('admin/role/roles', {
      roles: result.data,
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

export async function roleDetail(req, res, next) {
  try {
    const { roleId } = req.params;
    const role = await roleService.findRoleById(roleId);
    const seo = getAdminSeo(`Uloga: ${role.naziv}`);
    res.render('admin/role/role-details', { role, seo });
  } catch (error) {
    next(error);
  }
}

export async function addRoleForm(req, res, next) {
  try {
    const seo = getAdminSeo('Dodavanje uloge');
    res.render('admin/role/new-role', { seo });
  } catch (error) {
    next(error);
  }
}

export async function editRoleForm(req, res, next) {
  try {
    const { roleId } = req.params;
    const role = await roleService.findRoleById(roleId, true); // raw podaci
    const seo = getAdminSeo(`Izmena uloge: ${role.name}`);
    res.render('admin/role/new-role', { role, seo });
  } catch (error) {
    next(error);
  }
}

export async function createRole(req, res, next) {
  try {
    const { name, permissions } = req.body;
    if (!name) badRequest('Naziv uloge je obavezan');
    const perms = Array.isArray(permissions) ? permissions : (permissions ? [permissions] : []);
    const data = { name, permissions: perms };
    await roleService.createNewRole(data);
    req.session.flash = { type: 'success', message: 'Uloga je uspešno kreirana' };
    res.redirect('/admin/uloge');
  } catch (error) {
    next(error);
  }
}

export async function updateRole(req, res, next) {
  try {
    const { id, permissions } = req.body;
    if (!id) badRequest('Nedostaje ID uloge');
    const perms = Array.isArray(permissions) ? permissions : (permissions ? [permissions] : []);
    const data = { permissions: perms };
    await roleService.updateRoleById(id, data);
    req.session.flash = { type: 'success', message: 'Uloga je uspešno ažurirana' };
    res.redirect(`/admin/uloge/detalji/${id}`);
  } catch (error) {
    next(error);
  }
}

export async function searchRoles(req, res, next) {
  try {
    const { search, limit, page } = req.body;
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (limit) query.append('limit', limit);
    if (page) query.append('page', page);
    res.redirect(`/admin/uloge?${query.toString()}`);
  } catch (error) {
    next(error);
  }
}

export async function deleteRole(req, res, next) {
  try {
    const { id } = req.body;
    if (!id) badRequest('Nedostaje ID uloge');
    await roleService.deleteRoleById(id);
    req.session.flash = { type: 'success', message: 'Uloga je obrisana' };
    res.redirect('/admin/uloge');
  } catch (error) {
    next(error);
  }
}