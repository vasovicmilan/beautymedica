import { formatDateTime, formatDate } from '../utils/date.time.util.js';

function getDisplayName(testimonial) {
  if (testimonial.displayName && testimonial.displayName !== "Anonymous") {
    return testimonial.displayName;
  }
  if (testimonial.user && typeof testimonial.user === "object") {
    const first = testimonial.user.firstName || "";
    const last = testimonial.user.lastName || "";
    if (first || last) return `${first} ${last}`.trim();
  }
  return "Anonimni korisnik";
}

function getUserEmail(testimonial) {
  if (testimonial.user && typeof testimonial.user === "object") {
    return testimonial.user.email || null;
  }
  return null;
}

function getServiceName(testimonial) {
  if (testimonial.service && typeof testimonial.service === "object") {
    return testimonial.service.name || null;
  }
  return null;
}

function getEmployeeName(testimonial) {
  if (testimonial.employee && typeof testimonial.employee === "object") {
    if (testimonial.employee.userId && typeof testimonial.employee.userId === "object") {
      const first = testimonial.employee.userId.firstName || "";
      const last = testimonial.employee.userId.lastName || "";
      if (first || last) return `${first} ${last}`.trim();
    }

    if (testimonial.employee.firstName) {
      return `${testimonial.employee.firstName} ${testimonial.employee.lastName || ""}`.trim();
    }
  }
  return null;
}

function truncateComment(comment, maxLength = 50) {
  if (!comment) return "";
  if (comment.length <= maxLength) return comment;
  return comment.substring(0, maxLength) + "...";
}

export function mapTestimonialForAdminShort(testimonial) {
  return {
    id: testimonial._id.toString(),
    ime: getDisplayName(testimonial),
    email: getUserEmail(testimonial),
    ocena: testimonial.rating,
    komentar: truncateComment(testimonial.comment, 60),
    usluga: getServiceName(testimonial),
    terapeut: getEmployeeName(testimonial),
    odobren: testimonial.approved ? "Da" : "Ne",
    datum: formatDate(testimonial.createdAt),
  };
}

export function mapTestimonialForAdminDetail(testimonial) {
  return {
    id: testimonial._id.toString(),
    autor: {
      ime: getDisplayName(testimonial),
      email: getUserEmail(testimonial),
    },
    ocena: testimonial.rating,
    komentar: testimonial.comment,
    usluga: getServiceName(testimonial),
    terapeut: getEmployeeName(testimonial),
    odobren: testimonial.approved ? "Odobreno" : "Nije odobreno",
    vreme: {
      kreiran: formatDateTime(testimonial.createdAt),
      azuriran: formatDateTime(testimonial.updatedAt),
    },
  };
}

export function mapTestimonialForPublic(testimonial) {
  return {
    id: testimonial._id.toString(),
    ime: getDisplayName(testimonial),
    ocena: testimonial.rating,
    komentar: testimonial.comment,
    usluga: getServiceName(testimonial),
    terapeut: getEmployeeName(testimonial),
    datum: formatDate(testimonial.createdAt),
  };
}