import { Schema, model } from "mongoose";

export const TAG_DOMAINS = [
  "service",
  "post"
];

// prilagođeno za beauty / medic / wellness
export const TAG_TYPES = [
  "body_part",     // stomak, noge, lice
  "goal",          // mršavljenje, relaksacija, detoks
  "technology",    // esma, manuelno
  "intensity",     // blaga, jaka
  "duration",      // kratko, dugo
  "custom"
];

const TagSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },

    domain: {
      type: String,
      required: true,
      enum: TAG_DOMAINS,
      index: true
    },

    type: {
      type: String,
      required: true,
      enum: TAG_TYPES,
      index: true
    },

    isIndexable: {
      type: Boolean,
      default: true,
      index: true
    },

    shortDescription: {
      type: String,
      trim: true,
    },

    longDescription: {
      type: String,
    },

    meta: {
      priority: {
        type: Number,
        default: 0
      },
      isActive: {
        type: Boolean,
        default: true,
        index: true
      }
    }
  },
  {
    timestamps: true
  }
);

// jedinstven tag po domenu + tipu
TagSchema.index(
  { slug: 1, domain: 1, type: 1 },
  { unique: true }
);

TagSchema.index({ domain: 1, type: 1 });
TagSchema.index({ domain: 1, isIndexable: 1 });

export default model("Tag", TagSchema);