import { sendEmail as emailProvider } from "../integrations/email.provider.js";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATES_DIR = path.join(__dirname, "../views/emails");

async function renderTemplate(templateName, data) {
  try {
    const templatePath = path.join(TEMPLATES_DIR, `${templateName}.ejs`);
    return await ejs.renderFile(templatePath, data);
  } catch (err) {
    console.error(`Greška pri renderovanju templejta ${templateName}:`, err);
    return `<p>Greška u prikazu emaila. Molimo kontaktirajte podršku.</p>`;
  }
}

// ========== SPECIFIČNE FUNKCIJE ==========

export async function sendWelcomeEmail({ email, name }) {
  try {
    const html = await renderTemplate("welcome", { name });
    return await emailProvider({ to: email, subject: "Dobrodošli", html });
  } catch (error) {
    console.error("sendWelcomeEmail failed:", error);
    return { success: false, error };
  }
}

export async function sendNewsletterEmail({ email, content }) {
  try {
    const html = await renderTemplate("newsletter", { content });
    return await emailProvider({ to: email, subject: "Naš newsletter", html });
  } catch (error) {
    console.error("sendNewsletterEmail failed:", error);
    return { success: false, error };
  }
}

export async function sendPromoEmail({ email, promoCode, discount }) {
  try {
    const html = await renderTemplate("promo", { promoCode, discount });
    return await emailProvider({ to: email, subject: "Specijalna ponuda", html });
  } catch (error) {
    console.error("sendPromoEmail failed:", error);
    return { success: false, error };
  }
}

export async function sendNotificationEmail({ email, message }) {
  try {
    const html = await renderTemplate("notification", { message });
    return await emailProvider({ to: email, subject: "Obaveštenje", html });
  } catch (error) {
    console.error("sendNotificationEmail failed:", error);
    return { success: false, error };
  }
}

export async function sendReminderEmail({ email, name, appointmentDate, appointmentTime }) {
  try {
    const html = await renderTemplate("reminder", { name, appointmentDate, appointmentTime });
    return await emailProvider({ to: email, subject: "Podsetnik za termin", html });
  } catch (error) {
    console.error("sendReminderEmail failed:", error);
    return { success: false, error };
  }
}

export async function sendPendingAppointmentEmail({ email, name, date, time }) {
  try {
    const html = await renderTemplate("pending-appointment", { name, date, time });
    return await emailProvider({ to: email, subject: "Termin je zatražen", html });
  } catch (error) {
    console.error("sendPendingAppointmentEmail failed:", error);
    return { success: false, error };
  }
}

export async function sendAppointmentUpdateEmail({ email, name, oldDate, newDate, status }) {
  try {
    const html = await renderTemplate("appointment-update", { name, oldDate, newDate, status });
    return await emailProvider({ to: email, subject: "Izmena termina", html });
  } catch (error) {
    console.error("sendAppointmentUpdateEmail failed:", error);
    return { success: false, error };
  }
}

export async function sendProfileDeactivationEmail({ email, name, reason }) {
  try {
    const html = await renderTemplate("profile-deactivation", { name, reason });
    return await emailProvider({ to: email, subject: "Profil deaktiviran", html });
  } catch (error) {
    console.error("sendProfileDeactivationEmail failed:", error);
    return { success: false, error };
  }
}