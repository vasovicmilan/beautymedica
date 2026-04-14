import { truncate, escape, buildCanonical } from '../utils.seo.js';

export async function buildPostSeo(post, req, siteConfig = {}) {
  const siteName = siteConfig.siteName || 'Moj Salon';
  const defaultImage = siteConfig.defaultImage || '/images/default-og.jpg';
  const title = post.title ? `${escape(post.title)} | ${siteName}` : siteName;
  const description = truncate(post.shortDescription || post.description || siteConfig.defaultDescription || '');
  const robots = post.isIndexable !== false ? 'index, follow' : 'noindex, follow';
  const canonical = buildCanonical(req, `/blog/${post.slug}`);
  const imageUrl = post.image?.url || defaultImage;

  return {
    title,
    description,
    canonical,
    robots,
    meta: { keywords: post.seoKeywords?.join(', ') || '' },
    og: {
      title,
      description,
      url: canonical,
      type: 'article',
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