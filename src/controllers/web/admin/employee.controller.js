import * as employeeService from '../../../services/employee.service.js';
import * as userService from '../../../services/user.service.js';
import * as serviceService from '../../../services/service.service.js';
import { badRequest } from '../../../utils/error.util.js';

function getAdminSeo(title) {
  return {
    title: `Admin - ${title}`,
    robots: 'noindex, follow',
    description: '',
  };
}

export async function listEmployees(req, res, next) {
  try {
    const { limit, page } = req.query;
    const result = await employeeService.findEmployees({
      limit: limit ? parseInt(limit) : 20,
      page: page ? parseInt(page) : 1,
      role: 'admin',
    });
    const seo = getAdminSeo('Zaposleni');
    res.render('admin/employee/employees', {
      employees: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      seo,
    });
  } catch (error) {
    next(error);
  }
}

export async function employeeDetail(req, res, next) {
  try {
    const { employeeId } = req.params;
    const employee = await employeeService.findEmployeeById(employeeId, 'admin');
    const seo = getAdminSeo(`Zaposleni: ${employee.korisnik.imePrezime}`);
    res.render('admin/employee/employee-details', { employee, seo });
  } catch (error) {
    next(error);
  }
}

export async function addEmployeeForm(req, res, next) {
  try {
    const allUsers = await userService.findAllUsers({ raw: true });
    const employees = await employeeService.findEmployees({ role: 'admin', raw: true });
    const existingUserIds = employees.data.map(emp => emp.userId?.toString());
    const availableUsers = allUsers.filter(u => !existingUserIds.includes(u._id.toString()));
    const services = await serviceService.findAllServices({ raw: true });
    const seo = getAdminSeo('Dodavanje zaposlenog');
    res.render('admin/employee/new-employee', { users: availableUsers, services, seo });
  } catch (error) {
    next(error);
  }
}

export async function editEmployeeForm(req, res, next) {
  try {
    const { employeeId } = req.params;
    const employee = await employeeService.findEmployeeById(employeeId, 'admin', true);
    
    // Fetch all users
    const allUsers = await userService.findAllUsers({ raw: true });
    // Fetch all employees to know which userIds are already taken
    const employees = await employeeService.findEmployees({ role: 'admin', raw: true });
    const takenUserIds = employees.data
      .map(emp => emp.userId?.toString())
      .filter(id => id && id !== employee.userId?._id?.toString()); // exclude current employee's userId
    
    const availableUsers = allUsers.filter(u => !takenUserIds.includes(u._id.toString()));
    
    const services = await serviceService.findAllServices({ raw: true });
    const employeeServiceIds = employee.services?.map(s => s._id?.toString() || s.toString()) || [];
    const seo = getAdminSeo(`Izmena zaposlenog: ${employee.userId?.firstName || ''} ${employee.userId?.lastName || ''}`);
    
    res.render('admin/employee/new-employee', {
      employee,
      users: availableUsers,
      services,
      employeeServiceIds,
      seo,
    });
  } catch (error) {
    next(error);
  }
}

export async function createEmployee(req, res, next) {
  try {
    const { userId, services, isActive, notes, workingHours } = req.body;
    if (!userId) badRequest('Nedostaje korisnik');
    const data = {
      userId,
      services: Array.isArray(services) ? services : (services ? [services] : []),
      isActive: isActive === 'on' || isActive === true,
      notes: notes || null,
      workingHours: workingHours ? JSON.parse(workingHours) : [],
    };
    await employeeService.createNewEmployee(data);
    req.session.flash = { type: 'success', message: 'Zaposleni je uspešno dodat' };
    res.redirect('/admin/zaposleni');
  } catch (error) {
    next(error);
  }
}

export async function updateEmployee(req, res, next) {
  try {
    const { id, userId, services, isActive, notes, workingHours } = req.body;
    if (!id) badRequest('Nedostaje ID zaposlenog');
    
    const data = {
      userId,                         // may be changed
      services: Array.isArray(services) ? services : (services ? [services] : []),
      isActive: isActive === 'on' || isActive === true,
      notes: notes || null,
      workingHours: workingHours ? JSON.parse(workingHours) : [],
    };
    
    await employeeService.updateEmployeeById(id, data, req.user.id, 'admin');
    req.session.flash = { type: 'success', message: 'Zaposleni je uspešno ažuriran' };
    res.redirect(`/admin/zaposleni/detalji/${id}`);
  } catch (error) {
    next(error);
  }
}

export async function searchEmployees(req, res, next) {
  try {
    const { limit, page } = req.body;
    const query = new URLSearchParams();
    if (limit) query.append('limit', limit);
    if (page) query.append('page', page);
    res.redirect(`/admin/zaposleni?${query.toString()}`);
  } catch (error) {
    next(error);
  }
}

export async function deleteEmployee(req, res, next) {
  try {
    const { employeeId } = req.body;
    await employeeService.deleteEmployeeById(employeeId);
    req.session.flash = { type: 'success', message: 'Zaposleni je obrisan' };
    res.redirect('/admin/zaposleni');
  } catch (error) {
    next(error);
  }
}