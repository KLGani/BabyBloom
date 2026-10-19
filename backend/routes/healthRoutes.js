const express = require("express");

const {
  createHealthRecord,
  getHealthRecords,
  getLatestHealthRecord,
  deleteHealthRecord,
} = require("../controllers/healthController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Create a new health record
router.post("/", protect, createHealthRecord);

// Get all health records
router.get("/", protect, getHealthRecords);

// Get latest health record
router.get("/latest", protect, getLatestHealthRecord);

// Delete a health record
router.delete("/:id", protect, deleteHealthRecord);

module.exports = router;