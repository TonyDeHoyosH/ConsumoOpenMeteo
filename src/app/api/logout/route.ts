import { NextRequest, NextResponse } from "next/server";
import { buildClearCookieHeader, COOKIE_NAME } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Not authenticated" },
      { status: 401 }
    );
  }

  const clearCookie = buildClearCookieHeader();

  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      event: "logout",
    })
  );

  const response = NextResponse.json(
    { success: true, message: "Logged out successfully" },
    { status: 200 }
  );
  response.headers.set("Set-Cookie", clearCookie);
  return response;
}
