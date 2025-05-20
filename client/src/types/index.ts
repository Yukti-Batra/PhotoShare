// User related types
export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  bio?: string;
  profileImage?: string;
  createdAt?: string;
  isFollowing?: boolean;
  _count?: {
    posts: number;
    followedBy: number;
    following: number;
  };
}

export interface UserProfile extends User {
  isFollowing?: boolean;
  posts?: Post[];
}

// Post related types
export interface Post {
  id: string;
  imageUrl: string;
  caption?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user?: {
    id: string;
    username: string;
    profileImage?: string;
  };
  isLiked?: boolean;
  _count?: {
    likes: number;
    comments: number;
  };
}

// Comment related types
export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  postId: string;
  user?: {
    id: string;
    username: string;
    profileImage?: string;
  };
}

// Auth related types
export interface AuthUser {
  id: string;
  username: string;
  email: string;
  name: string;
  bio?: string;
  profileImage?: string;
  token?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  name: string;
}

// API response types
export interface PaginatedResponse<T> {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  data: T[];
}

// Theme type
export type Theme = "light" | "dark";
