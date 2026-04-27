import mongoose from "mongoose";
import ImageSchema from "./schemas/image.schema.js";
import FAQSchema from "./schemas/faq.schema.js";

const { Schema, model } = mongoose;

/**
 * FEATURES (šta servis radi)
 */
const serviceFeatureSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    description: {
      type: String,
      required: true
    },

    icon: {
      type: String // npr "bi bi-lightning-charge"
    },

    order: {
      type: Number,
      default: 0
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  { _id: true }
);

/**
 * PACKAGES (kako se servis prodaje)
 */
const servicePackageSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    /**
     * broj tretmana
     */
    sessions: {
      type: Number,
      required: true
    },

    /**
     * ukupna cena paketa
     */
    totalPrice: {
      type: Number,
      required: true
    },

    /**
     * opcionalno - za prikaz uštede
     */
    basePrice: {
      type: Number
    },

    /**
     * UI
     */
    badge: {
      type: String // npr "NAJBOLJE"
    },

    isBest: {
      type: Boolean,
      default: false
    },

    order: {
      type: Number,
      default: 0
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  { _id: true }
);

/**
 * COMPARISON TABLE
 */
const comparisonRowSchema = new Schema(
  {
    label: {
      type: String,
      required: true
    },

    values: {
      type: [String],
      required: true
    }
  },
  { _id: false }
);

/**
 * SERVICE
 */
const serviceSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    shortDescription: String,

    longDescription: String,

    type: {
      type: String,
      enum: ["esma", "massage"],
      required: true,
      index: true
    },

    /**
     * CATEGORY / TAG
     */
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category"
      }
    ],

    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: "Tag"
      }
    ],

    /**
     * MEDIA
     */
    image: {
      type: ImageSchema,
      required: true
    },

    gallery: [ImageSchema],

    /**
     * SEO
     */
    seoKeywords: [String],

    /**
     * UI
     */
    highlight: {
      type: Boolean,
      default: false
    },

    ctaText: {
      type: String,
      default: "Zakaži konsultaciju"
    },

    /**
     * FEATURES (desne kartice)
     */
    features: {
      type: [serviceFeatureSchema],
      default: []
    },

    /**
     * PACKAGES (cenovnik)
     */
    packages: {
      type: [servicePackageSchema],
      default: []
    },

    /**
     * TABELA (Basic / Pro / Premium)
     */
    comparisonColumns: {
      type: [String],
      default: []
    },

    comparisonTable: {
      type: [comparisonRowSchema],
      default: []
    },

    /**
     * FAQ na nivou servisa
     */
    faq: [FAQSchema],

    /**
     * EMPLOYEES
     */
    employees: [
      {
        type: Schema.Types.ObjectId,
        ref: "Employee"
      }
    ],

    /**
     * SYSTEM
     */
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  { timestamps: true }
);

serviceSchema.pre('save', function(next) {
  if (this.comparisonTable && this.comparisonColumns.length) {
    for (let row of this.comparisonTable) {
      if (row.values.length !== this.comparisonColumns.length) {
        next(new Error(`Row "${row.label}" has ${row.values.length} values but ${this.comparisonColumns.length} columns`));
      }
    }
  }
  next();
});

/**
 * INDEXI
 */
serviceSchema.index({ type: 1, isActive: 1 });
serviceSchema.index({ categories: 1 });
serviceSchema.index({ tags: 1 });

export default model("Service", serviceSchema);