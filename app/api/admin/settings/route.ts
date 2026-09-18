import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Setting } from "@/models";
import { getUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();
    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create({
        platformName: "CelebrateHub Luxury Celebrations",
        platformFeePercent: 5,
        taxPercent: 18,
        currency: "INR",
        supportEmail: "support@celebratehub.com",
      });
    }
    return NextResponse.json({ setting });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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

    let setting = await Setting.findOne();
    if (!setting) {
      setting = new Setting();
    }

    if (body.platformName !== undefined) setting.platformName = body.platformName;
    if (body.platformFeePercent !== undefined) setting.platformFeePercent = Number(body.platformFeePercent);
    if (body.taxPercent !== undefined) setting.taxPercent = Number(body.taxPercent);
    if (body.currency !== undefined) setting.currency = body.currency;
    if (body.supportEmail !== undefined) setting.supportEmail = body.supportEmail;
    if (body.allowNewOrganiserRegistration !== undefined)
      setting.allowNewOrganiserRegistration = Boolean(body.allowNewOrganiserRegistration);

    await setting.save();

    return NextResponse.json({
      success: true,
      message: "Platform settings updated successfully",
      setting,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
