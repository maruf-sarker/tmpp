# Phonity Server

```txt
server/
├── config/
│   ├── cloudinary.js
│   ├── db.js
│   └── rateLimiter.js
├── controllers/
│   ├── adminController.js
│   ├── authController.js
│   ├── orderController.js
│   ├── postController.js
│   ├── productController.js
│   └── reviewController.js
├── middleware/
│   ├── asyncHandler.js
│   ├── authMiddleware.js
│   ├── errorHandler.js
│   └── uploadMiddleware.js
├── models/
│   ├── orderModel.js
│   ├── postModel.js
│   ├── productModel.js
│   ├── reviewModel.js
│   └── userModel.js
├── routes/
│   ├── adminRoutes.js
│   ├── authRoutes.js
│   ├── orderRoutes.js
│   ├── postRoutes.js
│   ├── productRoutes.js
│   └── reviewRoutes.js
├── tests/
│   ├── auth.test.js
│   ├── order.test.js
│   ├── post.test.js
│   ├── product.test.js
│   └── user.test.js
├── utils/
│   ├── generateToken.js
│   └── sendEmail.js
├── app.js
└── server.js
```
