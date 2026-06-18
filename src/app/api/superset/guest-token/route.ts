import { NextRequest, NextResponse } from "next/server";

const SUPERSET_URL   = process.env.SUPERSET_URL|| "http://localhost:8089";
const ADMIN_USERNAME = process.env.SUPERSET_ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.SUPERSET_ADMIN_PASSWORD || "admin";
const EMBED_UUID     = process.env.SUPERSET_EMBED_UUID     || "";

async function getSupersetTokens() {
  const res = await fetch(`${SUPERSET_URL}/api/v1/security/login`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: ADMIN_USERNAME,
      password: ADMIN_PASSWORD,
      provider: "db",
      refresh:  true,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Superset login failed: ${err}`);
  }

  const data = await res.json();
  return {
    accessToken:  data.access_token,
    refreshToken: data.refresh_token,
  };
}

async function getCsrfToken(accessToken: string) {
  const res = await fetch(
    `${SUPERSET_URL}/api/v1/security/csrf_token/`,
    {
      method:  "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type":  "application/json",
      },
    }
  );

  if (!res.ok) return null;
  const data = await res.json();
  return data.result;
}

async function getGuestToken(accessToken: string, csrfToken: string | null) {
  const headers: Record<string, string> = {
    "Content-Type":  "application/json",
    "Authorization": `Bearer ${accessToken}`,
  };

  if (csrfToken) {
    headers["X-CSRFToken"] = csrfToken;
    headers["Referer"]     = SUPERSET_URL;
  }

  const res = await fetch(
    `${SUPERSET_URL}/api/v1/security/guest_token/`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        resources: [{
          type: "dashboard",
          id:   EMBED_UUID,
        }],
        rls:  [],
        user: {
          username:   "flowdesk_viewer",
          first_name: "FlowDesk",
          last_name:  "Viewer",
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Guest token failed: ${err}`);
  }

  const data = await res.json();
  return data.token;
}

export async function GET(req: NextRequest) {
  try {
    // const sessionCookie = req.cookies.get("flowdesk_session")?.value;
    // if (!sessionCookie) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    // Step 1 — Login
    const { accessToken } = await getSupersetTokens();

    // Step 2 — Get CSRF token
    const csrfToken = await getCsrfToken(accessToken);

    // Step 3 — Get guest token
    const guestToken = await getGuestToken(accessToken, csrfToken);

    return NextResponse.json({ success: true, token: guestToken });

  } catch (error: any) {
    console.error("Superset token error:", error.message,error.cause);
    return NextResponse.json(
      { success: false, error: error.message,cause: String(error.cause)  },
      { status: 500 }
    );
  }
}