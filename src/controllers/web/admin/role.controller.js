import * as roleService from '../../../services/role.service.js';
import { badRequest } from '../../../utils/error.util.js';

export async function listRoles(req, res, next) {
  try {
    const { search, limit, page } = req.query;
    const result = await roleService.findRoles(
      search,
      limit ? parseInt(limit) : 20,
      page ? parseInt(page) : 1
    );
    res.render('admin/roles/index', {
      roles: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      search,
    });
  } catch (error) {
    next(error);
  }
}

export async function roleDetail(req, res, next) {
  try {
    const { roleId } = req.params;
    const role = await roleService.findRoleById(roleId);
    res.render('admin/roles/detail', { role });
  } catch (error) {
    next(error);
  }
}

export async function addRoleForm(req, res, next) {
  try {
    res.render('admin/roles/add');
  } catch (error) {
    next(error);
  }
}

export async function editRoleForm(req, res, next) {
  try {
    const { roleId } = req.params;
    const role = await roleService.findRoleById(roleId, true);
    res.render('admin/roles/edit', { role });
  } catch (error) {
    next(error);
  }
}

export async function createRole(req, res, next) {
  try {
    const { name, permissions } = req.body;
    if (!name) badRequest('Naziv uloge je obavezan');
    // permissions može biti niz ili pojedinačna vrednost
    const perms = Array.isArray(permissions) ? permissions : (permissions ? [permissions] : []);
    const data = { name, permissions: perms };
    await roleService.createNewRole(data);
    req.session.flash = { type: 'success', message: 'Uloga je uspešno kreirana' };
    res.redirect('/admin/roles');
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
    res.redirect(`/admin/roles/detalji/${id}`);
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
    res.redirect(`/admin/roles?${query.toString()}`);
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
    res.redirect('/admin/roles');
  } catch (error) {
    next(error);
  }
}