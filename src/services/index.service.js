import * as serviceService from './service.service.js';
import * as expertService from './expert.service.js';
import * as postService from './post.service.js';
import * as testimonialService from './testimonial.service.js';
import { generateSeo } from '../seo/index.seo.js';
import { mapServiceForPublicDetail } from '../mappers/service.mapper.js';

const SITE_CONFIG = {
  siteName: process.env.SITE_NAME || 'Beauty Medica Center',
  defaultDescription: process.env.SITE_DESCRIPTION || 'Ruski ESMA profesionalni elektrostimulator, limfodrenaža, lifting, elektrolipoliza i profesionalne masaže.',
  defaultImage: process.env.SITE_IMAGE || '/images/og-default.jpg',
};

export async function getHomepageData(req) {
  // Dohvati sirove istaknute usluge (sa svim referencama)
  const featuredRaw = await serviceService.findFeaturedServices(12, true);
  
  // Filtriraj po tipu i mapiraj u detaljni prikaz
  const esmaRaw = featuredRaw.find(s => s.type === 'esma');
  const massageRaw = featuredRaw.find(s => s.type === 'massage');
  
  const esmaService = esmaRaw ? mapServiceForPublicDetail(esmaRaw) : null;
  const massageService = massageRaw ? mapServiceForPublicDetail(massageRaw) : null;

  const expertsResult = await expertService.findExperts({ role: 'public', limit: 4, page: 1 });
  const experts = expertsResult.data;

  const postsResult = await postService.findPosts({ isAdmin: false, limit: 3, page: 1 });
  const blogPosts = postsResult.data;

  const testimonials = await testimonialService.findFeaturedTestimonials(6);
  const testimonialStats = await testimonialService.getTestimonialsStats();

  const seo = await generateSeo('page', {
    title: 'Beauty Medica Center | ESMA tretmani i masaže',
    description: SITE_CONFIG.defaultDescription,
    slug: '',
    image: SITE_CONFIG.defaultImage,
  }, req, SITE_CONFIG);

  return {
    esmaService,
    massageService,
    experts,
    blogPosts,
    testimonials,
    testimonialStats,
    seo,
  };
}