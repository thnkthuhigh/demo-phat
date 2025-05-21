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

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
}).array("image", 10); // Đúng tên field là "image" và giới hạn 10 file

// Chỉnh lại đường dẫn URL để tránh vấn đề với đường dẫn tương đối
export const uploadImages = asyncHandler(async (req, res) => {
  upload(req, res, function (err) {
    if (err) {
      console.error("Upload error:", err);
      res.status(400);
      throw new Error(err.message);
    }

    // Đảm bảo URL có đường dẫn đầy đủ
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const paths = req.files.map(
      (file) => `${baseUrl}/uploads/${file.filename}` // Đường dẫn đầy đủ
    );

    console.log("Files uploaded successfully:", paths.length);
    res.json(paths);
  });
});
