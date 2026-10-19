const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    language: {
      type: String,
      enum: ["English", "Kannada", "Hindi"],
      default: "English",
    },

    mode: {
      type: String,
      enum: ["pregnancy", "child"],
      default: "pregnancy",
    },

    pregnancyWeek: {
      type: Number,
      default: null,
    },

    profileImage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);