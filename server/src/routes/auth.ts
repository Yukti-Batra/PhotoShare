import express from "express";
import {
  register,
  login,
  getCurrentUser,
  googleAuth,
  logout,
} from "../controllers/auth";
import { protect } from "../middlewares/auth";

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a user
// @access  Public
router.post("/register", register);

// @route   POST /api/auth/login
// @desc    Login a user
// @access  Public
router.post("/login", login);

// @route   POST /api/auth/google
// @desc    Login/Register with Google
// @access  Public
router.post("/google", googleAuth);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Public
router.post("/logout", logout);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get("/me", protect, getCurrentUser);

export default router;
