
const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  uploadReport,
  getReports,
  viewReport,
  downloadReport,
  deleteReport,
} = require("../controllers/reportController");

const router = express.Router();

// All report endpoints require authentication.
router.use(protect);

// Upload a medical report.
router.post("/", uploadReport);

// Get the logged-in user's reports.
router.get("/", getReports);

// View a report in the browser or supported viewer.
router.get("/:id/view", viewReport);

// Download a report.
router.get("/:id/download", downloadReport);

// Delete a report and its stored file.
router.delete("/:id", deleteReport);

module.exports = router;
