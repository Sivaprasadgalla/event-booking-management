import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getOrganizerMediaFolder, uploadBufferToCloudinary } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to upload media." },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const mediaType =
      (formData.get("type") as "events" | "gallery" | "profile") || "events";

    // Dedicated folder per organizer / user
    // celebratehub/organisers/{name}_{id}/{mediaType}
    const targetFolder = getOrganizerMediaFolder(user, mediaType);

    // Get all files under 'file', 'files', or 'images'
    const files: File[] = [];
    const entries = [
      ...formData.getAll("file"),
      ...formData.getAll("files"),
      ...formData.getAll("images"),
    ];

    for (const item of entries) {
      if (item instanceof File) {
        files.push(item);
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No image file provided for upload." },
        { status: 400 }
      );
    }

    const uploadResults = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          {
            error: `File '${file.name}' is not an image. Only image formats are supported.`,
          },
          { status: 400 }
        );
      }

      // 10MB limit per image
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: `File '${file.name}' exceeds the 10MB size limit.` },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const result = await uploadBufferToCloudinary(buffer, targetFolder);
      uploadResults.push(result);
    }

    return NextResponse.json({
      success: true,
      url: uploadResults[0]?.url,
      urls: uploadResults.map((r) => r.url),
      folder: targetFolder,
      count: uploadResults.length,
      results: uploadResults,
    });
  } catch (error: any) {
    console.error("Upload API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload image to Cloudinary" },
      { status: 500 }
    );
  }
}
