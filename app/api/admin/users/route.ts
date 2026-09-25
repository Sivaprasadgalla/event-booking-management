import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models";
import { getUserFromRequest, hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const search = searchParams.get("search");

    const filter: Record<string, any> = {};
    if (role && role !== "all") {
      filter.role = role;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { companyName: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter).select("-password").sort({ createdAt: -1 }).lean();

    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminUser = getUserFromRequest(req);
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();
    const {
      name,
      email,
      password,
      role = "customer",
      phone = "",
      companyName = "",
      isVerified = true,
      status = "active",
    } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required to create an account" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return NextResponse.json(
        { error: `An account with email ${cleanEmail} already exists` },
        { status: 409 }
      );
    }

    const validRole = ["customer", "organiser", "admin"].includes(role) ? role : "customer";
    const validStatus = ["active", "suspended"].includes(status) ? status : "active";
    const hashedPassword = await hashPassword(password);

    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: validRole,
      phone: phone.trim(),
      companyName: validRole === "organiser" ? companyName.trim() : "",
      isVerified: Boolean(isVerified),
      status: validStatus,
    });

    return NextResponse.json({
      success: true,
      message: `User ${newUser.name} (${validRole}) successfully created!`,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        companyName: newUser.companyName,
        isVerified: newUser.isVerified,
        status: newUser.status,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Admin create user error:", error);
    return NextResponse.json({ error: error.message || "Failed to create user" }, { status: 500 });
  }
}
