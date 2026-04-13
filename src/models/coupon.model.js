import mongoose from "mongoose";

const { Schema, model } = mongoose;

const CouponSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },

    /**
     * TIP KUPONA
     */
    type: {
      type: String,
      enum: ["welcome", "promo", "limited"],
      required: true
    },

    /**
     * POPUST
     */
    discount: {
      type: Number,
      required: true,
      min: 1,
      max: 100
    },

    /**
     * LIMITI
     */
    maxUses: {
      type: Number,
      default: null // null = neograničeno
    },

    usedCount: {
      type: Number,
      default: 0
    },

    /**
     * OGRANIČENJE PO USERU
     */
    perUserLimit: {
      type: Number,
      default: 1
    },

    usedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    /**
     * VREME
     */
    startDate: Date,
    endDate: Date,

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

CouponSchema.index({ code: 1 });
CouponSchema.index({ isActive: 1 });
CouponSchema.index({ startDate: 1, endDate: 1 });

export default model("Coupon", CouponSchema);