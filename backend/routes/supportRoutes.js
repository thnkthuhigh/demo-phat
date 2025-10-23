import express from "express";
import {
  getUserSupports,
  getAllSupports,
  getTopSupporters,
  updateSupportStatus,
  addSupportProofs,
} from "../controllers/supportController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/my-supports", protect, getUserSupports);
router.get("/top-supporters", getTopSupporters);
router.get("/", protect, admin, getAllSupports);
router.put("/:id/status", protect, admin, updateSupportStatus);
router.post("/:id/proofs", protect, addSupportProofs);

export default router;
