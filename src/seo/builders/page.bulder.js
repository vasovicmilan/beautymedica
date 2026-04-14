import { escape, buildCanonical } from '../utils.seo.js';

export async function buildPageSeo(pageConfig, req, siteConfig = {}) {
  const siteName = siteConfig.siteName || 'Moj Salon';
  const title = pageConfig.title ? `${escape(pageConfig.title)} | ${siteName}` : siteName;
  const description = pageConfig.description || siteConfig.defaultDescription || '';
  const robots = pageConfig.noIndex ? 'noindex, follow' : 'index, follow';
  const canonical = buildCanonical(req, pageConfig.slug);
  const imageUrl = pageConfig.image || siteConfig.defaultImage || '/images/default-og.jpg';

  return {
    title,
    description,
    canonical,
    robots,
    meta: {},
    og: { title, description, url: canonical, image: imageUrl, site_name: siteName },
    twitter: { card: 'summary', title, description, image: imageUrl },
  };
}