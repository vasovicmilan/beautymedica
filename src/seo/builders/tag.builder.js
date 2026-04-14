import { escape, buildCanonical } from '../utils.seo.js';

export async function buildTagSeo(tag, req, siteConfig = {}) {
  const siteName = siteConfig.siteName || 'Moj Salon';
  const title = tag.name ? `${escape(tag.name)} | ${siteName}` : siteName;
  const description = tag.shortDescription || tag.longDescription || `Tag: ${tag.name}`;
  const robots = tag.meta?.isActive !== false && tag.isIndexable !== false ? 'index, follow' : 'noindex, follow';
  const canonical = buildCanonical(req, `/tagovi/${tag.slug}`);

  return {
    title,
    description: description.slice(0, 160),
    canonical,
    robots,
    meta: {},
    og: { title, description, url: canonical, type: 'website' },
    twitter: { card: 'summary', title, description },
  };
}