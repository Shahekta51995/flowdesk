import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password required" },
        { status: 400 }
      );
    }

    const params = new URLSearchParams({
      client_id:     "flowdesk-try",
      client_secret: "uQMm0J3MG3DTpOEH7Mn7dRCZrAva372y",
      username,
      password,
      grant_type:    "password",
      scope:         "openid profile",
    });

    const keycloakRes = await fetch(
      `http://localhost:8080/realms/flowdesk/protocol/openid-connect/token`,
      {
        method:  "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body:    params.toString(),
      }
    );

    if (!keycloakRes.ok) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    const tokenData = await keycloakRes.json();

    const userInfoRes = await fetch(
      `http://localhost:8080/realms/flowdesk/protocol/openid-connect/userinfo`,
      { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
    );

    const userInfo = await userInfoRes.json();
    const roles    = userInfo.realm_access?.roles || [];
    const isAdmin  = roles.includes("admin");

    const user = {
      id:       userInfo.sub,
      name:     `${userInfo.given_name || ""} ${userInfo.family_name || ""}`.trim(),
      email:    userInfo.email,
      username: userInfo.preferred_username,
      roles,
      isAdmin,
    };

    // Build response with cookie
    const response = NextResponse.json({
      success: true,
      user,
      accessToken: tokenData.access_token,
    });

    // Set session cookie — middleware will read this
    response.cookies.set("flowdesk_session", JSON.stringify({
      user,
      accessToken: tokenData.access_token,
    }), {
      httpOnly: false,
      secure:   false,
      sameSite: "lax",
      maxAge:   60 * 60 * 8,
      path:     "/",
    });

    return response;

  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Authentication server unavailable" },
      { status: 500 }
    );
  }
}