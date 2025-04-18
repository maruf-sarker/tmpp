// server/routes/authRoutes.js
import express from "express";
import {
  loginUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { uploadSingle } from "../middleware/uploadMiddleware.js"; // Import the specific function

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", uploadSingle, registerUser); // Use the imported function directly
router.post("/logout", logoutUser);
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, uploadSingle, updateUserProfile);

export default router;
