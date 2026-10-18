
const express = require("express");
const router = express.Router();

const Vaccination = require("../models/Vaccination");
const authMiddleware = require("../middleware/authMiddleware");

// Create a vaccination
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, description, date, mode = "child" } = req.body;

    if (!name?.trim() || !date?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Vaccine name and date are required.",
      });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: "Date must use YYYY-MM-DD format.",
      });
    }

    const vaccinationMode = mode === "pregnancy" ? "pregnancy" : "child";

    // For pregnancy, check if this specific vaccine already exists; if so, update date/description
    if (vaccinationMode === "pregnancy") {
      const existing = await Vaccination.findOne({
        userId: req.userId,
        name: name.trim(),
        mode: "pregnancy",
      });

      if (existing) {
        existing.date = date;
        if (description) existing.description = description.trim();
        await existing.save();
        return res.status(200).json({
          success: true,
          message: `${name.trim()} record updated successfully.`,
          vaccination: existing,
        });
      }
    }

    const vaccination = await Vaccination.create({
      userId: req.userId,
      name: name.trim(),
      description: description?.trim() || "",
      date,
      mode: vaccinationMode,
      completed: false,
    });

    return res.status(201).json({
      success: true,
      message: "Vaccination saved successfully.",
      vaccination,
    });
  } catch (error) {
    console.error("Create vaccination error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save vaccination.",
    });
  }
});

// Get the logged-in user's vaccinations (optional ?mode=pregnancy|child)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const query = { userId: req.userId };
    if (req.query.mode) {
      query.mode = req.query.mode;
    }

    const vaccinations = await Vaccination.find(query).sort({ date: 1, createdAt: -1 });

    return res.json({
      success: true,
      vaccinations,
    });
  } catch (error) {
    console.error("Get vaccinations error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load vaccinations.",
    });
  }
});

// Update vaccination completion status
router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    if (typeof req.body.completed !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "A valid completed status is required.",
      });
    }

    const vaccination = await Vaccination.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId,
      },
      {
        completed: req.body.completed,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!vaccination) {
      return res.status(404).json({
        success: false,
        message: "Vaccination not found.",
      });
    }

    return res.json({
      success: true,
      vaccination,
    });
  } catch (error) {
    console.error("Update vaccination error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update vaccination.",
    });
  }
});

// Delete vaccination
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const vaccination = await Vaccination.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!vaccination) {
      return res.status(404).json({
        success: false,
        message: "Vaccination not found.",
      });
    }

    return res.json({
      success: true,
      message: "Vaccination deleted successfully.",
    });
  } catch (error) {
    console.error("Delete vaccination error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete vaccination.",
    });
  }
});

module.exports = router;
