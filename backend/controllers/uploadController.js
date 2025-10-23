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

// Đảm bảo thư mục uploads tồn tại
const uploadsDir = "uploads/";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Kiểm tra phần cấu hình multer storage
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/"); // Đường dẫn thư mục lưu file
  },
  filename(req, file, cb) {
    // Tạo tên file duy nhất với phần mở rộng gốc
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, `${uniqueSuffix}-${sanitizedName}`);
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

// Dùng any() để chấp nhận cả field "image" và "images" từ phía client
const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
}).any(); // chấp nhận nhiều field, tối đa 10 file theo giới hạn mặc định ở client

// Chỉnh lại đường dẫn URL để tránh vấn đề với đường dẫn tương đối
export const uploadImages = asyncHandler(async (req, res) => {
  upload(req, res, function (err) {
    if (err) {
      console.error("Upload error:", err);
      res.status(400);
      throw new Error(err.message);
    }

    // req.files có thể là mảng (khi dùng any())
    const files = Array.isArray(req.files)
      ? req.files
      : Object.values(req.files || {}).flat();

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "Không nhận được file tải lên" });
    }

    // Đảm bảo URL có đường dẫn đầy đủ
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const paths = files.map(
      (file) => `${baseUrl}/uploads/${file.filename}` // Đường dẫn đầy đủ
    );

    console.log("Files uploaded successfully:", paths.length);
    // Trả về mảng URL để tương thích với các client hiện có
    res.json(paths);
  });
});
