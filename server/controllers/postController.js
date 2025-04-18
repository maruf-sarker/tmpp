import Post from "../models/postModel.js";
import asyncHandler from "../middleware/asyncHandler.js";
import cloudinary from "../config/cloudinary.js";

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
export const createPost = asyncHandler(async (req, res) => {
  const { text, tags } = req.body;

  // Upload images and videos to Cloudinary
  const images = [];
  const videos = [];

  if (req.files) {
    for (const file of req.files) {
      if (file.mimetype.startsWith("image")) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "phonity/posts/images",
        });
        images.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
      } else if (file.mimetype.startsWith("video")) {
        const result = await cloudinary.uploader.upload(file.path, {
          resource_type: "video",
          folder: "phonity/posts/videos",
        });
        videos.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    }
  }

  const post = new Post({
    user: req.user._id,
    text,
    images,
    videos,
    tags: tags ? tags.split(",") : [],
  });

  const createdPost = await post.save();
  res.status(201).json(createdPost);
});

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
export const getPosts = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.page) || 1;

  const keyword = req.query.keyword
    ? {
        $or: [
          { text: { $regex: req.query.keyword, $options: "i" } },
          { tags: { $regex: req.query.keyword, $options: "i" } },
        ],
      }
    : {};

  const count = await Post.countDocuments({ ...keyword });
  const posts = await Post.find({ ...keyword })
    .sort({ createdAt: -1 })
    .populate("user", "name avatar")
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ posts, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Get post by ID
// @route   GET /api/posts/:id
// @access  Public
export const getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate("user", "name avatar")
    .populate("comments.user", "name avatar");

  if (post) {
    res.json(post);
  } else {
    res.status(404);
    throw new Error("Post not found");
  }
});

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private/Admin or Post Owner
export const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (post) {
    // Check if user is admin or post owner
    if (
      post.user.toString() === req.user._id.toString() ||
      req.user.role === "admin" ||
      req.user.role === "moderator"
    ) {
      // Delete media from Cloudinary
      for (const image of post.images) {
        await cloudinary.uploader.destroy(image.public_id);
      }
      for (const video of post.videos) {
        await cloudinary.uploader.destroy(video.public_id, {
          resource_type: "video",
        });
      }

      await post.deleteOne();
      res.json({ message: "Post removed" });
    } else {
      res.status(401);
      throw new Error("Not authorized to delete this post");
    }
  } else {
    res.status(404);
    throw new Error("Post not found");
  }
});

// @desc    Add a comment to a post
// @route   POST /api/posts/:id/comments
// @access  Private
export const createPostComment = asyncHandler(async (req, res) => {
  const { text } = req.body;

  const post = await Post.findById(req.params.id);

  if (post) {
    const comment = {
      user: req.user._id,
      text,
    };

    post.comments.push(comment);
    await post.save();

    res.status(201).json({ message: "Comment added" });
  } else {
    res.status(404);
    throw new Error("Post not found");
  }
});

// @desc    Add a reaction to a post
// @route   POST /api/posts/:id/reactions
// @access  Private
export const addPostReaction = asyncHandler(async (req, res) => {
  const { type } = req.body;

  const post = await Post.findById(req.params.id);

  if (post) {
    // Check if user already reacted
    const existingReactionIndex = post.reactions.findIndex(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (existingReactionIndex >= 0) {
      // Update existing reaction
      post.reactions[existingReactionIndex].type = type;
    } else {
      // Add new reaction
      post.reactions.push({
        user: req.user._id,
        type,
      });
    }

    await post.save();
    res.json({ message: "Reaction added/updated" });
  } else {
    res.status(404);
    throw new Error("Post not found");
  }
});

// @desc    Remove a reaction from a post
// @route   DELETE /api/posts/:id/reactions
// @access  Private
export const removePostReaction = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (post) {
    post.reactions = post.reactions.filter(
      (r) => r.user.toString() !== req.user._id.toString()
    );

    await post.save();
    res.json({ message: "Reaction removed" });
  } else {
    res.status(404);
    throw new Error("Post not found");
  }
});
