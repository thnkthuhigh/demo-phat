import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB Atlas...");
    console.log(
      "Connection string format check:",
      process.env.MONGO_URI ? "Found" : "Missing"
    );

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 60000, // Tăng timeout lên 60 giây
      socketTimeoutMS: 60000,
      connectTimeoutMS: 60000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
};

export default connectDB;
