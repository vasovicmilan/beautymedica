// appointment.model.js
import mongoose from "mongoose";

const { Schema, model } = mongoose;

const AppointmentSchema = new Schema(
  {
    // Ko rezerviše (obavezno)
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Koja usluga (obavezno)
    service: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true,
      index: true,
    },

    // Koja varijanta usluge (obavezno, jer servis mora imati bar jednu varijantu)
    variant: {
      // Snapshot podataka u trenutku rezervacije (cena, trajanje, naziv)
      name: { type: String, required: true },
      duration: { type: Number, required: true }, // u minutima
      price: { type: Number, required: true },
    },

    // Opciono: konkretan terapeut (Employee)
    // Ako nije dat, sistem će dodeliti naknadno (polje assignedTo)
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      index: true,
      default: null,
    },

    // Datum i vreme početka termina (obavezno)
    startTime: {
      type: Date,
      required: true,
      index: true,
    },

    // Automatski se računa na osnovu startTime + variant.duration
    endTime: {
      type: Date,
      required: true,
    },

    // Status rezervacije
    status: {
      type: String,
      enum: [
        "pending",            // čeka na dodelu terapeuta (ako nije izabran) ili na potvrdu
        "confirmed",          // potvrđena od strane terapeuta / sistema
        "rejected",           // odbijena od strane terapeuta / sistema
        "cancelled",          // otkazana od strane korisnika ili admina
        "completed",          // uspešno odrađena
      ],
      default: "pending",
      index: true,
    },

    // Ko je i kada odbio (samo ako je status = rejected)
    rejectedBy: {
      type: String,
      enum: ["system", "admin", "employee"],
    },
    rejectedAt: Date,
    rejectionReason: {
      type: String,
      trim: true,
    },

    // Ko je i kada potvrdio (samo ako je status = confirmed)
    confirmedBy: {
      type: String,
      enum: ["system", "admin", "employee"],
    },
    confirmedAt: Date,

    // Dodela terapeuta od strane sistema (koristi se samo ako employee nije dat inicijalno)
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      index: true,
      default: null,
    },
    assignedBy: {
      type: String,
      enum: ["system", "admin"],
    },
    assignedAt: Date,

    // Kupon (opciono)
    coupon: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
      default: null,
    },
    discountApplied: {
      type: Number,
      default: 0,
      min: 0,
    },
    finalPrice: {
      type: Number,
      required: true,
    },

    // Dodatne napomene korisnika
    note: {
      type: String,
      trim: true,
    },

    // Opciono: podaci o kontaktu u trenutku rezervacije (snapshot, ako korisnik kasnije promeni)
    customerSnapshot: {
      firstName: String,
      lastName: String,
      email: String,
      phone: String,
    },
  },
  { timestamps: true }
);

// Automatsko računanje endTime pre save-a
AppointmentSchema.pre("save", function (next) {
  if (this.isModified("startTime") || this.isModified("variant.duration")) {
    if (this.startTime && this.variant && this.variant.duration) {
      this.endTime = new Date(this.startTime.getTime() + this.variant.duration * 60000);
    }
  }
  // Ako nije dat finalPrice, postavi ga na variant.price - discountApplied
  if (this.isModified("variant.price") || this.isModified("discountApplied")) {
    this.finalPrice = Math.max(0, (this.variant.price || 0) - (this.discountApplied || 0));
  }
  next();
});

// Indeksi za performanse
AppointmentSchema.index({ user: 1, startTime: -1 });
AppointmentSchema.index({ employee: 1, startTime: -1 });
AppointmentSchema.index({ assignedTo: 1, startTime: -1 });
AppointmentSchema.index({ status: 1, startTime: 1 });
AppointmentSchema.index({ startTime: 1 });
AppointmentSchema.index({ service: 1 });

export default model("Appointment", AppointmentSchema);