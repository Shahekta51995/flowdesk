import { NextRequest, NextResponse } from "next/server";

const KEYCLOAK_BASE =
  process.env.KEYCLOAK_INTERNAL_URL || process.env.KEYCLOAK_URL!;
const REALM = process.env.KEYCLOAK_REALM || "flowdesk";
const CLIENT_ID = process.env.KEYCLOAK_ID!;
const CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password required" },
        { status: 400 },
      );
    }

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      username,
      password,
      grant_type: "password",
      scope: "openid profile",
    });

    const keycloakRes = await fetch(
      `${KEYCLOAK_BASE}/realms/${REALM}/protocol/openid-connect/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      },
    );

    if (!keycloakRes.ok) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 },
      );
    }

    const tokenData = await keycloakRes.json();

    const userInfoRes = await fetch(
      `${KEYCLOAK_BASE}/realms/${REALM}/protocol/openid-connect/userinfo`,
      { headers: { Authorization: `Bearer ${tokenData.access_token}` } },
    );

    const userInfo = await userInfoRes.json();
    const tokenPayload = JSON.parse(
      Buffer.from(tokenData.access_token.split(".")[1], "base64url").toString(),
    );

    console.log("Token payload roles:", tokenPayload.realm_access?.roles);

    const roles = tokenPayload.realm_access?.roles || [];
    const isAdmin = roles.includes("admin");

    const user = {
      id: userInfo.sub,
      name: `${userInfo.given_name || ""} ${userInfo.family_name || ""}`.trim(),
      email: userInfo.email,
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
    response.cookies.set(
      "flowdesk_session",
      JSON.stringify({
        user,
        accessToken: tokenData.access_token,
      }),
      {
        httpOnly: false,
        secure: false,
        sameSite: "lax",
        maxAge: 60 * 60 * 8,
        path: "/",
      },
    );

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Authentication server unavailable" },
      { status: 500 },
    );
  }
}
