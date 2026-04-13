import eventEmitter from "./eventEmitter.js";
import * as telegramService from "../services/telegram.service.js";
import * as emailService from "../services/email.service.js";

export function setupAppointmentListeners() {
  eventEmitter.on("appointment.created", async (appointment) => {
    // Email
    await emailService.sendAppointmentCreatedToUser(appointment);
    await emailService.sendAppointmentCreatedToAdmin(appointment);
    if (appointment.employee?.email) {
      await emailService.sendAppointmentCreatedToTherapist(appointment, appointment.employee.email);
    }

    // Telegram
    await telegramService.notifyAdminAboutNewAppointment(appointment);
    if (appointment.employee?.telegramChatId) {
      await telegramService.notifyTherapistAboutNewAppointment(appointment, appointment.employee.telegramChatId);
    }
  });

  // Kada se termin potvrdi
  eventEmitter.on("appointment.confirmed", async (appointment) => {
    // email korisniku + terapeutu + adminu
    // telegram adminu + terapeutu
  });

  // Kada se termin otkaže
  eventEmitter.on("appointment.cancelled", async (appointment) => {
    // obavesti sve relevantne
  });
}