import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../index";
import admin from "../utils/firebase-admin";

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
      authType?: "jwt" | "firebase";
    }
  }
}

interface JwtPayload {
  id: string;
}

// Protect routes
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from cookies
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret"
    ) as JwtPayload;

    // Find user by id
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, isActive: true },
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Check if user account is active
    if (!user.isActive) {
      // Clear auth cookies
      res.clearCookie("token");
      res.clearCookie("firebase_token");
      return res.status(401).json({ message: "Account is deactivated" });
    }

    // Set user in request
    req.user = { id: user.id };
    req.authType = "jwt";
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Not authenticated" });
  }
};

// Verify Firebase ID token
export const verifyFirebaseToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token;

  // First check if token exists in cookies
  if (req.cookies && req.cookies.firebase_token) {
    token = req.cookies.firebase_token;
  }
  // Fallback to Bearer token in headers
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Firebase")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: "Not authorized, no Firebase token" });
  }

  try {
    // Verify the Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid, email, name } = decodedToken;

    // Find or create the user in our database
    let user = await prisma.user.findFirst({
      where: { firebaseUid: uid },
      select: {
        id: true,
        username: true,
        email: true,
        isActive: true,
      },
    });

    if (!user && email) {
      // Create a new user with Firebase information
      const username = email.split("@")[0] + Math.floor(Math.random() * 1000);

      user = await prisma.user.create({
        data: {
          email,
          username,
          name: name || username,
          firebaseUid: uid,
          password: "", // No password for Firebase auth users
        },
      });
    }

    if (!user) {
      return res.status(401).json({ message: "Could not create or find user" });
    }

    // Check if user account is active
    if (user.isActive === false) {
      // Clear auth cookies
      res.clearCookie("token");
      res.clearCookie("firebase_token");
      return res.status(401).json({
        message: "Account is deactivated. Please log in again to reactivate.",
      });
    }

    // Set user to req.user
    req.user = user;
    req.authType = "firebase";
    next();
  } catch (error) {
    console.error("Firebase auth middleware error:", error);
    res.status(401).json({ message: "Not authorized, Firebase token failed" });
  }
};
