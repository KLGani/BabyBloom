const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  getJournals,
  createJournal,
  updateJournal,
  deleteJournal,
} = require("../controllers/journalController");

router.get("/", protect, getJournals);
router.post("/", protect, createJournal);
router.put("/:id", protect, updateJournal);
router.delete("/:id", protect, deleteJournal);

module.exports = router;
