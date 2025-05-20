import path from "path";
import express from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import asyncHandler from "express-async-handler";
import fs from "fs";
import { fileURLToPath } from "url";

// Lấy đường dẫn hiện tại
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Kiểm tra phần cấu hình multer storage
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/"); // Đường dẫn thư mục lưu file
  },
  filename(req, file, cb) {
    // Tạo tên file duy nhất với phần mở rộng gốc
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  },
});

// Kiểm tra loại file
function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb("Chỉ chấp nhận hình ảnh!");
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("image"); // Đây là field name mà server đang mong đợi

const uploadImages = asyncHandler(async (req, res) => {
  console.log("Upload request received");

  // Kiểm tra xem user có tồn tại không
  if (!req.user) {
    console.error("User not found in request");
    res.status(401);
    throw new Error("User not authenticated");
  }

  console.log("User authenticated:", req.user._id);

  // Debug - log request headers và thông tin request
  console.log("Content-Type:", req.headers["content-type"]);
  console.log("Request has body:", !!req.body);
  console.log("Request body keys:", Object.keys(req.body || {}));

  // Print form data field names
  if (
    req.headers["content-type"] &&
    req.headers["content-type"].includes("multipart/form-data")
  ) {
    console.log("Multipart form detected");
  }

  try {
    // Continue với upload middleware
    upload(req, res, function (err) {
      if (err) {
        console.log("Multer error:", err);
        // Trả về response lỗi thay vì throw error
        return res.status(400).json({
          message: `Lỗi upload: ${err.message}`,
          field: err.field,
          code: err.code,
        });
      }

      // Xử lý phản hồi sau khi upload thành công
      if (!req.file) {
        return res
          .status(400)
          .json({ message: "Không có file nào được tải lên" });
      }

      // Tạo đường dẫn URL tương đối thay vì đường dẫn tuyệt đối
      const filePath = `/uploads/${req.file.filename}`; // Trả về /uploads/filename.png

      // Log kết quả
      console.log("Upload successful, returning URL path:", filePath);

      // Trả về kết quả
      res.json(filePath);
    });
  } catch (error) {
    console.error("Failed to process upload:", error);
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
});

export { uploadImages };
