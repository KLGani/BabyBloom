const express = require("express");

const {
  getPregnancyProfile,
  createPregnancyProfile,
  updatePregnancyProfile,
} = require("../controllers/pregnancyController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getPregnancyProfile);

router.post("/", protect, createPregnancyProfile);

router.put("/", protect, updatePregnancyProfile);

module.exports = router;