import { truncate, escape, buildCanonical } from '../utils.seo.js';

export async function buildCategorySeo(category, req, siteConfig = {}) {
  const siteName = siteConfig.siteName || 'Moj Salon';
  const title = category.name ? `${escape(category.name)} | ${siteName}` : siteName;
  const description = truncate(category.shortDescription || category.longDescription || siteConfig.defaultDescription || '');
  const robots = category.meta?.isActive !== false && category.isIndexable !== false ? 'index, follow' : 'noindex, follow';
  const canonical = buildCanonical(req, `/kategorije/${category.slug}`);

  return {
    title,
    description,
    canonical,
    robots,
    meta: {},
    og: { title, description, url: canonical, type: 'website' },
    twitter: { card: 'summary', title, description },
  };
}