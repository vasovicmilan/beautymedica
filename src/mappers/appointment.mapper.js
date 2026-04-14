import { formatDateTime } from '../utils/date.time.util.js';

function translateStatus(status) {
  const map = {
    pending: "Na čekanju",
    confirmed: "Potvrđeno",
    rejected: "Odbijeno",
    cancelled: "Otkazano",
    completed: "Završeno",
  };
  return map[status] || status;
}

function translateActor(actor) {
  const map = {
    system: "Sistem",
    admin: "Administrator",
    employee: "Terapeut",
  };
  return map[actor] || actor;
}

function getUserName(appointment) {
  if (appointment.customerSnapshot?.firstName) {
    return `${appointment.customerSnapshot.firstName} ${appointment.customerSnapshot.lastName || ""}`.trim();
  }
  if (appointment.user && typeof appointment.user === "object") {
    return `${appointment.user.firstName || ""} ${appointment.user.lastName || ""}`.trim();
  }
  return "Nepoznat korisnik";
}

function getUserEmail(appointment) {
  if (appointment.customerSnapshot?.email) return appointment.customerSnapshot.email;
  if (appointment.user && typeof appointment.user === "object") return appointment.user.email;
  return null;
}

function getUserPhone(appointment) {
  if (appointment.customerSnapshot?.phone) return appointment.customerSnapshot.phone;
  return null;
}

function getEmployeeName(employeeDoc) {
  if (!employeeDoc) return null;
  if (typeof employeeDoc === "object" && employeeDoc.userId) {
    const user = employeeDoc.userId;
    if (user && typeof user === "object") {
      return `${user.firstName || ""} ${user.lastName || ""}`.trim();
    }
  }

  if (employeeDoc.firstName) return `${employeeDoc.firstName} ${employeeDoc.lastName || ""}`.trim();
  return employeeDoc._id?.toString() || "Nepoznat";
}

export function mapAppointmentForAdminShort(appointment) {
  return {
    id: appointment._id.toString(),
    korisnik: getUserName(appointment),
    usluga: appointment.variant?.name || appointment.service?.name || "Nepoznato",
    datum: formatDateTime(appointment.startTime),
    status: translateStatus(appointment.status),
    ukupnaCena: appointment.finalPrice?.toFixed(2) + " RSD" || "0 RSD",
  };
}

export function mapAppointmentForAdminDetail(appointment) {
  return {
    id: appointment._id.toString(),
    korisnik: {
      ime: getUserName(appointment),
      email: getUserEmail(appointment),
      telefon: getUserPhone(appointment),
    },
    usluga: {
      naziv: appointment.variant?.name || appointment.service?.name,
      trajanje: appointment.variant?.duration ? `${appointment.variant.duration} min` : null,
      cena: appointment.variant?.price?.toFixed(2) + " RSD",
    },
    termin: {
      pocetak: formatDateTime(appointment.startTime),
      kraj: formatDateTime(appointment.endTime),
    },
    status: translateStatus(appointment.status),
    terapeut: appointment.employee ? getEmployeeName(appointment.employee) : null,
    dodeljenTerapeut: appointment.assignedTo ? getEmployeeName(appointment.assignedTo) : null,
    napomena: appointment.note || null,
    popust: appointment.discountApplied ? `${appointment.discountApplied} RSD` : null,
    konacnaCena: appointment.finalPrice?.toFixed(2) + " RSD",
    kupon: appointment.coupon?.code || null,
    createdAt: formatDateTime(appointment.createdAt),
    updatedAt: formatDateTime(appointment.updatedAt),

    odbio: appointment.rejectedBy ? translateActor(appointment.rejectedBy) : null,
    odbijenU: formatDateTime(appointment.rejectedAt),
    razlogOdbijanja: appointment.rejectionReason || null,

    potvrdio: appointment.confirmedBy ? translateActor(appointment.confirmedBy) : null,
    potvrdjenU: formatDateTime(appointment.confirmedAt),

    dodelio: appointment.assignedBy ? translateActor(appointment.assignedBy) : null,
    dodeljenU: formatDateTime(appointment.assignedAt),
  };
}

export function mapAppointmentForEmployeeShort(appointment) {
  return {
    id: appointment._id.toString(),
    klijent: getUserName(appointment),
    usluga: appointment.variant?.name || appointment.service?.name,
    datum: formatDateTime(appointment.startTime),
    status: translateStatus(appointment.status),
    cena: appointment.finalPrice?.toFixed(2) + " RSD",
  };
}

export function mapAppointmentForEmployeeDetail(appointment) {
  return {
    id: appointment._id.toString(),
    klijent: {
      ime: getUserName(appointment),
      email: getUserEmail(appointment),
      telefon: getUserPhone(appointment),
    },
    usluga: {
      naziv: appointment.variant?.name,
      trajanje: appointment.variant?.duration ? `${appointment.variant.duration} min` : null,
      cena: appointment.variant?.price?.toFixed(2) + " RSD",
    },
    termin: {
      pocetak: formatDateTime(appointment.startTime),
      kraj: formatDateTime(appointment.endTime),
    },
    status: translateStatus(appointment.status),
    napomenaKlijenta: appointment.note || null,
    popust: appointment.discountApplied ? `${appointment.discountApplied} RSD` : null,
    konacnaCena: appointment.finalPrice?.toFixed(2) + " RSD",
    mojaUloga: appointment.employee?._id?.equals(appointment.assignedTo?._id) ? "Direktno zakazan" : "Dodeljen od strane sistema",
  };
}

export function mapAppointmentForUserShort(appointment) {
  return {
    id: appointment._id.toString(),
    usluga: appointment.variant?.name || appointment.service?.name,
    datum: formatDateTime(appointment.startTime),
    status: translateStatus(appointment.status),
    cena: appointment.finalPrice?.toFixed(2) + " RSD",
  };
}

export function mapAppointmentForUserDetail(appointment) {
  return {
    id: appointment._id.toString(),
    usluga: {
      naziv: appointment.variant?.name,
      trajanje: appointment.variant?.duration ? `${appointment.variant.duration} min` : null,
      cena: appointment.variant?.price?.toFixed(2) + " RSD",
    },
    termin: {
      pocetak: formatDateTime(appointment.startTime),
      kraj: formatDateTime(appointment.endTime),
    },
    status: translateStatus(appointment.status),
    terapeut: appointment.employee ? getEmployeeName(appointment.employee) : (appointment.assignedTo ? getEmployeeName(appointment.assignedTo) : "Nije dodeljen"),
    napomena: appointment.note || null,
    popust: appointment.discountApplied ? `${appointment.discountApplied} RSD` : null,
    konacnaCena: appointment.finalPrice?.toFixed(2) + " RSD",
    kupon: appointment.coupon?.code || null,
    createdAt: formatDateTime(appointment.createdAt),

    razlogOdbijanja: appointment.status === "rejected" ? (appointment.rejectionReason || "Nije naveden") : null,
  };
}

export function mapAppointment(appointment, role, viewType = "short") {
  if (role === "admin") {
    return viewType === "short" ? mapAppointmentForAdminShort(appointment) : mapAppointmentForAdminDetail(appointment);
  }
  if (role === "employee") {
    return viewType === "short" ? mapAppointmentForEmployeeShort(appointment) : mapAppointmentForEmployeeDetail(appointment);
  }
  // user ili guest
  return viewType === "short" ? mapAppointmentForUserShort(appointment) : mapAppointmentForUserDetail(appointment);
}