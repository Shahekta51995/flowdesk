import { NextRequest, NextResponse } from "next/server";

const KEYCLOAK_BASE = process.env.KEYCLOAK_INTERNAL_URL || process.env.KEYCLOAK_URL!;
const REALM         = process.env.KEYCLOAK_REALM || "flowdesk";
const ADMIN_CLIENT  = process.env.KEYCLOAK_ID!;
const ADMIN_SECRET  = process.env.KEYCLOAK_CLIENT_SECRET!;

// Get admin token from Keycloak using client credentials
async function getAdminToken() {
  const params = new URLSearchParams({
    client_id:     ADMIN_CLIENT,
    client_secret: ADMIN_SECRET,
    grant_type:    "client_credentials",
  });

  const res = await fetch(
    `${KEYCLOAK_BASE}/realms/${REALM}/protocol/openid-connect/token`,
    {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body:    params.toString(),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error("Admin token error:", err);
    return null;
  }
  const data = await res.json();
  return data.access_token;
}

// GET — fetch user profile from Keycloak
export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("flowdesk_session")?.value;
    console.log("sessionCookie exists:", !!sessionCookie);

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session   = JSON.parse(sessionCookie);
    const userId    = session.user?.id;
    const userToken = session.accessToken;

    console.log("userId:", userId);

    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 400 });
    }

    // Try with user's own access token first
    let userRes = await fetch(
      `${KEYCLOAK_BASE}/admin/realms/${REALM}/users/${userId}`,
      { headers: { Authorization: `Bearer ${userToken}` } }
    );

    // If user token doesn't have admin rights, fall back to client credentials
    if (!userRes.ok) {
      console.log("User token failed, trying admin token...");
      const adminToken = await getAdminToken();
      if (!adminToken) {
        return NextResponse.json(
          { error: "Could not get admin token" },
          { status: 500 }
        );
      }

      userRes = await fetch(
        `${KEYCLOAK_BASE}/admin/realms/${REALM}/users/${userId}`,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
    }

    if (!userRes.ok) {
      const errText = await userRes.text();
      console.error("Keycloak user fetch failed:", userRes.status, errText);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const user = await userRes.json();
    console.log("Fetched user:", user.username);

    return NextResponse.json({
      success: true,
      profile: {
        id:         user.id,
        username:   user.username,
        firstName:  user.firstName  || "",
        lastName:   user.lastName   || "",
        email:      user.email      || "",
        enabled:    user.enabled,
        createdAt:  new Date(user.createdTimestamp).toLocaleDateString("en-IN"),
        attributes: user.attributes || {},
      },
    });

  } catch (error: any) {
    console.error("Settings GET error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// PUT — update user profile in Keycloak
export async function PUT(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("flowdesk_session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie);
    const userId  = session.user?.id;

    const { firstName, lastName, email } = await req.json();

    const adminToken = await getAdminToken();
    if (!adminToken) {
      return NextResponse.json(
        { error: "Could not get admin token" },
        { status: 500 }
      );
    }

    const updateRes = await fetch(
      `${KEYCLOAK_BASE}/admin/realms/${REALM}/users/${userId}`,
      {
        method:  "PUT",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ firstName, lastName, email }),
      }
    );

    if (!updateRes.ok) {
      const errText = await updateRes.text();
      console.error("Keycloak update failed:", errText);
      return NextResponse.json(
        { error: `Keycloak update failed: ${errText}` },
        { status: 400 }
      );
    }

    const newName    = `${firstName} ${lastName}`.trim();
    const newSession = {
      ...session,
      user: { ...session.user, name: newName, email },
    };

    const response = NextResponse.json({ success: true });
    response.cookies.set("flowdesk_session", JSON.stringify(newSession), {
      httpOnly: false,
      secure:   false,
      sameSite: "lax",
      maxAge:   60 * 60 * 8,
      path:     "/",
    });

    return response;

  } catch (error: any) {
    console.error("Settings PUT error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}