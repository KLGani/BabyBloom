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
    const {
      pregnancyWeek,
      dueDate,
      bloodGroup,
      height,
      prePregnancyWeight,
      currentWeight,
      notes,
    } = req.body || {};

    if (
      pregnancyWeek === undefined ||
      pregnancyWeek === null ||
      !Number.isFinite(Number(pregnancyWeek)) ||
      Number(pregnancyWeek) < 1 ||
      Number(pregnancyWeek) > 42
    ) {
      return res.status(400).json({
        success: false,
        message: "Pregnancy week must be a number between 1 and 42.",
      });
    }

    const profile = await PregnancyProfile.findOneAndUpdate(
      { userId: req.userId },
      {
        $set: {
          pregnancyWeek: Number(pregnancyWeek),
          dueDate: dueDate || null,
          bloodGroup: bloodGroup || "",
          height: height ?? null,
          prePregnancyWeight: prePregnancyWeight ?? null,
          currentWeight: currentWeight ?? null,
          notes: notes || "",
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

    return res.status(200).json({
      success: true,
      message: "Pregnancy profile saved successfully.",
      profile,
    });
  } catch (error) {
    console.error("Create pregnancy profile error:", error);
    const isInvalidProfile =
      error.name === "ValidationError" || error.name === "CastError";

    return res.status(isInvalidProfile ? 400 : 500).json({
      success: false,
      message: isInvalidProfile
        ? error.message
        : "Server error while saving pregnancy profile.",
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