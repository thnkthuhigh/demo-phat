import express from "express";
import {
  getDashboardStats,
  getPendingCases,
  approveCase,
  rejectCase,
  toggleFeatured,
} from "../controllers/adminController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Áp dụng middleware xác thực cho tất cả routes
router.use(protect, admin);

router.get("/dashboard", getDashboardStats);
router.get("/cases/pending", getPendingCases);
router.put("/cases/:id/approve", approveCase);
router.put("/cases/:id/reject", rejectCase);
router.put("/cases/:id/toggle-featured", toggleFeatured);

export default router;
