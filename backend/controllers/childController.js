const ChildProfile = require("../models/ChildProfile");

const getChildProfile = async (req, res) => {
  try {
    const profile = await ChildProfile.findOne({
      userId: req.userId,
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Child profile not found.",
      });
    }

    res.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Get child profile error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching child profile.",
    });
  }
};

const createChildProfile = async (req, res) => {
  try {
    const existingProfile = await ChildProfile.findOne({
      userId: req.userId,
    });

    if (existingProfile) {
      return res.status(409).json({
        success: false,
        message: "Child profile already exists.",
      });
    }

    const profile = await ChildProfile.create({
      userId: req.userId,
      childName: req.body.childName,
      dateOfBirth: req.body.dateOfBirth,
      gender: req.body.gender,
      bloodGroup: req.body.bloodGroup,
      height: req.body.height,
      weight: req.body.weight,
      notes: req.body.notes,
    });

    res.status(201).json({
      success: true,
      message: "Child profile created successfully.",
      profile,
    });
  } catch (error) {
    console.error("Create child profile error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while creating child profile.",
    });
  }
};

const updateChildProfile = async (req, res) => {
  try {
    const profile = await ChildProfile.findOneAndUpdate(
      { userId: req.userId },
      {
        childName: req.body.childName,
        dateOfBirth: req.body.dateOfBirth,
        gender: req.body.gender,
        bloodGroup: req.body.bloodGroup,
        height: req.body.height,
        weight: req.body.weight,
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
        message: "Child profile not found.",
      });
    }

    res.json({
      success: true,
      message: "Child profile updated successfully.",
      profile,
    });
  } catch (error) {
    console.error("Update child profile error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while updating child profile.",
    });
  }
};

module.exports = {
  getChildProfile,
  createChildProfile,
  updateChildProfile,
};