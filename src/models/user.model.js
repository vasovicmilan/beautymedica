import mongoose from "mongoose";
const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    googleId: {
      type: String,
      required: true,
      unique: true,
    },

    phone: {
      type: String,
      default: null,
    },

    roleId: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
    },

    acceptedTerms: {
      type: Boolean,
      default: false,
    },

    avatar: {
      type: String,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// INDEXES (bitno za performanse)
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });

export default model('User', userSchema);