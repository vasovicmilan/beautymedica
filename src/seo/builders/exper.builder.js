import { truncate, escape, buildCanonical } from '../utils.seo.js';

export async function buildExpertSeo(expert, req, siteConfig = {}) {
  const siteName = siteConfig.siteName || 'Moj Salon';
  const defaultImage = siteConfig.defaultImage || '/images/default-og.jpg';
  const fullName = `${expert.firstName} ${expert.lastName}`.trim();
  const title = fullName ? `${escape(fullName)} | ${siteName}` : siteName;
  const description = truncate(expert.bio || siteConfig.defaultDescription || '');
  const robots = expert.isActive !== false ? 'index, follow' : 'noindex, follow';
  const canonical = buildCanonical(req, `/strucnjaci/${expert.slug}`);
  const imageUrl = expert.image?.url || defaultImage;

  return {
    title,
    description,
    canonical,
    robots,
    meta: {},
    og: {
      title,
      description,
      url: canonical,
      type: 'profile',
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