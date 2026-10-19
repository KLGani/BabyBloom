
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");

const MedicalReport = require("../models/MedicalReport");

// Keep uploaded reports outside public/static folders.
const REPORTS_DIR = path.resolve(
  process.env.REPORTS_DIR || path.join(__dirname, "../private-reports")
);

fs.mkdirSync(REPORTS_DIR, { recursive: true });

const ALLOWED_TYPES = {
  "application/pdf": ".pdf",
  "image/jpeg": ".jpg",
  "image/png": ".png",
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, REPORTS_DIR);
  },

  filename: (req, file, callback) => {
    callback(null, `${crypto.randomUUID()}${ALLOWED_TYPES[file.mimetype] || ".bin"}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
  fileFilter: (req, file, callback) => {
    if (!Object.prototype.hasOwnProperty.call(ALLOWED_TYPES, file.mimetype)) {
      return callback(
        new Error("Only PDF, JPG, and PNG reports are allowed.")
      );
    }

    callback(null, true);
  },
});

function getUserId(req) {
  return req.userId || req.user?.id || req.user?._id;
}

// Validate actual file signatures instead of trusting the extension or MIME type.
async function hasValidSignature(filePath, mimeType) {
  const handle = await fs.promises.open(filePath, "r");

  try {
    const buffer = Buffer.alloc(8);
    const { bytesRead } = await handle.read(buffer, 0, 8, 0);
    const header = buffer.subarray(0, bytesRead);

    if (mimeType === "application/pdf") {
      return header.subarray(0, 5).toString() === "%PDF-";
    }

    if (mimeType === "image/jpeg") {
      return (
        header.length >= 3 &&
        header[0] === 0xff &&
        header[1] === 0xd8 &&
        header[2] === 0xff
      );
    }

    if (mimeType === "image/png") {
      return (
        header.length >= 8 &&
        header.equals(
          Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
        )
      );
    }

    return false;
  } finally {
    await handle.close();
  }
}

function safeReport(report) {
  return {
    _id: report._id,
    title: report.title,
    category: report.category,
    reportDate: report.reportDate,
    originalName: report.originalName,
    mimeType: report.mimeType,
    size: report.size,
    createdAt: report.createdAt,
  };
}

// POST /api/reports
// Multipart fields: file, title, category, reportDate
exports.uploadReport = [
  upload.single("file"),
  async (req, res) => {
    let savedFilePath;

    try {
      const userId = getUserId(req);

      if (!userId) {
        if (req.file) {
          await fs.promises.unlink(req.file.path).catch(() => {});
        }

        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please select a PDF, JPG, or PNG file.",
        });
      }

      savedFilePath = req.file.path;

      if (!(await hasValidSignature(savedFilePath, req.file.mimetype))) {
        await fs.promises.unlink(savedFilePath).catch(() => {});

        return res.status(400).json({
          success: false,
          message: "The selected file does not match its file type.",
        });
      }

      const title = String(req.body.title || "").trim();
      const category = String(req.body.category || "Other").trim();
      const reportDate = new Date(req.body.reportDate);

      const allowedCategories = [
        "Blood Test",
        "Ultrasound",
        "Prescription",
        "Scan",
        "Other",
      ];

      if (!title || title.length > 120) {
        await fs.promises.unlink(savedFilePath).catch(() => {});

        return res.status(400).json({
          success: false,
          message: "Enter a report title of up to 120 characters.",
        });
      }

      if (!allowedCategories.includes(category)) {
        await fs.promises.unlink(savedFilePath).catch(() => {});

        return res.status(400).json({
          success: false,
          message: "Invalid report category.",
        });
      }

      if (!req.body.reportDate || Number.isNaN(reportDate.getTime())) {
        await fs.promises.unlink(savedFilePath).catch(() => {});

        return res.status(400).json({
          success: false,
          message: "Enter a valid report date.",
        });
      }

      const report = await MedicalReport.create({
        userId,
        title,
        category,
        reportDate,
        originalName: path.basename(req.file.originalname).slice(0, 200),
        storedName: req.file.filename,
        mimeType: req.file.mimetype,
        size: req.file.size,
      });

      return res.status(201).json({
        success: true,
        message: "Medical report uploaded successfully.",
        report: safeReport(report),
      });
    } catch (error) {
      if (savedFilePath) {
        await fs.promises.unlink(savedFilePath).catch(() => {});
      }

      console.error("Upload report error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to upload the report.",
      });
    }
  },
];

// GET /api/reports
exports.getReports = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const reports = await MedicalReport.find({ userId })
      .sort({ reportDate: -1, createdAt: -1 })
      .select("-storedName -userId -__v")
      .lean();

    return res.json({
      success: true,
      reports,
    });
  } catch (error) {
    console.error("Get reports error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve reports.",
    });
  }
};

// Find a report only if it belongs to the authenticated user.
async function findOwnedReport(userId, reportId) {
  if (!userId || !/^[a-f\d]{24}$/i.test(reportId || "")) {
    return null;
  }

  return MedicalReport.findOne({
    _id: reportId,
    userId,
  });
}

// GET /api/reports/:id/view
exports.viewReport = async (req, res) => {
  try {
    const report = await findOwnedReport(getUserId(req), req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found.",
      });
    }

    const filePath = path.resolve(REPORTS_DIR, report.storedName);

    if (path.dirname(filePath) !== REPORTS_DIR) {
      return res.status(400).json({
        success: false,
        message: "Invalid report file.",
      });
    }

    await fs.promises.access(filePath, fs.constants.R_OK);

    res.setHeader("Content-Type", report.mimeType);
    res.setHeader("Content-Disposition", "inline");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "private, no-store");

    return res.sendFile(filePath);
  } catch (error) {
    if (error.code === "ENOENT") {
      return res.status(404).json({
        success: false,
        message: "Report file is missing from storage.",
      });
    }

    console.error("View report error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to open the report.",
    });
  }
};

// GET /api/reports/:id/download
exports.downloadReport = async (req, res) => {
  try {
    const report = await findOwnedReport(getUserId(req), req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found.",
      });
    }

    const filePath = path.resolve(REPORTS_DIR, report.storedName);

    if (path.dirname(filePath) !== REPORTS_DIR) {
      return res.status(400).json({
        success: false,
        message: "Invalid report file.",
      });
    }

    await fs.promises.access(filePath, fs.constants.R_OK);

    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");

    return res.download(filePath, report.originalName, (error) => {
      if (error && !res.headersSent) {
        console.error("Download report error:", error);

        res.status(500).json({
          success: false,
          message: "Unable to download the report.",
        });
      }
    });
  } catch (error) {
    if (error.code === "ENOENT") {
      return res.status(404).json({
        success: false,
        message: "Report file is missing from storage.",
      });
    }

    console.error("Download report error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to download the report.",
    });
  }
};

// DELETE /api/reports/:id
exports.deleteReport = async (req, res) => {
  try {
    const report = await findOwnedReport(getUserId(req), req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found.",
      });
    }

    const filePath = path.resolve(REPORTS_DIR, report.storedName);

    await report.deleteOne();

    await fs.promises.unlink(filePath).catch((error) => {
      if (error.code !== "ENOENT") {
        console.error("Could not remove report file:", error);
      }
    });

    return res.json({
      success: true,
      message: "Medical report deleted successfully.",
    });
  } catch (error) {
    console.error("Delete report error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete the report.",
    });
  }
};
