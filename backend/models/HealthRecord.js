const mongoose = require("mongoose");

const healthRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    mode: {
      type: String,
      enum: ["pregnancy", "child"],
      required: true,
    },

    date: {
      type: Date,
      default: Date.now,
    },

    bloodPressure: {
      type: String,
      default: "",
      trim: true,
    },

    heartRate: {
      type: Number,
      default: null,
    },

    temperature: {
      type: Number,
      default: null,
    },

    bloodSugar: {
      type: Number,
      default: null,
    },

    weight: {
      type: Number,
      default: null,
    },

    height: {
      type: Number,
      default: null,
    },

    symptoms: {
      type: String,
      default: "",
      trim: true,
    },

    mood: {
      type: String,
      default: "",
      trim: true,
    },

    appetite: {
      type: String,
      default: "",
      trim: true,
    },

    sleepHours: {
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
  "HealthRecord",
  healthRecordSchema
);