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
import uploadRoutes from "./routes/uploadRoutes.js";
import dotenv from "dotenv";

// Cấu hình
dotenv.config();

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
app.use("/api/upload", uploadRoutes);

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
app.use("/api/admin", adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

// Thêm middleware ghi log cho các yêu cầu static file
app.use(
  "/uploads",
  (req, res, next) => {
    console.log(`Static file request: ${req.url}`);
    next();
  },
  express.static(path.join(__dirname, "../uploads"))
);

// Thêm middleware xử lý lỗi 404 cho file static
app.use((req, res, next) => {
  if (req.url.startsWith("/uploads/")) {
    console.error(`404 Not Found: ${req.url}`);
    return res.status(404).send("File not found");
  }
  next();
});

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

// Port và khởi động server
const PORT = process.env.PORT || 5000;

// Kết nối DB trước khi khởi động server
const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
  }
};

startServer();

// Thêm vào server.js để phục vụ files từ thư mục uploads

// Đoạn code này phải được thêm TRƯỚC định nghĩa các routes API
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Debug để kiểm tra đường dẫn uploads
console.log("Uploads directory path:", path.join(__dirname, "../uploads"));

// Thêm route để kiểm tra trạng thái uploads directory
app.get("/api/check-uploads", (req, res) => {
  const uploadsPath = path.join(__dirname, "../uploads");
  fs.readdir(uploadsPath, (err, files) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: err.message,
        path: uploadsPath,
      });
    }

    return res.json({
      success: true,
      path: uploadsPath,
      files: files,
    });
  });
});
