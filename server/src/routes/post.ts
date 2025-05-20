import express from "express";
import {
  createPost,
  getFeedPosts,
  getPost,
  deletePost,
  likePost,
  unlikePost,
  addComment,
  getComments,
  deleteComment,
} from "../controllers/post";
import { protect } from "../middlewares/auth";
import { upload } from "../middlewares/upload";

const router = express.Router();

// @route   POST /api/posts
// @desc    Create a post
// @access  Private
router.post("/", protect, upload.single("image"), createPost);

// @route   GET /api/posts/feed
// @desc    Get posts for user feed
// @access  Private
router.get("/feed", protect, getFeedPosts);

// @route   GET /api/posts/:id
// @desc    Get a post by ID
// @access  Private
router.get("/:id", protect, getPost);

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete("/:id", protect, deletePost);

// @route   POST /api/posts/:id/like
// @desc    Like a post
// @access  Private
router.post("/:id/like", protect, likePost);

// @route   DELETE /api/posts/:id/like
// @desc    Unlike a post
// @access  Private
router.delete("/:id/like", protect, unlikePost);

// @route   POST /api/posts/:id/comments
// @desc    Add a comment to a post
// @access  Private
router.post("/:id/comments", protect, addComment);

// @route   GET /api/posts/:id/comments
// @desc    Get comments for a post
// @access  Private
router.get("/:id/comments", protect, getComments);

// @route   DELETE /api/posts/:postId/comments/:commentId
// @desc    Delete a comment
// @access  Private
router.delete("/:postId/comments/:commentId", protect, deleteComment);

export default router;
