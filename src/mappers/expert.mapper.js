import { formatDateTime } from '../utils/date.time.util.js';

function translateActive(isActive) {
  return isActive ? "Aktivan" : "Neaktivan";
}

function getFullName(expert) {
  return `${expert.firstName} ${expert.lastName}`.trim();
}

export function mapExpertForAdminShort(expert) {
  return {
    id: expert._id.toString(),
    imePrezime: getFullName(expert),
    titula: expert.title,
    slug: expert.slug,
    aktivnost: translateActive(expert.isActive),
    kreiran: formatDateTime(expert.createdAt),
  };
}

export function mapExpertForAdminDetail(expert) {
  return {
    id: expert._id.toString(),
    imePrezime: getFullName(expert),
    titula: expert.title,
    slug: expert.slug,
    biografija: expert.bio || null,
    slika: expert.image
      ? {
          url: expert.image.url || null,
          alt: expert.image.alt || expert.image.imgDesc || `${expert.firstName} ${expert.lastName}`,
        }
      : null,
    aktivnost: translateActive(expert.isActive),
    vreme: {
      kreiran: formatDateTime(expert.createdAt),
      azuriran: formatDateTime(expert.updatedAt),
    },
  };
}

export function mapExpertForPublic(expert) {
  return {
    id: expert._id.toString(),
    imePrezime: getFullName(expert),
    titula: expert.title,
    biografija: expert.bio || null,
    slika: expert.image
      ? {
          url: expert.image.url || null,
          alt: expert.image.alt || expert.image.imgDesc || `${expert.firstName} ${expert.lastName}`,
        }
      : null,
    slug: expert.slug,
  };
}