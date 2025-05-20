import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Generate JWT token
export const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: "30d",
  });
};
