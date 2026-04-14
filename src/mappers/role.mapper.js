import { formatDateTime } from '../utils/date.time.util.js';


function translateRoleName(name) {
  const map = {
    admin: "Administrator",
    employee: "Zaposleni",
    user: "Korisnik",
  };
  return map[name] || name;
}

function translatePermission(perm) {
  const map = {
    manage_users: "Upravljanje korisnicima",
    manage_roles: "Upravljanje ulogama",
    manage_services: "Upravljanje uslugama",
    manage_all_reservations: "Upravljanje svim rezervacijama",
    manage_free_reservation: "Upravljanje slobodnim rezervacijama",
    manage_own_reservations: "Upravljanje sopstvenim rezervacijama",
    view_dashboard: "Pregled dashboard-a",
    manage_packages: "Upravljanje paketima",
  };
  return map[perm] || perm;
}

export function mapRoleForAdminShort(role) {
  return {
    id: role._id.toString(),
    naziv: translateRoleName(role.name),
    brojPermisija: role.permissions?.length || 0,
    kreirana: formatDateTime(role.createdAt),
    izmenjena: formatDateTime(role.updatedAt),
  };
}

export function mapRoleForAdminDetail(role) {
  return {
    id: role._id.toString(),
    naziv: translateRoleName(role.name),
    sistemskiNaziv: role.name,
    dozvole: (role.permissions || []).map(perm => translatePermission(perm)),
    vreme: {
      kreirana: formatDateTime(role.createdAt),
      poslednjaIzmena: formatDateTime(role.updatedAt),
    },
  };
}