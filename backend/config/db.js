import mongoose from "mongoose";
import config from "./config.js";

const connectDB = async () => {
  try {
    // Check if MONGO_URI is defined
    if (!config.MONGO_URI) {
      console.error("Error: MONGO_URI is not defined in environment variables");
      console.error("Please check your .env file location and format");
      process.exit(1);
    }

    console.log(`Attempting to connect to MongoDB...`);
    const conn = await mongoose.connect(config.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
