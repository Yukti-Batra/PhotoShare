import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload image to Cloudinary
export const uploadToCloudinary = async (filePath: string): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "instagram-mvp",
    });

    // Remove file from server after upload
    fs.unlinkSync(filePath);

    return result.secure_url;
  } catch (error) {
    // Remove file from server if upload fails
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    throw new Error(`Failed to upload image: ${error}`);
  }
};

// Extract Cloudinary public ID from URL
export const getPublicIdFromUrl = (url: string): string | null => {
  if (!url) return null;

  try {
    // URL pattern: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/public_id.ext
    const urlParts = url.split("/");
    // Get the last part (filename with extension)
    const filename = urlParts[urlParts.length - 1];
    // Get the second-to-last part (folder)
    const folder = urlParts[urlParts.length - 2];

    // Extract public ID without extension
    const publicIdWithExt = filename;
    const publicId = publicIdWithExt.substring(
      0,
      publicIdWithExt.lastIndexOf(".")
    );

    return `${folder}/${publicId}`;
  } catch (error) {
    console.error("Error extracting public ID:", error);
    return null;
  }
};

// Delete image from Cloudinary
export const deleteFromCloudinary = async (url: string): Promise<boolean> => {
  try {
    const publicId = getPublicIdFromUrl(url);
    if (!publicId) return false;

    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === "ok";
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    return false;
  }
};
