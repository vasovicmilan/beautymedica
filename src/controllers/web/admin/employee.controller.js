import * as employeeService from '../../../services/employee.service.js';
import * as userService from '../../../services/user.service.js';
import * as serviceService from '../../../services/service.service.js';
import { badRequest } from '../../../utils/error.util.js';

export async function listEmployees(req, res, next) {
  try {
    const { limit, page } = req.query;
    const result = await employeeService.findEmployees({
      limit: limit ? parseInt(limit) : 20,
      page: page ? parseInt(page) : 1,
      role: 'admin',
    });
    res.render('admin/employees/index', {
      employees: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (error) {
    next(error);
  }
}

export async function employeeDetail(req, res, next) {
  try {
    const { employeeId } = req.params;
    const employee = await employeeService.findEmployeeById(employeeId, 'admin');
    res.render('admin/employees/detail', { employee });
  } catch (error) {
    next(error);
  }
}

export async function addEmployeeForm(req, res, next) {
  try {
    // Dohvati sve korisnike koji još nisu zaposleni
    const allUsers = await userService.findAllUsers({ raw: true });
    // Filtriraj one koji već imaju employee profil (ne treba nam u repozitorijumu, možemo u servisu)
    // Pretpostavka: userService.findAllUsers vraća sve korisnike
    // Za jednostavnost, dohvatamo sve korisnike, a u šablonu ćemo preskočiti one sa profilom (treba nam lista employeeId-jeva)
    // Bolje: pozvati poseban servis koji vraća samo korisnike bez employee profila
    // Ali ovde ćemo dohvatiti sve employee ID-jeve iz repozitorijuma da ih izbacimo
    const employees = await employeeService.findEmployees({ role: 'admin', raw: true });
    const existingUserIds = employees.data.map(emp => emp.userId?.toString());
    const availableUsers = allUsers.filter(u => !existingUserIds.includes(u._id.toString()));
    // Dohvati sve usluge za checkbox
    const services = await serviceService.findAllServices({ raw: true });
    res.render('admin/employees/add', { users: availableUsers, services });
  } catch (error) {
    next(error);
  }
}

export async function editEmployeeForm(req, res, next) {
  try {
    const { employeeId } = req.params;
    const employee = await employeeService.findEmployeeById(employeeId, 'admin', true);
    const services = await serviceService.findAllServices({ raw: true });
    const employeeServiceIds = employee.services?.map(s => s._id?.toString() || s.toString()) || [];
    res.render('admin/employees/edit', { employee, services, employeeServiceIds });
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
    res.redirect('/admin/employees');
  } catch (error) {
    next(error);
  }
}

export async function updateEmployee(req, res, next) {
  try {
    const { id, services, isActive, notes, workingHours } = req.body;
    if (!id) badRequest('Nedostaje ID zaposlenog');
    const data = {
      services: Array.isArray(services) ? services : (services ? [services] : []),
      isActive: isActive === 'on' || isActive === true,
      notes: notes || null,
      workingHours: workingHours ? JSON.parse(workingHours) : [],
    };

    await employeeService.updateEmployeeById(id, data, req.user.id, 'admin');
    req.session.flash = { type: 'success', message: 'Zaposleni je uspešno ažuriran' };
    res.redirect(`/admin/employees/detalji/${id}`);
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
    res.redirect(`/admin/employees?${query.toString()}`);
  } catch (error) {
    next(error);
  }
}

export async function deleteEmployee(req, res, next) {
  try {
    const { employeeId } = req.body;
    await employeeService.deleteEmployeeById(employeeId);
    req.session.flash = { type: 'success', message: 'Zaposleni je obrisan' };
    res.redirect('/admin/employees');
  } catch (error) {
    next(error);
  }
}