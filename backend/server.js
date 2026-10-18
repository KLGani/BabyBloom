const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const pregnancyRoutes = require("./routes/pregnancyRoutes");
const childRoutes = require("./routes/childRoutes");
const healthRoutes = require("./routes/healthRoutes");
const appointmentRoutes = require("./routes/appointments");
const medicineRoutes = require("./routes/medicines");
const reportRoutes = require("./routes/reportRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Security
app.use(helmet());


// CORS
app.use(cors());

// JSON body parser with support for image uploads
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use("/api", limiter);

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Little Bloom API is running 🌸",
  });
});

app.get("/api/status", (req, res) => {
  res.json({
    success: true,
    message: "Little Bloom backend is healthy 🌸",
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/pregnancy", pregnancyRoutes);
app.use("/api/child", childRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/vaccinations", require("./routes/vaccinations"));
app.use("/api/journal", require("./routes/journalRoutes"));
app.use("/api/chatbot", require("./routes/chatbotRoutes"));

// Start server
if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🌸 Little Bloom server running on port ${PORT}`);
    });
  });
}

module.exports = app;