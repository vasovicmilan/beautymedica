// testimonial.model.js
import mongoose from "mongoose";

const { Schema, model } = mongoose;

const TestimonialSchema = new Schema(
  {
    // Ko ostavlja utisak (opciono – može i anonimno)
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    // Ime koje se prikazuje (ako je anoniman ili gost)
    displayName: {
      type: String,
      trim: true,
      default: "Anonymous",
    },

    // Ocena 1-5
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    // Komentar / utisak
    comment: {
      type: String,
      required: true,
      trim: true,
    },

    // Opciono: za koju uslugu (samo za info, ne obavezno)
    service: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      default: null,
    },

    // Opciono: za kojeg terapeuta
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },

    // Da li je odobreno za prikaz na sajtu
    approved: {
      type: Boolean,
      default: false,  // može i false pa admin odobrava
      index: true,
    },
  },
  { timestamps: true }
);

// Indeksi za brze agregacije (prosek, broj)
TestimonialSchema.index({ rating: -1 });
TestimonialSchema.index({ approved: 1, createdAt: -1 });

export default model("Testimonial", TestimonialSchema);