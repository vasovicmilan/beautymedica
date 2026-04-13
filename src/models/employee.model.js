import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const workingHoursSchema = new Schema(
  {
    day: {
      type: String,
      enum: [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
      ],
      required: true,
    },
    slots: [
      {
        from: String, // "09:00"
        to: String,   // "17:00"
      },
    ],
  },
  { _id: false }
);

const employeeSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    services: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Service',
      },
    ],

    workingHours: [workingHoursSchema],

    isActive: {
      type: Boolean,
      default: true,
    },

    notes: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default model('Employee', employeeSchema);