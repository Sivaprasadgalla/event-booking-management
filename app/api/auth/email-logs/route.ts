import { NextRequest, NextResponse } from "next/server";
import { getEmailLogs, clearEmailLogs, isSmtpConfigured } from "@/lib/email";
import { getUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
  }

  const rawLogs = getEmailLogs();
  const configured = isSmtpConfigured();

  // Mask OTP codes for production security
  const sanitizedLogs = rawLogs.map((log) => ({
    ...log,
    code: log.code ? `${log.code.substring(0, 1)}****${log.code.substring(5)}` : undefined,
  }));

  return NextResponse.json({
    success: true,
    smtpConfigured: configured,
    mode: configured ? "smtp" : "simulation",
    totalLogs: sanitizedLogs.length,
    logs: sanitizedLogs,
  });
}

export async function DELETE(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
  }

  clearEmailLogs();
  return NextResponse.json({
    success: true,
    message: "Email delivery logs purged",
  });
}
