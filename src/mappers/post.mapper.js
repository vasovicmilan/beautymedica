import { formatDateTime, formatDate } from '../utils/date.time.util.js';

function translateStatus(status) {
  const map = {
    draft: "Nacrt",
    published: "Objavljeno",
    featured: "Istaknuto",
  };
  return map[status] || status;
}

function getExpertName(post) {
  if (post.expert && typeof post.expert === "object") {
    return `${post.expert.firstName || ""} ${post.expert.lastName || ""}`.trim() || "Nepoznati autor";
  }
  return "Nepoznati autor";
}

function getExpertBio(post) {
  if (post.expert && typeof post.expert === "object") {
    return post.expert.bio || null;
  }
  return null;
}

function getExpertImage(post) {
  if (post.expert && typeof post.expert === "object" && post.expert.image) {
    return {
      url: post.expert.image.url || null,
      alt: post.expert.image.alt || post.expert.image.imgDesc || getExpertName(post),
    };
  }
  return null;
}

function getCategoryNames(post) {
  if (!post.categories || !Array.isArray(post.categories)) return [];
  return post.categories
    .filter(cat => cat && typeof cat === "object" && cat.name)
    .map(cat => cat.name);
}

function getCategorySlugs(post) {
  if (!post.categories || !Array.isArray(post.categories)) return [];
  return post.categories
    .filter(cat => cat && typeof cat === "object" && cat.slug)
    .map(cat => cat.slug);
}

function getTagNames(post) {
  if (!post.tags || !Array.isArray(post.tags)) return [];
  return post.tags
    .filter(tag => tag && typeof tag === "object" && tag.name)
    .map(tag => tag.name);
}

function getTagSlugs(post) {
  if (!post.tags || !Array.isArray(post.tags)) return [];
  return post.tags
    .filter(tag => tag && typeof tag === "object" && tag.slug)
    .map(tag => tag.slug);
}

function getProcessedContent(content) {
  if (!content || !Array.isArray(content)) return [];
  return content;
}

function getFaq(faq) {
  if (!faq || !Array.isArray(faq)) return [];
  return faq.map(item => ({
    pitanje: item.question || null,
    odgovor: item.answer || null,
  }));
}

export function mapPostForAdminShort(post) {
  return {
    id: post._id.toString(),
    naslov: post.title,
    slug: post.slug,
    status: translateStatus(post.status),
    autor: getExpertName(post),
    datumObjave: formatDate(post.createdAt),
    indeksiranje: post.isIndexable ? "Da" : "Ne",
  };
}

export function mapPostForAdminDetail(post) {
  return {
    id: post._id.toString(),
    naslov: post.title,
    slug: post.slug,
    status: translateStatus(post.status),
    autor: {
      ime: getExpertName(post),
      biografija: getExpertBio(post),
      slika: getExpertImage(post),
    },
    kategorije: getCategoryNames(post),
    tagovi: getTagNames(post),
    kratakOpis: post.shortDescription,
    opis: post.description,
    sadrzaj: getProcessedContent(post.content),
    slika: post.image
      ? {
          url: post.image.url || null,
          alt: post.image.alt || post.image.imgDesc || post.title,
        }
      : null,
    seoKljucneReci: post.seoKeywords || [],
    faq: getFaq(post.faq),
    indeksiranje: post.isIndexable ? "Dozvoljeno" : "Zabranjeno",
    vreme: {
      kreiran: formatDateTime(post.createdAt),
      azuriran: formatDateTime(post.updatedAt),
    },
  };
}

export function mapPostForPublicCard(post) {
  return {
    id: post._id.toString(),
    naslov: post.title,
    slug: post.slug,
    kratakOpis: post.shortDescription,
    slika: post.image
      ? {
          url: post.image.url || null,
          alt: post.image.alt || post.image.imgDesc || post.title,
        }
      : null,
    autor: getExpertName(post),
    datumObjave: formatDate(post.createdAt),
  };
}

export function mapPostForPublicDetail(post) {
  return {
    id: post._id.toString(),
    naslov: post.title,
    slug: post.slug,
    kratakOpis: post.shortDescription,
    opis: post.description,
    sadrzaj: getProcessedContent(post.content),
    slika: post.image
      ? {
          url: post.image.url || null,
          alt: post.image.alt || post.image.imgDesc || post.title,
        }
      : null,
    autor: {
      ime: getExpertName(post),
      biografija: getExpertBio(post),
      slika: getExpertImage(post),
    },
    kategorije: getCategorySlugs(post),
    tagovi: getTagSlugs(post),
    faq: getFaq(post.faq),
    seoKljucneReci: post.seoKeywords || [],
    datumObjave: formatDate(post.createdAt),
    poslednjeAzuriranje: formatDate(post.updatedAt),
  };
}