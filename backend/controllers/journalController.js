const Journal = require("../models/Journal");

// Get all journals for the logged-in user
exports.getJournals = async (req, res) => {
  try {
    const journals = await Journal.find({ userId: req.userId }).sort({
      date: -1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      journals,
    });
  } catch (error) {
    console.error("Get journals error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve journal entries",
    });
  }
};

// Create a new journal entry
exports.createJournal = async (req, res) => {
  try {
    const { title, content, mood, date, week, tags, photo } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
    }

    const journal = new Journal({
      userId: req.userId,
      title: title.trim(),
      content: content.trim(),
      mood: mood || "😊",
      date: date ? new Date(date) : new Date(),
      week: week || null,
      photo: photo || "",
      tags: Array.isArray(tags) ? tags : [],
    });

    await journal.save();

    return res.status(201).json({
      success: true,
      message: "Journal entry saved successfully 🌸",
      journal,
    });
  } catch (error) {
    console.error("Create journal error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save journal entry",
    });
  }
};

// Update an existing journal entry
exports.updateJournal = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, mood, date, week, tags, photo } = req.body;

    const updated = await Journal.findOneAndUpdate(
      { _id: id, userId: req.userId },
      {
        ...(title && { title: title.trim() }),
        ...(content && { content: content.trim() }),
        ...(mood && { mood }),
        ...(date && { date: new Date(date) }),
        ...(week !== undefined && { week }),
        ...(photo !== undefined && { photo }),
        ...(tags && { tags }),
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Journal entry not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Journal entry updated",
      journal: updated,
    });
  } catch (error) {
    console.error("Update journal error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update journal entry",
    });
  }
};

// Delete a journal entry
exports.deleteJournal = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Journal.findOneAndDelete({
      _id: id,
      userId: req.userId,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Journal entry not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Journal entry deleted",
    });
  } catch (error) {
    console.error("Delete journal error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete journal entry",
    });
  }
};
