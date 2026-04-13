import Employee from "../models/employee.model.js";
import { resolveLimit, resolveSkip } from "../utils/pagination.util.js";
import { buildEmployeeFilter } from "./filters/employee.filter.js";

export async function findEmployees({ limit: rawLimit, page: rawPage = 1, isAdmin = false, populateFields = null } = {}) {
  const limit  = resolveLimit(rawLimit);
  const skip   = resolveSkip(rawPage, limit);
  const filter = buildEmployeeFilter({ isAdmin });

  let query = Employee.find(filter)
                      .sort({ createdAt: -1 })
                      .skip(skip)
                      .limit(limit)
                      .lean();

  if (populateFields) {
    query = query.populate(populateFields);
  }

  const [data, total] = await Promise.all([
    query,
    Employee.countDocuments(filter),
  ]);

  return { data, total, page: parseInt(rawPage, 10) || 1, limit };
}

export async function findAllEmployees() {
  return Employee.find()
                 .sort({ createdAt: -1 })
                 .lean();
}

export async function findEmployeeById(id, populateFields = null) {
  let query = Employee.findById(id).lean();
  if (populateFields) {
    query = query.populate(populateFields);
  }
  return query;
}

export async function findEmployeeByUserId(userId) {
  return Employee.findOne({ userId }).lean();
}

export async function createEmployee(data) {
  const employee = new Employee(data);
  return employee.save();
}

export async function updateEmployeeById(id, data) {
  return Employee.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true }
  ).lean();
}

export async function deleteEmployeeById(id) {
  return Employee.findByIdAndDelete(id).lean();
}