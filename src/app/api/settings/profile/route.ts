import { NextRequest, NextResponse } from "next/server";

const KEYCLOAK_BASE = "http://localhost:8080";
const REALM        = "flowdesk";
const ADMIN_CLIENT = "flowdesk-try";
const ADMIN_SECRET = "uQMm0J3MG3DTpOEH7Mn7dRCZrAva372y";

// Get admin token from Keycloak
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

  if (!res.ok) return null;
  const data = await res.json();
  return data.access_token;
}

// GET — fetch user profile from Keycloak
export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("flowdesk_session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie);
    const userId  = session.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 400 });
    }

    const adminToken = await getAdminToken();
    if (!adminToken) {
      return NextResponse.json(
        { error: "Could not get admin token" },
        { status: 500 }
      );
    }

    const userRes = await fetch(
      `${KEYCLOAK_BASE}/admin/realms/${REALM}/users/${userId}`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );

    if (!userRes.ok) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const user = await userRes.json();

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
      return NextResponse.json(
        { error: `Keycloak update failed: ${errText}` },
        { status: 400 }
      );
    }

    // Update the session cookie with new name
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
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}