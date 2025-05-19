import express from "express";
import {
  createCase,
  getCases,
  getCaseById,
  updateCase,
  deleteCase,
  getFeaturedCases,
  getMyCases,
  getCaseStats,
} from "../controllers/caseController.js";
import { protect } from "../middleware/authMiddleware.js";
import { createSupport } from "../controllers/supportController.js";

const router = express.Router();

router.route("/").post(protect, createCase).get(getCases);

router.get("/featured", getFeaturedCases);
router.get("/stats", getCaseStats);
router.get("/my-cases", protect, getMyCases);

router
  .route("/:id")
  .get(getCaseById)
  .put(protect, updateCase)
  .delete(protect, deleteCase);

router.route("/:id/support").post(protect, createSupport);

export default router;
