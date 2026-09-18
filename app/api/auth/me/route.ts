import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const sessionUser = getUserFromRequest(req);
    if (!sessionUser) {
      return NextResponse.json({ user: null });
    }

    await connectToDatabase();
    const user = await User.findById(sessionUser.id).select("-password");
    if (!user || user.status === "suspended") {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        companyName: user.companyName,
        isVerified: user.isVerified,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ user: null });
  }
}
