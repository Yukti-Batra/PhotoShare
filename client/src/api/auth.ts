import axios from "./axios";
import { AuthUser, LoginCredentials, RegisterCredentials } from "../types";

export const login = async (
  credentials: LoginCredentials
): Promise<AuthUser> => {
  const response = await axios.post<AuthUser>("/auth/login", credentials);
  return response.data;
};

export const register = async (
  credentials: RegisterCredentials
): Promise<AuthUser> => {
  const response = await axios.post<AuthUser>("/auth/register", credentials);
  return response.data;
};

export const googleAuth = async (idToken: string): Promise<AuthUser> => {
  const response = await axios.post<AuthUser>("/auth/google", { idToken });
  return response.data;
};

export const logout = async (): Promise<void> => {
  await axios.post("/auth/logout");
};

export const getCurrentUser = async (): Promise<AuthUser> => {
  const response = await axios.get<AuthUser>("/auth/me");
  return response.data;
};
