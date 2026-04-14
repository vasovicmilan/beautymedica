import { formatDateTime } from '../utils/date.time.util.js';

function getParentName(category) {
  if (!category.parent) return null;
  if (typeof category.parent === "object" && category.parent.name) {
    return category.parent.name;
  }
  return category.parent.toString();
}

function translateDomain(domain) {
  const map = {
    service: "Usluga",
    post: "Blog",
  };
  return map[domain] || domain;
}

function translateActive(isActive) {
  return isActive ? "Aktivan" : "Neaktivan";
}

export function mapCategoryForAdminShort(category) {
  return {
    id: category._id.toString(),
    naziv: category.name,
    slug: category.slug,
    domen: translateDomain(category.domain),
    aktivna: translateActive(category.meta?.isActive),
    prioritet: category.meta?.priority ?? 0,
    kreirana: formatDateTime(category.createdAt),
  };
}

export function mapCategoryForAdminDetail(category) {
  return {
    id: category._id.toString(),
    osnovno: {
      naziv: category.name,
      slug: category.slug,
      domen: translateDomain(category.domain),
      parent: getParentName(category),
      parentId: category.parent?._id?.toString() || category.parent?.toString() || null,
      kratakOpis: category.shortDescription || null,
      dugOpis: category.longDescription || null,
    },
    slika: category.featureImage?.img
      ? {
          url: category.featureImage.img,
          opis: category.featureImage.imgDesc || null,
        }
      : null,
    meta: {
      indeksiranje: category.isIndexable ? "Dozvoljeno" : "Zabranjeno",
      prioritet: category.meta?.priority ?? 0,
      aktivna: translateActive(category.meta?.isActive),
    },
    vreme: {
      kreirano: formatDateTime(category.createdAt),
      azurirano: formatDateTime(category.updatedAt),
    },
  };
}

export function mapCategoryForPublic(category) {
  return {
    id: category._id.toString(),
    naziv: category.name,
    slug: category.slug,
  };
}

export function mapCategoriesForPublic(categories) {
  return categories.map(mapCategoryForPublic);
}