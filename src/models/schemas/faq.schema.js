import mongoose from "mongoose";

const { Schema } = mongoose;

const FAQSchema = new Schema(
  {
    icon: {
      type: String
      // npr: "bi-question-circle"
    },

    question: {
      type: String,
      required: true,
      trim: true
    },

    answer: {
      type: String,
      required: true,
      trim: true
    }
  },
  { _id: false }
);

export default FAQSchema;