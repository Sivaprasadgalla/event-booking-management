import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { CmsContent } from "@/models";
import { getUserFromRequest } from "@/lib/auth";
import { DEFAULT_CMS_DATA } from "@/lib/defaultCms";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    await connectToDatabase();
    await CmsContent.deleteMany({});
    const cms = await CmsContent.create(DEFAULT_CMS_DATA);

    return NextResponse.json({
      success: true,
      message: "CMS content has been restored to factory default presets.",
      cms,
    });
  } catch (error: any) {
    console.error("CMS Reset error:", error);
    return NextResponse.json({ error: error.message || "Failed to reset CMS" }, { status: 500 });
  }
}
