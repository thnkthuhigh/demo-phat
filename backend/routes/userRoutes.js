import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  getUserById,
  getUserDetails,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.route("/:id").get(getUserDetails);

export default router;
