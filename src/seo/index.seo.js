import { buildServiceSeo } from './builders/service.builder.js';
import { buildPostSeo } from './builders/post.builder.js';
import { buildCategorySeo } from './builders/category.builder.js';
import { buildTagSeo } from './builders/tag.builder.js';
import { buildExpertSeo } from './builders/expert.builder.js';
import { buildPageSeo } from './builders/page.builder.js';

const builders = {
  service: buildServiceSeo,
  post: buildPostSeo,
  category: buildCategorySeo,
  tag: buildTagSeo,
  expert: buildExpertSeo,
  page: buildPageSeo,
};

export async function generateSeo(type, source, req, siteConfig = {}) {
  const builder = builders[type];
  if (!builder) {
    throw new Error(`Nepoznat SEO tip: ${type}`);
  }
  return builder(source, req, siteConfig);
}