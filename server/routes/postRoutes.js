import express from "express";
import {
  createPost,
  getPosts,
  getPostById,
  deletePost,
  createPostComment,
  addPostReaction,
  removePostReaction,
} from "../controllers/postController.js";
import { protect, admin, moderator } from "../middleware/authMiddleware.js";
import { uploadMultiple } from "../middleware/uploadMiddleware.js"; // Changed to named import

const router = express.Router();

router
  .route("/")
  .get(getPosts)
  .post(protect, uploadMultiple, createPost); // Changed to use uploadMultiple

router.route("/:id").get(getPostById).delete(protect, moderator, deletePost);

router.route("/:id/comments").post(protect, createPostComment);

router
  .route("/:id/reactions")
  .post(protect, addPostReaction)
  .delete(protect, removePostReaction);

export default router;