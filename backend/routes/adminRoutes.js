import express from 'express';
import {
  getDashboardStats,
  getPendingCases,
  approveCase,
  rejectCase,
  toggleFeatured,
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, admin); // All admin routes require authentication and admin privilege

router.get('/dashboard', getDashboardStats);
router.get('/cases/pending', getPendingCases);
router.put('/cases/:id/approve', approveCase);
router.put('/cases/:id/reject', rejectCase);
router.put('/cases/:id/featured', toggleFeatured);

export default router;