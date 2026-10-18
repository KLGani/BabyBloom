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
    const { childName, dateOfBirth, gender, bloodGroup, height, weight, notes } =
      req.body;

    if (!childName?.trim() || !dateOfBirth) {
      return res.status(400).json({
        success: false,
        message: "Child name and date of birth are required.",
      });
    }

    const profile = await ChildProfile.findOneAndUpdate(
      { userId: req.userId },
      {
        $set: {
          childName,
          dateOfBirth,
          gender,
          bloodGroup,
          height,
          weight,
          notes,
        },
        $setOnInsert: { userId: req.userId },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    res.json({
      success: true,
      message: "Child profile saved successfully.",
      profile,
    });
  } catch (error) {
    console.error("Create child profile error:", error);

    const status = error.name === "ValidationError" || error.name === "CastError"
      ? 400
      : 500;

    res.status(status).json({
      success: false,
      message: status === 400
        ? error.message
        : "Server error while saving child profile.",
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