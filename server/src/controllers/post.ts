import { Request, Response } from "express";
import { prisma } from "../index";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary";

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req: Request, res: Response) => {
  try {
    const { caption } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "Please upload an image" });
    }

    // Upload image to Cloudinary
    const imageUrl = await uploadToCloudinary(file.path);

    // Create post
    const post = await prisma.post.create({
      data: {
        caption,
        imageUrl,
        user: {
          connect: { id: req.user.id },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
      },
    });

    res.status(201).json(post);
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get posts for user feed
// @route   GET /api/posts/feed
// @access  Private
export const getFeedPosts = async (req: Request, res: Response) => {
  try {
    const { page = "1", limit = "10" } = req.query;
    const parsedPage = parseInt(page as string, 10);
    const parsedLimit = parseInt(limit as string, 10);
    const skip = (parsedPage - 1) * parsedLimit;

    // Get IDs of users the current user is following
    const following = await prisma.follow.findMany({
      where: {
        followerId: req.user.id,
      },
      select: {
        followingId: true,
      },
    });

    const followingIds = following.map((follow: any) => follow.followingId);

    // Include the user's own posts
    followingIds.push(req.user.id);

    // Get posts from followed users and own posts
    const posts = await prisma.post.findMany({
      where: {
        userId: {
          in: followingIds,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: parsedLimit,
      skip,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
        // Check if the current user has liked this post
        likes: {
          where: {
            userId: req.user.id,
          },
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    // Count total posts for pagination
    const totalPosts = await prisma.post.count({
      where: {
        userId: {
          in: followingIds,
        },
      },
    });

    // Transform the posts to include isLiked
    const transformedPosts = posts.map((post: any) => ({
      ...post,
      isLiked: post.likes.length > 0,
      likes: undefined, // Remove the raw likes data
    }));

    res.json({
      posts: transformedPosts,
      currentPage: parsedPage,
      totalPages: Math.ceil(totalPosts / parsedLimit),
      totalPosts,
    });
  } catch (error) {
    console.error("Get feed posts error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get a post by ID
// @route   GET /api/posts/:id
// @access  Private
export const getPost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
        likes: {
          where: {
            userId: req.user.id,
          },
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Transform the post to include isLiked
    const transformedPost = {
      ...post,
      isLiked: post.likes.length > 0,
      likes: undefined, // Remove the raw likes data
    };

    res.json(transformedPost);
  } catch (error) {
    console.error("Get post error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
export const deletePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user owns the post
    if (post.userId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this post" });
    }

    // Delete image from Cloudinary
    if (post.imageUrl) {
      await deleteFromCloudinary(post.imageUrl);
    }

    // Delete post (cascades to likes and comments)
    await prisma.post.delete({
      where: { id },
    });

    res.json({ message: "Post deleted" });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Like a post
// @route   POST /api/posts/:id/like
// @access  Private
export const likePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if already liked
    const existingLike = await prisma.like.findFirst({
      where: {
        postId: id,
        userId: req.user.id,
      },
    });

    if (existingLike) {
      return res.status(400).json({ message: "Post already liked" });
    }

    // Create like
    const like = await prisma.like.create({
      data: {
        user: {
          connect: { id: req.user.id },
        },
        post: {
          connect: { id },
        },
      },
    });

    res.status(201).json(like);
  } catch (error) {
    console.error("Like post error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Unlike a post
// @route   DELETE /api/posts/:id/like
// @access  Private
export const unlikePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Delete like
    await prisma.like.deleteMany({
      where: {
        postId: id,
        userId: req.user.id,
      },
    });

    res.json({ message: "Post unliked" });
  } catch (error) {
    console.error("Unlike post error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Add a comment to a post
// @route   POST /api/posts/:id/comments
// @access  Private
export const addComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content,
        user: {
          connect: { id: req.user.id },
        },
        post: {
          connect: { id },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
      },
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get comments for a post
// @route   GET /api/posts/:id/comments
// @access  Private
export const getComments = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { page = "1", limit = "10" } = req.query;

    const parsedPage = parseInt(page as string, 10);
    const parsedLimit = parseInt(limit as string, 10);
    const skip = (parsedPage - 1) * parsedLimit;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Get comments
    const comments = await prisma.comment.findMany({
      where: {
        postId: id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: parsedLimit,
      skip,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
      },
    });

    // Count total comments
    const totalComments = await prisma.comment.count({
      where: {
        postId: id,
      },
    });

    res.json({
      comments,
      currentPage: parsedPage,
      totalPages: Math.ceil(totalComments / parsedLimit),
      totalComments,
    });
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/posts/:postId/comments/:commentId
// @access  Private
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { postId, commentId } = req.params;

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        post: true,
      },
    });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if post ID matches
    if (comment.postId !== postId) {
      return res
        .status(400)
        .json({ message: "Comment does not belong to the post" });
    }

    // Check if user owns the comment or the post
    if (comment.userId !== req.user.id && comment.post.userId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this comment" });
    }

    // Delete comment
    await prisma.comment.delete({
      where: { id: commentId },
    });

    res.json({ message: "Comment deleted" });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
