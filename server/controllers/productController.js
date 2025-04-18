import Product from "../models/productModel.js";
import asyncHandler from "../middleware/asyncHandler.js";
import cloudinary from "../config/cloudinary.js";

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 12;
  const page = Number(req.query.page) || 1;

  const keyword = req.query.keyword
    ? { name: { $regex: req.query.keyword, $options: "i" } }
    : {};

  // Build filter object
  const filter = { ...keyword };

  // Add filters from query params
  if (req.query.brand) {
    filter.brand = req.query.brand;
  }
  if (req.query.category) {
    filter.category = req.query.category;
  }
  if (req.query.minPrice) {
    filter["variants.price"] = { $gte: Number(req.query.minPrice) };
  }
  if (req.query.maxPrice) {
    filter["variants.price"] = {
      ...filter["variants.price"],
      $lte: Number(req.query.maxPrice),
    };
  }
  if (req.query.ram) {
    filter["variants.ram"] = req.query.ram;
  }
  if (req.query.storage) {
    filter["variants.storage"] = req.query.storage;
  }

  const count = await Product.countDocuments({ ...filter });
  const products = await Product.find({ ...filter })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    products,
    page,
    pages: Math.ceil(count / pageSize),
    count,
    brands: await Product.distinct("brand"),
    categories: await Product.distinct("category"),
    ramOptions: await Product.distinct("variants.ram"),
    storageOptions: await Product.distinct("variants.storage"),
  });
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate("reviews");

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req, res) => {
  const { name, brand, category, description, variants, specifications } =
    req.body;

  // Upload images to Cloudinary
  const images = [];
  if (req.files) {
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "phonity/products",
      });
      images.push({
        url: result.secure_url,
        public_id: result.public_id,
      });
    }
  }

  const product = new Product({
    name,
    brand,
    category,
    description,
    variants: JSON.parse(variants),
    specifications: JSON.parse(specifications),
    images,
    user: req.user._id,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req, res) => {
  const { name, brand, category, description, variants, specifications } =
    req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name || product.name;
    product.brand = brand || product.brand;
    product.category = category || product.category;
    product.description = description || product.description;

    if (variants) {
      product.variants = JSON.parse(variants);
    }

    if (specifications) {
      product.specifications = JSON.parse(specifications);
    }

    // Handle image updates
    if (req.files && req.files.length > 0) {
      // Delete old images from Cloudinary
      for (const image of product.images) {
        await cloudinary.uploader.destroy(image.public_id);
      }

      // Upload new images
      product.images = [];
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "phonity/products",
        });
        product.images.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    // Delete images from Cloudinary
    for (const image of product.images) {
      await cloudinary.uploader.destroy(image.public_id);
    }

    await product.deleteOne();
    res.json({ message: "Product removed" });
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
export const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment, variant } = req.body;

  const product = await Product.findById(req.params.id);

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
    res.status(201).json({ message: "Review added" });
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
export const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ rating: -1 }).limit(5);
  res.json(products);
});
