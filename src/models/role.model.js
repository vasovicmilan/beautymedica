import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const roleSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: ['admin', 'employee', 'user'],
    },

    permissions: [
      {
        type: String,
        enum: [
          'manage_users',
          'manage_roles',
          'manage_services',
          'manage_all_reservations',
          'manage_free_reservation',
          'manage_own_reservations',
          'view_dashboard',
          'manage_packages',
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default model('Role', roleSchema);