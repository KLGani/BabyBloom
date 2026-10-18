const express = require("express");
const router = express.Router();

const Appointment = require("../models/Appointment");
const authMiddleware = require("../middleware/authMiddleware");

// Create appointment
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      doctorName,
      clinic,
      date,
      time,
      type,
      notes,
    } = req.body;

    if (!doctorName || !date || !time) {
      return res.status(400).json({
        success: false,
        message: "Doctor name, date and time are required",
      });
    }

    const appointment = new Appointment({
      userId: req.userId,
      doctorName,
      clinic,
      date,
      time,
      type,
      notes,
    });

    await appointment.save();

    res.status(201).json({
      success: true,
      message: "Appointment created successfully",
      appointment,
    });
  } catch (error) {
    console.error("Create appointment error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create appointment",
    });
  }
});

// Get user's appointments
router.get("/", authMiddleware, async (req, res) => {
  try {
    const appointments = await Appointment.find({
      userId: req.userId,
    }).sort({ date: 1, time: 1 });

    res.status(200).json({
      success: true,
      appointments,
    });
  } catch (error) {
    console.error("Get appointments error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch appointments",
    });
  }
});

// Delete appointment
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Appointment deleted successfully",
    });
  } catch (error) {
    console.error("Delete appointment error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete appointment",
    });
  }
});

module.exports = router;