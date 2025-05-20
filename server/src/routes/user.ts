import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  searchUsers,
  deactivateAccount,
  reactivateAccount,
} from "../controllers/user";
import { protect } from "../middlewares/auth";
import { upload } from "../middlewares/upload";

const router = express.Router();

// @route   PUT /api/users/deactivate
// @desc    Deactivate user account
// @access  Private
router.put("/deactivate", protect, deactivateAccount);

// @route   PUT /api/users/reactivate
// @desc    Reactivate user account
// @access  Public
router.put("/reactivate", reactivateAccount);

// @route   GET /api/users/search
// @desc    Search users
// @access  Private
router.get("/search", protect, searchUsers);

// @route   GET /api/users/:username
// @desc    Get user profile
// @access  Private
router.get("/:username", protect, getUserProfile);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put(
  "/profile",
  protect,
  upload.single("profileImage"),
  updateUserProfile
);

// @route   POST /api/users/:id/follow
// @desc    Follow a user
// @access  Private
router.post("/:id/follow", protect, followUser);

// @route   DELETE /api/users/:id/follow
// @desc    Unfollow a user
// @access  Private
router.delete("/:id/follow", protect, unfollowUser);

// @route   GET /api/users/:id/followers
// @desc    Get user followers
// @access  Private
router.get("/:id/followers", protect, getFollowers);

// @route   GET /api/users/:id/following
// @desc    Get user following
// @access  Private
router.get("/:id/following", protect, getFollowing);

export default router;
