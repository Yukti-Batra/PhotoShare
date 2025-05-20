import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../index";
import { generateToken } from "../utils/jwt";
import admin from "../utils/firebase-admin";

// Cookie options
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

// Helper to send auth response
const sendAuthResponse = (res: Response, user: any, token: string) => {
  // Set token in HTTP-only cookie
  res.cookie("token", token, cookieOptions);

  // Return user data (without the token)
  return res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    profileImage: user.profileImage,
  });
};

// @desc    Register a user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password, name } = req.body;

    // Check if user exists
    const userExists = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists with that email or username",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        name,
      },
    });

    if (user) {
      const token = generateToken(user.id);
      return sendAuthResponse(res, user, token);
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Please enter all fields" });
    }

    // Check if user exists with isActive field
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        name: true,
        profileImage: true,
        bio: true,
        isActive: true,
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // If no password (Google auth), reject
    if (!user.password) {
      return res.status(400).json({
        message: "Please login with Google for this account",
      });
    }

    // Check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Reactivate account if it was deactivated
    let updatedUser = user;
    if (!user.isActive) {
      updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { isActive: true },
      });
    }

    // Generate token
    const token = generateToken(user.id);

    // Set cookie
    res.cookie("token", token, cookieOptions);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = updatedUser;

    res.json(userWithoutPassword);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        bio: true,
        profileImage: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            followedBy: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Verify Firebase ID token and login/register user
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "ID token is required" });
    }

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    if (!email) {
      return res
        .status(400)
        .json({ message: "Email is required for authentication" });
    }

    // Look for existing user by Firebase UID
    let user = await prisma.user.findFirst({
      where: { firebaseUid: uid },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        profileImage: true,
        firebaseUid: true,
        isActive: true,
      },
    });

    // If no user found by Firebase UID, try finding by email
    if (!user) {
      user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
          profileImage: true,
          firebaseUid: true,
          isActive: true,
        },
      });

      // If user exists with this email but no Firebase UID, link accounts
      if (user) {
        // Update user with Firebase UID and reactivate if needed
        const updateData: any = { firebaseUid: uid };

        // If account was deactivated, reactivate it
        if (user.isActive === false) {
          updateData.isActive = true;
        }

        user = await prisma.user.update({
          where: { id: user.id },
          data: updateData,
        });
      }
      // Otherwise create a new user
      else {
        const username = email.split("@")[0] + Math.floor(Math.random() * 1000);
        user = await prisma.user.create({
          data: {
            email,
            username,
            name: name || username,
            firebaseUid: uid,
            profileImage: picture || undefined,
            isActive: true,
          },
        });
      }
    } else if (user.isActive === false) {
      // Reactivate user if account was deactivated
      user = await prisma.user.update({
        where: { id: user.id },
        data: { isActive: true },
      });
    }

    // Set both tokens
    const jwtToken = generateToken(user.id);
    res.cookie("token", jwtToken, cookieOptions);
    res.cookie("firebase_token", idToken, cookieOptions);

    return res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      profileImage: user.profileImage,
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(401).json({ message: "Failed to authenticate with Google" });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
export const logout = (req: Request, res: Response) => {
  res.clearCookie("token");
  res.clearCookie("firebase_token");
  res.status(200).json({ message: "Logged out successfully" });
};
