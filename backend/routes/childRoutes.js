const express = require("express");

const {
  getChildProfile,
  createChildProfile,
  updateChildProfile,
} = require("../controllers/childController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getChildProfile);

router.post("/", protect, createChildProfile);

router.put("/", protect, updateChildProfile);

module.exports = router;