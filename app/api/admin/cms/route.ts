import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { CmsContent } from "@/models";
import { getUserFromRequest } from "@/lib/auth";
import { DEFAULT_CMS_DATA } from "@/lib/defaultCms";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    await connectToDatabase();
    let cms = await CmsContent.findOne();

    if (!cms) {
      cms = await CmsContent.create(DEFAULT_CMS_DATA);
    }

    return NextResponse.json({
      success: true,
      cms,
    });
  } catch (error: any) {
    console.error("Admin CMS GET error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch CMS content" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();

    let cms = await CmsContent.findOne();
    if (!cms) {
      cms = new CmsContent(DEFAULT_CMS_DATA);
    }

    if (body.header) {
      cms.header = {
        ...cms.header,
        ...body.header,
      };
    }

    if (body.footer) {
      cms.footer = {
        ...cms.footer,
        ...body.footer,
      };
    }

    if (body.hero) {
      cms.hero = {
        ...cms.hero,
        ...body.hero,
      };
    }

    if (body.occasions) {
      cms.occasions = body.occasions;
    }

    await cms.save();

    return NextResponse.json({
      success: true,
      message: "CMS Content updated and published successfully!",
      cms,
    });
  } catch (error: any) {
    console.error("Admin CMS PUT error:", error);
    return NextResponse.json({ error: error.message || "Failed to save CMS content" }, { status: 500 });
  }
}
