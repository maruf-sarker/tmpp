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
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(getPosts)
  .post(protect, upload.array("media", 5), createPost);

router.route("/:id").get(getPostById).delete(protect, moderator, deletePost);

router.route("/:id/comments").post(protect, createPostComment);

router
  .route("/:id/reactions")
  .post(protect, addPostReaction)
  .delete(protect, removePostReaction);

export default router;
