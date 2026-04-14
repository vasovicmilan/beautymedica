import { truncate, escape, buildCanonical } from '../utils.seo.js';

export async function buildServiceSeo(service, req, siteConfig = {}) {
  const siteName = siteConfig.siteName || 'Moj Salon';
  const defaultImage = siteConfig.defaultImage || '/images/default-og.jpg';
  const title = service.name ? `${escape(service.name)} | ${siteName}` : siteName;
  const description = truncate(service.shortDescription || service.longDescription || siteConfig.defaultDescription || '');
  const robots = service.isIndexable !== false ? 'index, follow' : 'noindex, follow';
  const canonical = buildCanonical(req, `/usluge/${service.slug}`);
  const imageUrl = service.image?.url || defaultImage;

  return {
    title,
    description,
    canonical,
    robots,
    meta: { keywords: service.seoKeywords?.join(', ') || '' },
    og: {
      title,
      description,
      url: canonical,
      type: 'website',
      image: imageUrl,
      site_name: siteName,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      image: imageUrl,
    },
  };
}