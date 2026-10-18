const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    dosage: {
      type: String,
      required: true,
      trim: true,
    },

    frequency: {
      type: String,
      required: true,
      enum: [
        "Once daily",
        "Twice daily",
        "Three times daily",
        "As prescribed",
      ],
    },

    times: {
      type: [String],
      required: true,
      validate: {
        validator: function (value) {
          return value.length > 0 && value.every((time) => time.trim());
        },
        message: "At least one valid reminder time is required.",
      },
    },

    startDate: {
      type: String,
      default: "",
    },

    endDate: {
      type: String,
      default: "",
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

module.exports = mongoose.model("Medicine", medicineSchema);