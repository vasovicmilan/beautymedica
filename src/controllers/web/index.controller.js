import * as indexService from '../../services/index.service.js';
import * as contactService from '../../services/contact.service.js';
// import * as newsletterService from '../services/newsletter.service.js'; // ako postoji

import { badRequest } from '../../utils/error.util.js';
import logger from '../../config/logger.config.js';

export async function showHomePage(req, res, next) {
  try {
    const data = await indexService.getHomepageData(req);
    res.render('landing/home1', {
      esmaService: data.esmaService,
      massageService: data.massageService,
      experts: data.experts,
      blogPosts: data.blogPosts,
      testimonials: data.testimonials,
      testimonialStats: data.testimonialStats,
      seo: data.seo,
    });
  } catch (error) {
    logger.error({ error }, 'Show home page failed');
    next(error);
  }
}

export async function handleContactForm(req, res, next) {
  try {
    const { firstName, lastName, email, phone, topic, message, acceptance } = req.body;

    if (!firstName || !email || !message || !acceptance) {
      badRequest('Ime, email, poruka i prihvatanje uslova su obavezni');
    }

    let type = 'contact';
    if (topic && topic.includes('ESMA')) type = 'reservation';
    else if (topic && topic.includes('Masaže')) type = 'reservation';
    else if (topic && topic.includes('Zakazivanje')) type = 'reservation';
    else if (topic && topic.includes('Cene')) type = 'question';

    const contactData = {
      firstName,
      lastName: lastName || '',
      email,
      phone: phone || null,
      type,
      title: topic || 'Kontakt upit',
      message,
      acceptance: acceptance === 'on' || acceptance === true,
    };

    await contactService.createContact(contactData);
    req.session.flash = { type: 'success', message: 'Vaša poruka je uspešno poslata. Odgovorićemo u najkraćem roku.' };
    res.redirect('/#contact');
  } catch (error) {
    logger.error({ error }, 'Contact form submission failed');
    req.session.flash = { type: 'danger', message: 'Došlo je do greške. Molimo pokušajte kasnije.' };
    res.redirect('/#contact');
  }
}

export async function handleNewsletter(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) badRequest('Email je obavezan');

    logger.info(`Newsletter subscription: ${email}`);
    req.session.flash = { type: 'success', message: 'Uspešno ste se prijavili na naš newsletter.' };
    res.redirect('/');
  } catch (error) {
    logger.error({ error }, 'Newsletter subscription failed');
    req.session.flash = { type: 'danger', message: 'Greška prilikom prijave. Pokušajte ponovo.' };
    res.redirect('/');
  }
}