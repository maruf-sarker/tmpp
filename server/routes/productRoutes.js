// server/routes/productRoutes.js
import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts,
} from "../controllers/productController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { uploadSingle, uploadMultiple } from "../middleware/uploadMiddleware.js"; // Corrected path

const router = express.Router();

router
  .route("/")
  .get(getProducts)
  .post(protect, admin, uploadMultiple, createProduct);

router
  .route("/:id")
  .get(getProductById)
  .put(protect, admin, uploadMultiple, updateProduct)
  .delete(protect, admin, deleteProduct);

export default router;
