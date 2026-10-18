const PregnancyProfile = require("../models/PregnancyProfile");

const getPregnancyProfile = async (req, res) => {
  try {
    const profile = await PregnancyProfile.findOne({
      userId: req.userId,
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Pregnancy profile not found.",
      });
    }

    res.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Get pregnancy profile error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching pregnancy profile.",
    });
  }
};

const createPregnancyProfile = async (req, res) => {
  try {
    const existingProfile = await PregnancyProfile.findOne({
      userId: req.userId,
    });

    if (existingProfile) {
      return res.status(409).json({
        success: false,
        message: "Pregnancy profile already exists.",
      });
    }

    const profile = await PregnancyProfile.create({
      userId: req.userId,
      pregnancyWeek: req.body.pregnancyWeek,
      dueDate: req.body.dueDate,
      bloodGroup: req.body.bloodGroup,
      height: req.body.height,
      prePregnancyWeight: req.body.prePregnancyWeight,
      currentWeight: req.body.currentWeight,
      notes: req.body.notes,
    });

    res.status(201).json({
      success: true,
      message: "Pregnancy profile created successfully.",
      profile,
    });
  } catch (error) {
    console.error("Create pregnancy profile error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while creating pregnancy profile.",
    });
  }
};

const updatePregnancyProfile = async (req, res) => {
  try {
    const profile = await PregnancyProfile.findOneAndUpdate(
      { userId: req.userId },
      {
        pregnancyWeek: req.body.pregnancyWeek,
        dueDate: req.body.dueDate,
        bloodGroup: req.body.bloodGroup,
        height: req.body.height,
        prePregnancyWeight: req.body.prePregnancyWeight,
        currentWeight: req.body.currentWeight,
        notes: req.body.notes,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Pregnancy profile not found.",
      });
    }

    res.json({
      success: true,
      message: "Pregnancy profile updated successfully.",
      profile,
    });
  } catch (error) {
    console.error("Update pregnancy profile error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while updating pregnancy profile.",
    });
  }
};

module.exports = {
  getPregnancyProfile,
  createPregnancyProfile,
  updatePregnancyProfile,
};