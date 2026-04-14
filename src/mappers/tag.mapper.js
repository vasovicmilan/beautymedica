import { formatDateTime } from '../utils/date.time.util.js';

function translateDomain(domain) {
  const map = {
    service: "Usluga",
    post: "Blog",
  };
  return map[domain] || domain;
}

function translateType(type) {
  const map = {
    body_part: "Deo tela",
    goal: "Cilj",
    technology: "Tehnologija",
    intensity: "Intenzitet",
    duration: "Trajanje",
    custom: "Prilagođeno",
  };
  return map[type] || type;
}

function translateActive(isActive) {
  return isActive ? "Aktivan" : "Neaktivan";
}

export function mapTagForAdminShort(tag) {
  return {
    id: tag._id.toString(),
    naziv: tag.name,
    slug: tag.slug,
    domen: translateDomain(tag.domain),
    tip: translateType(tag.type),
    aktivnost: translateActive(tag.meta?.isActive),
    prioritet: tag.meta?.priority ?? 0,
    kreiran: formatDateTime(tag.createdAt),
  };
}

export function mapTagForAdminDetail(tag) {
  return {
    id: tag._id.toString(),
    osnovno: {
      naziv: tag.name,
      slug: tag.slug,
      domen: translateDomain(tag.domain),
      tip: translateType(tag.type),
    },
    opis: {
      kratak: tag.shortDescription || null,
      dug: tag.longDescription || null,
    },
    meta: {
      indeksiranje: tag.isIndexable ? "Dozvoljeno" : "Zabranjeno",
      prioritet: tag.meta?.priority ?? 0,
      aktivnost: translateActive(tag.meta?.isActive),
    },
    vreme: {
      kreiran: formatDateTime(tag.createdAt),
      azuriran: formatDateTime(tag.updatedAt),
    },
  };
}

export function mapTagForPublic(tag) {
  return {
    id: tag._id.toString(),
    naziv: tag.name,
    slug: tag.slug,
  };
}