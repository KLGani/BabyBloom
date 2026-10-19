const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI?.trim();

  if (!mongoUri) {
    throw new Error(
      "MONGO_URI is not configured. Set it to your MongoDB Atlas connection string."
    );
  }

  try {
    console.log("Connecting to MongoDB...");
    const conn = await mongoose.connect(mongoUri);

    console.log(`🌸 MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    throw new Error(`MongoDB connection failed: ${error.message}`, {
      cause: error,
    });
  }
};

module.exports = connectDB;