import express from "express";
import {
  createProductReview,
  getProductReviews,
  deleteReview,
} from "../controllers/reviewController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(protect, createProductReview).get(getProductReviews);

router.route("/:id").delete(protect, admin, deleteReview);

export default router;
