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
  toggleCaseFeature,
} from "../controllers/caseController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  createSupport,
  getTopSupportersForCase,
} from "../controllers/supportController.js";

const router = express.Router();

router.route("/").post(protect, createCase).get(getCases);

// Make sure this route is defined before the /:id route to avoid conflicts
router.get("/featured", getFeaturedCases);
router.get("/stats", getCaseStats);
router.get("/my-cases", protect, getMyCases);

router
  .route("/:id")
  .get(getCaseById)
  .put(protect, updateCase)
  .delete(protect, deleteCase);

router.route("/:id/support").post(protect, createSupport);
router.get("/:id/top-supporters", getTopSupportersForCase);
router.route("/:id/feature").put(protect, admin, toggleCaseFeature);

export default router;
