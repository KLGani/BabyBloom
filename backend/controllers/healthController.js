const HealthRecord = require("../models/HealthRecord");

// =====================================================
// CREATE HEALTH RECORD
// =====================================================

const createHealthRecord = async (req, res) => {
  try {
    const {
      mode,
      date,
      bloodPressure,
      heartRate,
      temperature,
      bloodSugar,
      weight,
      height,
      symptoms,
      mood,
      appetite,
      sleepHours,
      notes,
    } = req.body;

    // Basic validation
    if (!mode) {
      return res.status(400).json({
        success: false,
        message: "Mode is required.",
      });
    }

    if (!["pregnancy", "child"].includes(mode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid health mode.",
      });
    }

    const healthRecord = await HealthRecord.create({
      userId: req.userId,
      mode,
      date: date || new Date(),
      bloodPressure: bloodPressure || "",
      heartRate:
        heartRate !== undefined &&
        heartRate !== null &&
        heartRate !== ""
          ? Number(heartRate)
          : null,
      temperature:
        temperature !== undefined &&
        temperature !== null &&
        temperature !== ""
          ? Number(temperature)
          : null,
      bloodSugar:
        bloodSugar !== undefined &&
        bloodSugar !== null &&
        bloodSugar !== ""
          ? Number(bloodSugar)
          : null,
      weight:
        weight !== undefined &&
        weight !== null &&
        weight !== ""
          ? Number(weight)
          : null,
      height:
        height !== undefined &&
        height !== null &&
        height !== ""
          ? Number(height)
          : null,
      symptoms: symptoms || "",
      mood: mood || "",
      appetite: appetite || "",
      sleepHours:
        sleepHours !== undefined &&
        sleepHours !== null &&
        sleepHours !== ""
          ? Number(sleepHours)
          : null,
      notes: notes || "",
    });

    res.status(201).json({
      success: true,
      message: "Health record saved successfully.",
      record: healthRecord,
    });
  } catch (error) {
    console.error("Create health record error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while saving health record.",
    });
  }
};

// =====================================================
// GET ALL HEALTH RECORDS
// =====================================================

const getHealthRecords = async (req, res) => {
  try {
    const { mode } = req.query;

    const filter = {
      userId: req.userId,
    };

    if (mode) {
      if (!["pregnancy", "child"].includes(mode)) {
        return res.status(400).json({
          success: false,
          message: "Invalid health mode.",
        });
      }

      filter.mode = mode;
    }

    const records = await HealthRecord.find(filter).sort({
      date: -1,
      createdAt: -1,
    });

    res.json({
      success: true,
      count: records.length,
      records,
    });
  } catch (error) {
    console.error("Get health records error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching health records.",
    });
  }
};

// =====================================================
// GET LATEST HEALTH RECORD
// =====================================================

const getLatestHealthRecord = async (req, res) => {
  try {
    const { mode } = req.query;

    const filter = {
      userId: req.userId,
    };

    if (mode) {
      if (!["pregnancy", "child"].includes(mode)) {
        return res.status(400).json({
          success: false,
          message: "Invalid health mode.",
        });
      }

      filter.mode = mode;
    }

    const record = await HealthRecord.findOne(filter).sort({
      date: -1,
      createdAt: -1,
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "No health record found.",
      });
    }

    res.json({
      success: true,
      record,
    });
  } catch (error) {
    console.error("Get latest health record error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching latest health record.",
    });
  }
};

// =====================================================
// DELETE HEALTH RECORD
// =====================================================

const deleteHealthRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await HealthRecord.findOneAndDelete({
      _id: id,
      userId: req.userId,
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Health record not found.",
      });
    }

    res.json({
      success: true,
      message: "Health record deleted successfully.",
    });
  } catch (error) {
    console.error("Delete health record error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while deleting health record.",
    });
  }
};

module.exports = {
  createHealthRecord,
  getHealthRecords,
  getLatestHealthRecord,
  deleteHealthRecord,
};