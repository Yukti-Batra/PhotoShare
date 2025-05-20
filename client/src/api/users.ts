import axios from "./axios";
import { UserProfile, User, PaginatedResponse } from "../types";

export const getUserProfile = async (
  username: string
): Promise<UserProfile> => {
  const response = await axios.get<UserProfile>(`/users/${username}`);
  return response.data;
};

export const updateUserProfile = async (data: FormData): Promise<User> => {
  const response = await axios.put<User>("/users/profile", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const searchUsers = async (query: string): Promise<User[]> => {
  const response = await axios.get<User[]>(
    `/users/search?query=${encodeURIComponent(query)}`
  );
  return response.data;
};

export const followUser = async (userId: string): Promise<void> => {
  await axios.post(`/users/${userId}/follow`);
};

export const unfollowUser = async (userId: string): Promise<void> => {
  await axios.delete(`/users/${userId}/follow`);
};

export const getFollowers = async (
  userId: string,
  page = 1,
  limit = 10
): Promise<PaginatedResponse<User>> => {
  const response = await axios.get<any>(
    `/users/${userId}/followers?page=${page}&limit=${limit}`
  );

  return {
    data: response.data.followers,
    currentPage: response.data.currentPage,
    totalPages: response.data.totalPages,
    totalCount: response.data.totalCount,
  };
};

export const getFollowing = async (
  userId: string,
  page = 1,
  limit = 10
): Promise<PaginatedResponse<User>> => {
  const response = await axios.get<any>(
    `/users/${userId}/following?page=${page}&limit=${limit}`
  );

  return {
    data: response.data.following,
    currentPage: response.data.currentPage,
    totalPages: response.data.totalPages,
    totalCount: response.data.totalCount,
  };
};

// Account deactivation and reactivation
export const deactivateAccount = async (): Promise<void> => {
  await axios.put("/users/deactivate");
};

export const reactivateAccount = async (
  email: string,
  password: string
): Promise<User> => {
  const response = await axios.put<User>("/users/reactivate", {
    email,
    password,
  });
  return response.data;
};
