import mongoose from "mongoose";
import { encrypt } from "../services/crypto.service.js";

const { Schema, model } = mongoose;

const ContactSchema = new Schema(
  {
    /**
     * BASIC INFO
     */
    firstName: {
      type: String,
      required: true,
      trim: true
    },

    lastName: {
      type: String,
      trim: true
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true
    },

    phone: {
      type: String,
      trim: true
    },

    /**
     * OPTIONAL: ako je user registrovan
     */
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true
    },

    /**
     * TIP PORUKE (BITNO)
     */
    type: {
      type: String,
      enum: ["contact", "reservation", "question", "complaint"],
      default: "contact",
      index: true
    },

    /**
     * CONTENT
     */
    title: {
      type: String,
      required: true,
      trim: true
    },

    message: {
      type: String,
      required: true,
      trim: true
    },

    /**
     * PRIVACY
     */
    acceptance: {
      type: Boolean,
      required: true,
      default: true
    },

    /**
     * ADMIN WORKFLOW
     */
    status: {
      type: String,
      enum: ["new", "in-progress", "resolved"],
      default: "new",
      index: true
    },

    /**
     * INTERNA NAPOMENA (admin)
     */
    note: {
      type: String
    },

    /**
     * DA LI JE ODGOVORENO
     */
    respondedAt: Date
  },
  { timestamps: true }
);

/**
 * INDEXI
 */
ContactSchema.index({ createdAt: -1 });
ContactSchema.index({ status: 1, createdAt: -1 });

/**
 * ENCRYPT (selektivno)
 */
ContactSchema.pre("save", function () {
  if (this.isModified("phone") && this.phone) {
    this.phone = encrypt(this.phone);
  }

  if (this.isModified("message")) {
    this.message = encrypt(this.message);
  }
});

export default model("Contact", ContactSchema);