import Product from "../models/productModel.js";
import Review from "../models/reviewModel.js";
import asyncHandler from "../middleware/asyncHandler.js";

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
export const createProductReview = asyncHandler(async (req, res) => {
  const { productId, rating, comment, variant } = req.body;

  const product = await Product.findById(productId);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error("Product already reviewed");
    }

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
      variant,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;

    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();

    // Also save to separate review collection
    const newReview = new Review({
      user: req.user._id,
      product: productId,
      rating: Number(rating),
      comment,
      variant,
    });

    await newReview.save();

    res.status(201).json({ message: "Review added" });
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Get all reviews for a product
// @route   GET /api/reviews
// @access  Public
export const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.query;
  const reviews = await Review.find({ product: productId }).populate(
    "user",
    "name avatar"
  );
  res.json(reviews);
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (review) {
    // Remove from product reviews
    const product = await Product.findById(review.product);
    if (product) {
      product.reviews = product.reviews.filter(
        (r) => r._id.toString() !== req.params.id.toString()
      );
      product.numReviews = product.reviews.length;

      if (product.reviews.length > 0) {
        product.rating =
          product.reviews.reduce((acc, item) => item.rating + acc, 0) /
          product.reviews.length;
      } else {
        product.rating = 0;
      }

      await product.save();
    }

    // Remove from review collection
    await review.deleteOne();

    res.json({ message: "Review removed" });
  } else {
    res.status(404);
    throw new Error("Review not found");
  }
});
