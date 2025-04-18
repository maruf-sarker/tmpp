import express from "express";
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getDashboardStats,
} from "../controllers/adminController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(admin);

router.route("/users").get(getUsers);

router.route("/users/:id").get(getUserById).put(updateUser).delete(deleteUser);

router.route("/stats").get(getDashboardStats);

export default router;
