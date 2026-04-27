import mongoose from "mongoose";
import ImageSchema from "./schemas/image.schema.js";

const { Schema, model } = mongoose;

const ExpertSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true
    },

    lastName: {
      type: String,
      required: true,
      trim: true
    },

    title: {
      type: String,
      required: true
      // npr: "Specijalista fizijatrije"
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true
    },

    bio: {
      type: String
    },

    image: {
      type: ImageSchema,
      required: true
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  { timestamps: true }
);

export default model("Expert", ExpertSchema);