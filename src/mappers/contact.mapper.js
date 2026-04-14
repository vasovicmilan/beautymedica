import { formatDateTime } from '../utils/date.time.util.js';

function translateType(type) {
  const map = {
    contact: "Kontakt",
    reservation: "Rezervacija",
    question: "Pitanje",
    complaint: "Pritužba",
  };
  return map[type] || type;
}

function translateStatus(status) {
  const map = {
    new: "Nova",
    "in-progress": "U obradi",
    resolved: "Rešeno",
  };
  return map[status] || status;
}

function getSenderName(contact) {
  if (contact.user && typeof contact.user === "object") {
    const first = contact.user.firstName || "";
    const last = contact.user.lastName || "";
    if (first || last) return `${first} ${last}`.trim();
  }
  const first = contact.firstName || "";
  const last = contact.lastName || "";
  return `${first} ${last}`.trim() || "Nepoznati pošiljalac";
}

function getSenderEmail(contact) {
  if (contact.user && typeof contact.user === "object" && contact.user.email) {
    return contact.user.email;
  }
  return contact.email || null;
}

function getSenderPhone(contact) {
  return contact.phone || null;
}

export function mapContactForAdminShort(contact) {
  return {
    id: contact._id.toString(),
    pošiljalac: getSenderName(contact),
    email: getSenderEmail(contact),
    tip: translateType(contact.type),
    naslov: contact.title,
    status: translateStatus(contact.status),
    datum: formatDateTime(contact.createdAt),
  };
}

export function mapContactForAdminDetail(contact) {
  return {
    id: contact._id.toString(),
    pošiljalac: {
      ime: getSenderName(contact),
      email: getSenderEmail(contact),
      telefon: getSenderPhone(contact),
    },
    tip: translateType(contact.type),
    naslov: contact.title,
    poruka: contact.message, // dekriptovana
    status: translateStatus(contact.status),
    internNapomena: contact.note || null,
    odgovoreno: contact.respondedAt ? formatDateTime(contact.respondedAt) : null,
    prihvacenoPrivatnost: contact.acceptance ? "Da" : "Ne",
    vreme: {
      poslato: formatDateTime(contact.createdAt),
      poslednjeAzuriranje: formatDateTime(contact.updatedAt),
    },
  };
}

export function mapContactForUserShort(contact) {
  return {
    id: contact._id.toString(),
    tip: translateType(contact.type),
    naslov: contact.title,
    status: translateStatus(contact.status),
    datum: formatDateTime(contact.createdAt),
  };
}

export function mapContactForUserDetail(contact) {
  return {
    id: contact._id.toString(),
    tip: translateType(contact.type),
    naslov: contact.title,
    poruka: contact.message, 
    status: translateStatus(contact.status),
    odgovoreno: contact.respondedAt ? formatDateTime(contact.respondedAt) : null,
    odgovorAdministratora: contact.note || null,
    vreme: {
      poslato: formatDateTime(contact.createdAt),
      poslednjeAzuriranje: formatDateTime(contact.updatedAt),
    },
  };
}

export function mapContact(contact, role, viewType = "short") {
  if (role === "admin") {
    return viewType === "short"
      ? mapContactForAdminShort(contact)
      : mapContactForAdminDetail(contact);
  }
  // role === "user" ili "guest"
  return viewType === "short"
    ? mapContactForUserShort(contact)
    : mapContactForUserDetail(contact);
}