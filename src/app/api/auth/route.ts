import { NextRequest, NextResponse } from "next/server";
import {
  validateCredentials,
  generateToken,
  buildSetCookieHeader,
} from "@/lib/auth";
import { validateEnvVars } from "@/lib/env";

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    validateEnvVars();
    
    const body = await request.json();
    const { username, password } = body as {
      username?: string;
      password?: string;
    };

    if (!username || !password) {
      return NextResponse.json(
        { error: "Bad Request", message: "Username and password are required" },
        { status: 400 }
      );
    }

    const isValid = validateCredentials(String(username), String(password));

    if (!isValid) {
      console.log(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          event_type: "auth_attempt",
          endpoint: "/api/auth",
          method: "POST",
          status: 401,
          success: false,
          reason: "invalid_credentials",
          duration_ms: Date.now() - startTime,
        })
      );

      return NextResponse.json(
        {
          error: "Invalid credentials",
          message: "Username or password is incorrect",
        },
        { status: 401 }
      );
    }

    const token = generateToken();
    const cookieHeader = buildSetCookieHeader(token);

    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        event_type: "auth_attempt",
        endpoint: "/api/auth",
        method: "POST",
        status: 200,
        success: true,
        duration_ms: Date.now() - startTime,
      })
    );

    const response = NextResponse.json({ success: true }, { status: 200 });
    response.headers.set("Set-Cookie", cookieHeader);
    return response;
  } catch (e: any) {
    return NextResponse.json(
      { error: "Bad Request", message: e.message || "Invalid request body" },
      { status: 400 }
    );
  }
}
