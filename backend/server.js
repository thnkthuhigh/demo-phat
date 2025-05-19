import express from "express";
import http from "http";
import { Server } from "socket.io";
import config from "./config/config.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import caseRoutes from "./routes/caseRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import authRoutes from "./routes/authRoutes.js"; // Thêm import
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import morgan from "morgan";
import adminRoutes from "./routes/adminRoutes.js";
// Thử import colors, nếu không có thì bỏ qua
let colors;
try {
  colors = await import("colors");
} catch (error) {
  console.log("Colors package not found, continuing without colors");
  // Tạo một polyfill đơn giản cho colors
  colors = {
    default: {
      yellow: {
        bold: (text) => text,
      },
      cyan: {
        underline: (text) => text,
      },
    },
  };
}

// connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Log requests in development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Lấy đường dẫn hiện tại
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Kiểm tra và tạo thư mục uploads với quyền đầy đủ
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`Created uploads directory at ${uploadsDir}`);
}

// Phục vụ thư mục uploads như một thư mục tĩnh
app.use("/uploads", express.static(uploadsDir));

// Middleware log request
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// Trong server.js, thêm baseUrl vào res.locals để sử dụng trong routes
app.use((req, res, next) => {
  res.locals.baseUrl = `${req.protocol}://${req.get("host")}`;
  next();
});

// Basic upload route directly in server.js for testing
app.post("/api/upload-test", (req, res) => {
  res.status(200).json({ message: "Upload test endpoint" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/cases", caseRoutes);
app.use("/api/users", userRoutes);
app.use("/api/supports", supportRoutes);
app.use("/api/messages", messageRoutes);

// Debug middleware to log all routes
app.use((req, res, next) => {
  console.log(`Route accessed: ${req.method} ${req.originalUrl}`);
  next();
});

// Import uploadRoutes nếu file tồn tại
try {
  const { default: uploadRoutes } = await import("./routes/uploadRoutes.js");
  app.use("/api/uploads", uploadRoutes);
  console.log("Upload routes loaded successfully");
} catch (error) {
  console.error("Error loading upload routes:", error.message);
  // Tạo route tạm thời
  app.use("/api/uploads", (req, res) => {
    res
      .status(503)
      .json({ message: "Upload service is temporarily unavailable" });
  });
}

// Import adminRoutes

// Sử dụng adminRoutes
app.use("/api/admin", adminRoutes);

// Middleware xử lý lỗi
app.use(notFound);
app.use(errorHandler);

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket.io events
io.on("connection", (socket) => {
  console.log("New client connected");

  // Join a room for a specific case
  socket.on("join_case", (caseId) => {
    socket.join(`case_${caseId}`);
    console.log(`User joined room: case_${caseId}`);
  });

  // Leave a room
  socket.on("leave_case", (caseId) => {
    socket.leave(`case_${caseId}`);
    console.log(`User left room: case_${caseId}`);
  });

  // Disconnect event
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Export io to use in controllers
export { io };

// Start server
const PORT = config.PORT;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
