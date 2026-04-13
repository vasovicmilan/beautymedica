import mongoose from "mongoose";
import ImageSchema from "./image.schema.js";

const { Schema } = mongoose;

const ContentBlockSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        "heading",
        "paragraph",
        "list",
        "image",
        "quote",
        "table"
      ]
    },

    data: {
      type: Schema.Types.Mixed,
      required: true
    }
  },
  { _id: false }
);

export default ContentBlockSchema;