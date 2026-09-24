import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { CmsContent } from "@/models";
import { DEFAULT_CMS_DATA } from "@/lib/defaultCms";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();
    let cms: any = await CmsContent.findOne().lean();

    if (!cms) {
      // Auto-initialize with default CMS content
      const created = await CmsContent.create(DEFAULT_CMS_DATA);
      cms = created.toObject();
    }

    return NextResponse.json({
      success: true,
      cms: cms || DEFAULT_CMS_DATA,
    });
  } catch (error: any) {
    console.error("Public CMS fetch error:", error);
    // Return defaults on error so public pages never fail
    return NextResponse.json({
      success: true,
      cms: DEFAULT_CMS_DATA,
      fallback: true,
    });
  }
}
