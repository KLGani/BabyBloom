const express = require("express");
const router = express.Router();

const Medicine = require("../models/Medicine");
const authMiddleware = require("../middleware/authMiddleware");

// Add a new medicine
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      name,
      dosage,
      frequency,
      times,
      startDate,
      endDate,
      notes,
    } = req.body;

    if (
      !name?.trim() ||
      !dosage?.trim() ||
      !frequency ||
      !Array.isArray(times) ||
      times.length === 0 ||
      times.some((time) => typeof time !== "string" || !time.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide the medicine details and at least one reminder time.",
      });
    }

    const medicine = await Medicine.create({
      userId: req.userId,
      name: name.trim(),
      dosage: dosage.trim(),
      frequency,
      times: times.map((time) => time.trim()),
      startDate: startDate || "",
      endDate: endDate || "",
      notes: notes || "",
    });

    res.status(201).json({
      success: true,
      message: "Medicine saved successfully.",
      medicine,
    });
  } catch (error) {
    console.error("Add medicine error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to save medicine.",
    });
  }
});

// Get medicines belonging to the logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const medicines = await Medicine.find({
      userId: req.userId,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      medicines,
    });
  } catch (error) {
    console.error("Get medicines error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch medicines.",
    });
  }
});

// Delete a medicine belonging to the logged-in user
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const medicine = await Medicine.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found.",
      });
    }

    res.json({
      success: true,
      message: "Medicine deleted successfully.",
    });
  } catch (error) {
    console.error("Delete medicine error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to delete medicine.",
    });
  }
});

module.exports = router;