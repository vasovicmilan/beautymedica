import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Testimonial from './models/testimonial.model.js';
import Service from './models/service.model.js';
import Employee from './models/employee.model.js';

dotenv.config();

// Dummy podaci
const DUMMY_TESTIMONIALS = [
  {
    displayName: 'Milica R.',
    rating: 5,
    comment: 'Posle samo 3 tretmana ESMA-om, stomak mi je ravniji, koža zategnutija. Neverovatno!',
    approved: true,
  },
  {
    displayName: 'Tatjana K.',
    rating: 5,
    comment: 'Mikrostruje lica su me podmladile bez boli. Osećam se kao posle odmora.',
    approved: true,
  },
  {
    displayName: 'Stefan L.',
    rating: 5,
    comment: 'Sportska masaža + limfodrenaža – oporavak posle treninga nikad brži.',
    approved: true,
  },
  {
    displayName: 'Jelena M.',
    rating: 4,
    comment: 'Odličan tretman, osoblje ljubazno. Primetan lifting posle 5 tretmana.',
    approved: true,
  },
  {
    displayName: 'Miloš P.',
    rating: 5,
    comment: 'Prvi put kod njih, prezadovoljan. ESMA tretman je zaista efikasan.',
    approved: true,
  },
  {
    displayName: 'Ana S.',
    rating: 4,
    comment: 'Relax masaža je pravo uživanje. Doći ću ponovo.',
    approved: true,
  },
];

async function seedTestimonials() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Povezan sa bazom');

    // Opciono: dohvati jednu uslugu i jednog zaposlenog da povežemo sa nekim utiscima
    const anyService = await Service.findOne({ isActive: true });
    const anyEmployee = await Employee.findOne({ isActive: true });

    for (const testimonial of DUMMY_TESTIMONIALS) {
      const data = {
        ...testimonial,
        // Nekim utiscima dodeli uslugu i zaposlenog (opciono)
        service: testimonial.rating === 5 && anyService ? anyService._id : null,
        employee: testimonial.rating === 5 && anyEmployee ? anyEmployee._id : null,
      };
      const created = await Testimonial.create(data);
      console.log(`📌 Utisak od "${created.displayName}" (${created.rating}★) je spreman`);
    }

    console.log('🎉 Seeding utisaka završen');
    process.exit(0);
  } catch (err) {
    console.error('❌ Greška prilikom seedinga utisaka:', err);
    process.exit(1);
  }
}

seedTestimonials();