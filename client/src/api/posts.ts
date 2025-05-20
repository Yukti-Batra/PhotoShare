import axios from "./axios";
import { Post, Comment, PaginatedResponse } from "../types";

// Create a new post
export const createPost = async (data: FormData): Promise<Post> => {
  const response = await axios.post<Post>("/posts", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Get feed posts
export const getFeedPosts = async (
  page = 1,
  limit = 10
): Promise<PaginatedResponse<Post>> => {
  const response = await axios.get<any>(
    `/posts/feed?page=${page}&limit=${limit}`
  );
  return {
    data: response.data.posts,
    currentPage: response.data.currentPage,
    totalPages: response.data.totalPages,
    totalCount: response.data.totalPosts,
  };
};

// Get a post by ID
export const getPost = async (postId: string): Promise<Post> => {
  const response = await axios.get<Post>(`/posts/${postId}`);
  return response.data;
};

// Delete a post
export const deletePost = async (postId: string): Promise<void> => {
  await axios.delete(`/posts/${postId}`);
};

// Like a post
export const likePost = async (postId: string): Promise<void> => {
  await axios.post(`/posts/${postId}/like`);
};

// Unlike a post
export const unlikePost = async (postId: string): Promise<void> => {
  await axios.delete(`/posts/${postId}/like`);
};

// Add a comment
export const addComment = async (
  postId: string,
  content: string
): Promise<Comment> => {
  const response = await axios.post<Comment>(`/posts/${postId}/comments`, {
    content,
  });
  return response.data;
};

// Get comments for a post
export const getComments = async (
  postId: string,
  page = 1,
  limit = 10
): Promise<PaginatedResponse<Comment>> => {
  const response = await axios.get<any>(
    `/posts/${postId}/comments?page=${page}&limit=${limit}`
  );
  return {
    data: response.data.comments,
    currentPage: response.data.currentPage,
    totalPages: response.data.totalPages,
    totalCount: response.data.totalComments,
  };
};

// Delete a comment
export const deleteComment = async (
  postId: string,
  commentId: string
): Promise<void> => {
  await axios.delete(`/posts/${postId}/comments/${commentId}`);
};
