import { formatDateTime } from '../utils/date.time.util.js';

function formatPrice(price) {
  if (price === undefined || price === null) return null;
  return price.toLocaleString("sr-RS") + " RSD";
}

function translateType(type) {
  return type === "esma" ? "ESMA" : "Masaža";
}

function getFirstPackagePrice(service) {
  if (service.packages && service.packages.length > 0 && service.packages[0].totalPrice) {
    return formatPrice(service.packages[0].totalPrice);
  }
  return null;
}

function mapFeature(feature) {
  return {
    id: feature._id?.toString(),
    naziv: feature.name,
    slug: feature.slug,
    opis: feature.description,
    ikona: feature.icon || null,
    redosled: feature.order,
    aktivno: feature.isActive,
  };
}

function mapPackage(pkg) {
  return {
    id: pkg._id?.toString(),
    naziv: pkg.name,
    slug: pkg.slug,
    tretmana: pkg.sessions,
    ukupnaCena: formatPrice(pkg.totalPrice),
    osnovnaCena: pkg.basePrice ? formatPrice(pkg.basePrice) : null,
    usteda: pkg.basePrice && pkg.totalPrice ? formatPrice(pkg.basePrice - pkg.totalPrice) : null,
    znacka: pkg.badge || null,
    najbolji: pkg.isBest,
    redosled: pkg.order,
    aktivan: pkg.isActive,
  };
}

function mapComparisonRow(row, columns) {
  return {
    label: row.label,
    vrednosti: row.values,
  };
}

function getEmployeeNames(service) {
  if (!service.employees || !Array.isArray(service.employees)) return [];
  return service.employees
    .filter(emp => emp && typeof emp === "object" && emp.userId?.firstName)
    .map(emp => `${emp.userId.firstName} ${emp.userId.lastName}`.trim());
}

function getCategoryNames(service) {
  if (!service.categories || !Array.isArray(service.categories)) return [];
  return service.categories
    .filter(cat => cat && typeof cat === "object" && cat.name)
    .map(cat => cat.name);
}

function getTagNames(service) {
  if (!service.tags || !Array.isArray(service.tags)) return [];
  return service.tags
    .filter(tag => tag && typeof tag === "object" && tag.name)
    .map(tag => tag.name);
}

function mapGallery(gallery) {
  if (!gallery || !Array.isArray(gallery)) return [];
  return gallery.map(img => ({
    url: img.img || null,
    alt: img.imgDesc || null,
  }));
}

export function mapServiceForAdminShort(service) {
  return {
    id: service._id.toString(),
    naziv: service.name,
    slug: service.slug,
    tip: translateType(service.type),
    aktivan: service.isActive ? "Da" : "Ne",
    kreiran: formatDateTime(service.createdAt),
  };
}

export function mapServiceForAdminDetail(service) {
  return {
    id: service._id.toString(),
    naziv: service.name,
    slug: service.slug,
    tip: translateType(service.type),
    kratakOpis: service.shortDescription || null,
    dugOpis: service.longDescription || null,
    slika: service.image
      ? {
          url: service.image.img || null,
          alt: service.image.imgDesc || service.name,
        }
      : null,
    galerija: mapGallery(service.gallery),
    kategorije: getCategoryNames(service),
    tagovi: getTagNames(service),
    seoKljucneReci: service.seoKeywords || [],
    istaknuto: service.highlight ? "Da" : "Ne",
    ctaTekst: service.ctaText,
    karakteristike: (service.features || []).map(mapFeature),
    paketi: (service.packages || []).map(mapPackage),
    kolonePoredjenja: service.comparisonColumns || [],
    tabelaPoredjenja: (service.comparisonTable || []).map(row => mapComparisonRow(row, service.comparisonColumns)),
    faq: (service.faq || []).map(item => ({
      pitanje: item.question,
      odgovor: item.answer,
    })),
    zaposleni: getEmployeeNames(service),
    aktivan: service.isActive ? "Aktivan" : "Neaktivan",
    vreme: {
      kreiran: formatDateTime(service.createdAt),
      azuriran: formatDateTime(service.updatedAt),
    },
  };
}

export function mapServiceForPublicCard(service) {
  return {
    id: service._id.toString(),
    naziv: service.name,
    slug: service.slug,
    kratakOpis: service.shortDescription || null,
    slika: service.image
      ? {
          url: service.image.img || null,
          alt: service.image.imgDesc || service.name,
        }
      : null,
    cenaOd: getFirstPackagePrice(service),
    tip: translateType(service.type),
    istaknuto: service.highlight || false,
  };
}

export function mapServiceForPublicDetail(service) {
  return {
    id: service._id.toString(),
    naziv: service.name,
    slug: service.slug,
    kratakOpis: service.shortDescription || null,
    dugOpis: service.longDescription || null,
    slika: service.image
      ? {
          url: service.image.img || null,
          alt: service.image.imgDesc || service.name,
        }
      : null,
    galerija: mapGallery(service.gallery),
    kategorije: getCategoryNames(service),
    tagovi: getTagNames(service),
    karakteristike: (service.features || [])
      .filter(f => f.isActive)
      .map(f => ({
        naziv: f.name,
        opis: f.description,
        ikona: f.icon,
      })),
    paketi: (service.packages || [])
      .filter(p => p.isActive)
      .sort((a, b) => a.order - b.order)
      .map(p => ({
        naziv: p.name,
        tretmana: p.sessions,
        ukupnaCena: formatPrice(p.totalPrice),
        osnovnaCena: p.basePrice ? formatPrice(p.basePrice) : null,
        znacka: p.badge,
        najbolji: p.isBest,
      })),
    tabelaPoredjenja: service.comparisonColumns.length && service.comparisonTable.length
      ? {
          kolone: service.comparisonColumns,
          redovi: service.comparisonTable.map(row => ({
            label: row.label,
            vrednosti: row.values,
          })),
        }
      : null,
    faq: (service.faq || []).map(item => ({
      pitanje: item.question,
      odgovor: item.answer,
    })),
    zaposleni: getEmployeeNames(service),
    ctaTekst: service.ctaText,
    tip: translateType(service.type),
  };
}