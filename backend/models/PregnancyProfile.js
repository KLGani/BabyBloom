const mongoose = require("mongoose");

const pregnancyProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    pregnancyWeek: {
      type: Number,
      min: 1,
      max: 42,
      default: null,
    },

    dueDate: {
      type: Date,
      default: null,
    },

    bloodGroup: {
      type: String,
      default: "",
      trim: true,
    },

    height: {
      type: Number,
      default: null,
    },

    prePregnancyWeight: {
      type: Number,
      default: null,
    },

    currentWeight: {
      type: Number,
      default: null,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "PregnancyProfile",
  pregnancyProfileSchema
);