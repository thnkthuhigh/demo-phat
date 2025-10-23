import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  getUserById,
  getUserDetails,
  getUserSupportsPublic,
  getUserCasesPublic,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.route("/:id").get(getUserDetails);

// Public user related data
router.get("/:id/supports", getUserSupportsPublic);
router.get("/:id/cases", getUserCasesPublic);

export default router;
