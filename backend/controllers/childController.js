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
    const {
      childName,
      dateOfBirth,
      gender,
      bloodGroup,
      height,
      weight,
      notes,
    } = req.body || {};

    if (
      typeof childName !== "string" ||
      !childName.trim() ||
      typeof dateOfBirth !== "string" ||
      !dateOfBirth.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Child name and date of birth are required.",
      });
    }

    const parsedDateOfBirth = new Date(dateOfBirth);
    if (
      Number.isNaN(parsedDateOfBirth.getTime()) ||
      parsedDateOfBirth.toISOString().slice(0, 10) !== dateOfBirth.slice(0, 10)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid date of birth in YYYY-MM-DD format.",
      });
    }

    for (const [field, value] of Object.entries({ height, weight })) {
      if (
        value !== undefined &&
        value !== null &&
        (!Number.isFinite(Number(value)) || Number(value) <= 0)
      ) {
        return res.status(400).json({
          success: false,
          message: `${field === "height" ? "Height" : "Weight"} must be a number greater than zero.`,
        });
      }
    }

    const profile = await ChildProfile.findOneAndUpdate(
      { userId: req.userId },
      {
        $set: {
          childName: childName.trim(),
          dateOfBirth: parsedDateOfBirth,
          gender: gender || "Other",
          bloodGroup: typeof bloodGroup === "string" ? bloodGroup.trim() : "",
          height: height == null ? null : Number(height),
          weight: weight == null ? null : Number(weight),
          notes: typeof notes === "string" ? notes.trim() : "",
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
      message: "Child profile saved successfully.",
      profile,
    });
  } catch (error) {
    console.error("Create child profile error:", error);

    const isInvalidProfile =
      error.name === "ValidationError" || error.name === "CastError";
    const status = isInvalidProfile
      ? 400
      : 500;

    return res.status(status).json({
      success: false,
      message: isInvalidProfile
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