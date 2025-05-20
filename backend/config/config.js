import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars - check both potential locations
dotenv.config({ path: path.join(__dirname, "../..", ".env") });

// If MONGO_URI is still undefined, try loading from backend folder
if (!process.env.MONGO_URI) {
  dotenv.config({ path: path.join(__dirname, "..", ".env") });
}

// Export config object
export default {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET || "fallbacksecret",
  NODE_ENV: process.env.NODE_ENV || "development",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
};
