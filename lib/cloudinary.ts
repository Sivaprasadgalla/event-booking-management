import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

// Initialize Cloudinary v2 configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };
export { EVENT_IMAGE_PRESETS } from "./presets";

/**
 * Clean user names into valid Cloudinary folder paths
 */
export function sanitizeFolderName(name: string): string {
  if (!name) return "unnamed_user";
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_");
}

/**
 * Resolves each organiser's dedicated Cloudinary media folder using their Name and Unique ID.
 * Folder structure in Cloudinary:
 * celebratehub/organisers/{organiser_name}_{organiser_id}/{mediaType}
 */
export function getOrganizerMediaFolder(
  user: { id: string; name: string; role?: string },
  mediaType: "events" | "gallery" | "profile" = "events"
): string {
  const sanitized = sanitizeFolderName(user.name);
  const userId = user.id || "anonymous";

  if (user.role === "organiser") {
    return `celebratehub/organisers/${sanitized}_${userId}/${mediaType}`;
  } else if (user.role === "admin") {
    return `celebratehub/admin/${sanitized}_${userId}/${mediaType}`;
  }
  return `celebratehub/customers/${sanitized}_${userId}/${mediaType}`;
}

/**
 * Check if Cloudinary environment variables are configured
 */
export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

/**
 * Upload a Buffer directly to Cloudinary into a dedicated folder
 */
export async function uploadBufferToCloudinary(
  buffer: Buffer,
  folder: string,
  options: {
    publicId?: string;
    transformation?: any[];
  } = {}
): Promise<{ url: string; publicId: string; folder: string }> {
  if (!isCloudinaryConfigured()) {
    console.warn(
      "[Cloudinary] Credentials not configured in .env.local. Falling back to data URI preview."
    );
    // Base64 fallback for local development without credentials
    const base64 = buffer.toString("base64");
    const dataUri = `data:image/jpeg;base64,${base64}`;
    return {
      url: dataUri,
      publicId: `mock_${Date.now()}`,
      folder,
    };
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: options.publicId,
        resource_type: "image",
        transformation: options.transformation || [
          { quality: "auto", fetch_format: "auto" },
        ],
      },
      (error, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          console.error("[Cloudinary Upload Error]", error);
          return reject(error || new Error("Cloudinary upload failed"));
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          folder,
        });
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Legacy wrapper for base64 strings
 */
export async function uploadImageToCloudinary(
  fileBase64: string,
  folder: string = "celebratehub/general"
): Promise<string> {
  if (!isCloudinaryConfigured()) {
    return fileBase64;
  }

  try {
    const res = await cloudinary.uploader.upload(fileBase64, {
      folder,
      resource_type: "image",
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    });
    return res.secure_url;
  } catch (error) {
    console.error("Cloudinary base64 upload failed:", error);
    return fileBase64;
  }
}
