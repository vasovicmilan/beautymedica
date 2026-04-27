import mongoose from "mongoose";
import ContentBlockSchema from "./schemas/content.block.schema.js";
import ImageSchema from "./schemas/image.schema.js";
import FAQSchema from "./schemas/faq.schema.js";

const { Schema, model } = mongoose;

const PostSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true
    },

    status: {
      type: String,
      enum: ["draft", "published", "featured"],
      default: "draft",
      index: true
    },

    /**
     * ✅ EXPERT umesto USER
     */
    expert: {
      type: Schema.Types.ObjectId,
      ref: "Expert",
      required: true,
      index: true
    },

    /**
     * CONTENT
     */
    content: {
      type: [ContentBlockSchema],
      required: true
    },

    /**
     * MEDIA
     */
    image: {
      type: ImageSchema,
      required: true
    },

    /**
     * TAXONOMY
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
     * SEO
     */
    description: {
      type: String,
      required: true
    },

    shortDescription: {
      type: String,
      required: true
    },

    seoKeywords: [String],

    /**
     * ✅ FAQ reusable
     */
    faq: [FAQSchema],

    /**
     * SYSTEM
     */
    isIndexable: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  { timestamps: true }
);

/**
 * INDEXI
 */
PostSchema.index({ categories: 1 });
PostSchema.index({ tags: 1 });
PostSchema.index({ createdAt: -1 });

PostSchema.index({
  title: "text",
  description: "text",
  shortDescription: "text"
});

export default model("Post", PostSchema);