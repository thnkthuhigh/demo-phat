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

// Cấu hình lưu trữ cho multer
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const uploadDir = path.join(__dirname, "../uploads/");
    // Tạo thư mục nếu chưa tồn tại
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
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
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

const uploadImages = asyncHandler(async (req, res) => {
  console.log("Upload request received");

  // Kiểm tra xem user có tồn tại không
  if (!req.user) {
    console.error("User not found in request");
    res.status(401);
    throw new Error("User not authenticated");
  }

  console.log("User authenticated:", req.user._id);

  try {
    // Upload nhiều hình ảnh
    upload.array("images", 10)(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        // Lỗi từ multer
        console.error("Multer error:", err);
        res.status(400);
        throw new Error(`Lỗi upload: ${err.message}`);
      } else if (err) {
        // Lỗi khác
        console.error("Upload error:", err);
        res.status(400);
        throw new Error(`Lỗi: ${err}`);
      }

      console.log("Files uploaded:", req.files?.length || 0);

      // Trả về đường dẫn đến các hình ảnh đã upload
      const baseUrl = `${req.protocol}://${req.get("host")}`;

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "Không có file được tải lên" });
      }

      const imageUrls = req.files.map(
        (file) => `${baseUrl}/uploads/${file.filename}`
      );
      console.log("Image URLs generated:", imageUrls);

      res.json(imageUrls);
    });
  } catch (error) {
    console.error("Failed to process upload:", error);
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
});

export { uploadImages };
