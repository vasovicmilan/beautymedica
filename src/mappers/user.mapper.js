import { formatDateTime, formatDate } from '../utils/date.time.util.js';

function getFullName(user) {
  return `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Nepoznato";
}

function getRoleName(user) {
  if (user.roleId && typeof user.roleId === "object") {
    const roleMap = {
      admin: "Administrator",
      employee: "Zaposleni",
      user: "Korisnik",
    };
    return roleMap[user.roleId.name] || user.roleId.name || "Nepoznato";
  }
  return "Nepoznato";
}

function translateActive(isActive) {
  return isActive ? "Aktivan" : "Neaktivan";
}

export function mapUserForAdminShort(user) {
  return {
    id: user._id.toString(),
    imePrezime: getFullName(user),
    email: user.email,
    uloga: getRoleName(user),
    aktivan: translateActive(user.isActive),
    poslednjiLogin: user.lastLoginAt ? formatDate(user.lastLoginAt) : "Nikada",
    registrovan: formatDate(user.createdAt),
  };
}

export function mapUserForAdminDetail(user) {
  return {
    id: user._id.toString(),
    imePrezime: getFullName(user),
    email: user.email,
    telefon: user.phone || null,
    googleId: user.googleId,
    uloga: getRoleName(user),
    avatar: user.avatar || null,
    aktivan: translateActive(user.isActive),
    prihvaceniUslovi: user.acceptedTerms ? "Da" : "Ne",
    poslednjiLogin: user.lastLoginAt ? formatDateTime(user.lastLoginAt) : null,
    vreme: {
      registrovan: formatDateTime(user.createdAt),
      azuriran: formatDateTime(user.updatedAt),
    },
  };
}

export function mapUserForEmployeeShort(user) {
  return {
    id: user._id.toString(),
    imePrezime: getFullName(user),
    email: user.email,
    telefon: user.phone || null,
    uloga: getRoleName(user),
  };
}

export function mapUserForEmployeeDetail(user) {
  return {
    id: user._id.toString(),
    imePrezime: getFullName(user),
    email: user.email,
    telefon: user.phone || null,
    uloga: getRoleName(user),
    registrovan: formatDate(user.createdAt),
  };
}

export function mapUserForProfile(user) {
  return {
    id: user._id.toString(),
    imePrezime: getFullName(user),
    email: user.email,
    telefon: user.phone || null,
    uloga: getRoleName(user),
    avatar: user.avatar || null,
    prihvaceniUslovi: user.acceptedTerms ? "Da" : "Ne",
    poslednjiLogin: user.lastLoginAt ? formatDateTime(user.lastLoginAt) : null,
    clanOd: formatDate(user.createdAt),
  };
}