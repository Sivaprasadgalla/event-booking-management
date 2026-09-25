import { NextRequest, NextResponse } from "next/server";
import { getEmailLogs, clearEmailLogs, isSmtpConfigured } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET() {
  const logs = getEmailLogs();
  const configured = isSmtpConfigured();

  return NextResponse.json({
    success: true,
    smtpConfigured: configured,
    mode: configured ? "smtp" : "simulation",
    totalLogs: logs.length,
    latestCode: logs[0]?.code || null,
    logs,
  });
}

export async function DELETE() {
  clearEmailLogs();
  return NextResponse.json({
    success: true,
    message: "Email logs cleared",
  });
}

