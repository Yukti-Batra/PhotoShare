import { Request, Response } from "express";
import { prisma } from "../index";
import { uploadToCloudinary } from "../utils/cloudinary";
import { deleteFromCloudinary } from "../utils/cloudinary";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt";
import { cookieOptions } from "../utils/cookieOptions";

// @desc    Get user profile
// @route   GET /api/users/:username
// @access  Private
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where: {
        username,
      },
      select: {
        id: true,
        username: true,
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
        // Check if current user is following this user
        followedBy: {
          where: {
            followerId: req.user.id,
          },
          select: {
            id: true,
          },
        },
        // Recent posts
        posts: {
          orderBy: {
            createdAt: "desc",
          },
          take: 9,
          select: {
            id: true,
            imageUrl: true,
            caption: true,
            createdAt: true,
            _count: {
              select: {
                likes: true,
                comments: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Transform data to include isFollowing
    const userResponse = {
      ...user,
      isFollowing: user.followedBy.length > 0,
      followedBy: undefined, // Remove the raw followedBy data
    };

    res.json(userResponse);
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const { name, bio, username } = req.body;
    const file = req.file;

    // Prepare update data object
    const updateData: any = {};

    // Only process fields that are actually provided in the request
    if (name !== undefined) {
      updateData.name = name;
    }

    if (bio !== undefined) {
      updateData.bio = bio;
    }

    if (username !== undefined) {
      // Only check for username conflicts if the username is being changed
      if (username !== req.user.username) {
        const existingUser = await prisma.user.findUnique({
          where: { username },
        });

        if (existingUser) {
          return res.status(400).json({ message: "Username is already taken" });
        }

        updateData.username = username;
      }
    }

    // Process profile image if provided
    if (file) {
      // Find the current user to get the existing profile image
      const currentUser = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { profileImage: true },
      });

      // Upload new image to Cloudinary
      const profileImageUrl = await uploadToCloudinary(file.path);
      updateData.profileImage = profileImageUrl;

      // Delete previous profile image if it exists and is from Cloudinary
      if (
        currentUser?.profileImage &&
        currentUser.profileImage.includes("cloudinary")
      ) {
        await deleteFromCloudinary(currentUser.profileImage);
      }
    }

    // If there's nothing to update, return the current user data
    if (Object.keys(updateData).length === 0) {
      const currentUser = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
          bio: true,
          profileImage: true,
        },
      });

      return res.json(currentUser);
    }

    // Update user with prepared data
    const user = await prisma.user.update({
      where: {
        id: req.user.id,
      },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        bio: true,
        profileImage: true,
      },
    });

    res.json(user);
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Follow a user
// @route   POST /api/users/:id/follow
// @access  Private
export const followUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const userToFollow = await prisma.user.findUnique({
      where: { id },
    });

    if (!userToFollow) {
      return res.status(404).json({ message: "User not found" });
    }

    // Can't follow yourself
    if (id === req.user.id) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    // Check if already following
    const existingFollow = await prisma.follow.findFirst({
      where: {
        followerId: req.user.id,
        followingId: id,
      },
    });

    if (existingFollow) {
      return res.status(400).json({ message: "Already following this user" });
    }

    // Create follow relationship
    await prisma.follow.create({
      data: {
        follower: {
          connect: { id: req.user.id },
        },
        following: {
          connect: { id },
        },
      },
    });

    res.status(201).json({ message: "Successfully followed user" });
  } catch (error) {
    console.error("Follow user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Unfollow a user
// @route   DELETE /api/users/:id/follow
// @access  Private
export const unfollowUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const userToUnfollow = await prisma.user.findUnique({
      where: { id },
    });

    if (!userToUnfollow) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete follow relationship
    await prisma.follow.deleteMany({
      where: {
        followerId: req.user.id,
        followingId: id,
      },
    });

    res.json({ message: "Successfully unfollowed user" });
  } catch (error) {
    console.error("Unfollow user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get user followers
// @route   GET /api/users/:id/followers
// @access  Private
export const getFollowers = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { page = "1", limit = "10" } = req.query;

    const parsedPage = parseInt(page as string, 10);
    const parsedLimit = parseInt(limit as string, 10);
    const skip = (parsedPage - 1) * parsedLimit;

    const followers = await prisma.follow.findMany({
      where: {
        followingId: id,
      },
      take: parsedLimit,
      skip,
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            name: true,
            profileImage: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const count = await prisma.follow.count({
      where: {
        followingId: id,
      },
    });

    // Transform the data to a more usable format
    const formattedFollowers = followers.map((follow) => ({
      id: follow.follower.id,
      username: follow.follower.username,
      name: follow.follower.name,
      profileImage: follow.follower.profileImage,
      followId: follow.id,
      followSince: follow.createdAt,
    }));

    res.json({
      followers: formattedFollowers,
      currentPage: parsedPage,
      totalPages: Math.ceil(count / parsedLimit),
      totalCount: count,
    });
  } catch (error) {
    console.error("Get followers error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get user following
// @route   GET /api/users/:id/following
// @access  Private
export const getFollowing = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { page = "1", limit = "10" } = req.query;

    const parsedPage = parseInt(page as string, 10);
    const parsedLimit = parseInt(limit as string, 10);
    const skip = (parsedPage - 1) * parsedLimit;

    const following = await prisma.follow.findMany({
      where: {
        followerId: id,
      },
      take: parsedLimit,
      skip,
      include: {
        following: {
          select: {
            id: true,
            username: true,
            name: true,
            profileImage: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const count = await prisma.follow.count({
      where: {
        followerId: id,
      },
    });

    // Transform the data to a more usable format
    const formattedFollowing = following.map((follow) => ({
      id: follow.following.id,
      username: follow.following.username,
      name: follow.following.name,
      profileImage: follow.following.profileImage,
      followId: follow.id,
      followSince: follow.createdAt,
    }));

    res.json({
      following: formattedFollowing,
      currentPage: parsedPage,
      totalPages: Math.ceil(count / parsedLimit),
      totalCount: count,
    });
  } catch (error) {
    console.error("Get following error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Search users by username or name
// @route   GET /api/users/search
// @access  Private
export const searchUsers = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== "string") {
      return res.status(400).json({ message: "Search query is required" });
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [{ username: { contains: query } }, { name: { contains: query } }],
        // Don't include the current user in results
        NOT: {
          id: req.user.id,
        },
      },
      select: {
        id: true,
        username: true,
        name: true,
        profileImage: true,
        _count: {
          select: {
            posts: true,
            followedBy: true,
          },
        },
        // Check if current user is following them
        followedBy: {
          where: {
            followerId: req.user.id,
          },
          select: {
            id: true,
          },
        },
      },
      take: 20, // Limit results
    });

    // Transform results to include isFollowing
    const transformedUsers = users.map((user) => ({
      ...user,
      isFollowing: user.followedBy.length > 0,
      followedBy: undefined, // Remove raw data
    }));

    res.json(transformedUsers);
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Deactivate user account
// @route   PUT /api/users/deactivate
// @access  Private
export const deactivateAccount = async (req: Request, res: Response) => {
  try {
    // Update user status to deactivated
    await prisma.user.update({
      where: {
        id: req.user.id,
      },
      data: {
        isActive: false,
      },
    });

    // Clear auth cookies
    res.clearCookie("token");
    res.clearCookie("firebase_token");

    res.json({ message: "Account deactivated successfully" });
  } catch (error) {
    console.error("Deactivate account error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Reactivate user account
// @route   PUT /api/users/reactivate
// @access  Public (with credentials)
export const reactivateAccount = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find user by email with isActive field
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        profileImage: true,
        password: true,
        isActive: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user was deactivated
    if (user.isActive) {
      return res.status(400).json({ message: "Account is already active" });
    }

    // Verify password
    if (user.password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
    } else {
      return res.status(401).json({
        message: "Please use Google login to reactivate your account",
      });
    }

    // Reactivate account
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        isActive: true,
      },
    });

    // Generate token and set cookie
    const token = generateToken(user.id);
    res.cookie("token", token, cookieOptions);

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      profileImage: user.profileImage,
    });
  } catch (error) {
    console.error("Reactivate account error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
