"use client";

import Header from "@/components/ui/Header";
import { useState, useEffect } from "react";
import {
  User, Save, Check, Loader2,
  Shield,RefreshCw
} from "lucide-react";

type Tab = "profile" | "security" ;

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [error,     setError]     = useState("");
  const [showKey,   setShowKey]   = useState(false);
  const [copied,    setCopied]    = useState(false);

  const [profile, setProfile] = useState({
    username:  "",
    firstName: "",
    lastName:  "",
    email:     "",
    createdAt: "",
    roles:     [] as string[],
    isAdmin:   false,
  });

  // Fetch real profile from Keycloak via our API
  const fetchProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/settings/profile");
      const json = await res.json();

      if (json.success) {
        // Also get roles from cookie
        const cookies       = document.cookie.split(";");
        const sessionCookie = cookies.find(c =>
          c.trim().startsWith("flowdesk_session=")
        );
        let roles:   string[] = [];
        let isAdmin: boolean  = false;
        if (sessionCookie) {
          try {
            const value   = decodeURIComponent(sessionCookie.split("=")[1]);
            const session = JSON.parse(value);
            roles   = session.user?.roles   || [];
            isAdmin = session.user?.isAdmin || false;
          } catch {}
        }

        setProfile({
          username:  json.profile.username,
          firstName: json.profile.firstName,
          lastName:  json.profile.lastName,
          email:     json.profile.email,
          createdAt: json.profile.createdAt,
          roles,
          isAdmin,
        });
      } else {
        setError(json.error || "Failed to load profile");
      }
    } catch (err) {
      setError("Could not connect to Keycloak");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res  = await fetch("/api/settings/profile", {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          firstName: profile.firstName,
          lastName:  profile.lastName,
          email:     profile.email,
        }),
      });

      const json = await res.json();

      if (json.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(json.error || "Failed to save");
      }
    } catch (err) {
      setError("Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const apiKey = `fd_live_sk_${(profile.username || "user").slice(0, 6)}_${"x".repeat(24)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px",
    borderRadius: "8px", backgroundColor: "#0f1117",
    border: "1px solid #2a2d3e", color: "#ffffff",
    fontSize: "14px", outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "12px", fontWeight: 600,
    color: "#8b8fa8", marginBottom: "6px",
    display: "block", textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: "profile",  label: "Profile",  icon: User   },
    { key: "security", label: "Security", icon: Shield },
  ];

  return (
    <div style={{ flex: 1, overflowY: "auto", backgroundColor: "#0f1117" }}>
      <Header
        title="Settings"
        subtitle="Manage your account — synced with Keycloak"
      />

      <div style={{ padding: "32px", display: "flex", gap: "24px" }}>

        {/* Tab Sidebar */}
        <div style={{
          width: "180px", flexShrink: 0,
          display: "flex", flexDirection: "column", gap: "4px"
        }}>
          {tabs.map(tab => {
            const Icon     = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "10px 14px", borderRadius: "8px",
                  border: "none", cursor: "pointer", width: "100%",
                  backgroundColor: isActive ? "#6366f120" : "transparent",
                  color:           isActive ? "#6366f1"   : "#8b8fa8",
                  fontSize: "14px", fontWeight: isActive ? 600 : 400,
                  borderLeft: `2px solid ${isActive ? "#6366f1" : "transparent"}`,
                  transition: "all 0.15s ease",
                }}>
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Error */}
          {error && (
            <div style={{
              backgroundColor: "#ef444415",
              border: "1px solid #ef444440",
              borderRadius: "8px", padding: "12px",
              fontSize: "13px", color: "#ef4444"
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* ── Profile Tab ── */}
          {activeTab === "profile" && (
            <div style={{
              backgroundColor: "#1a1d27", borderRadius: "12px",
              border: "1px solid #2a2d3e", overflow: "hidden"
            }}>

              {/* Avatar Header */}
              <div style={{
                padding: "24px", borderBottom: "1px solid #2a2d3e",
                display: "flex", alignItems: "center",
                justifyContent: "space-between",
                background: "linear-gradient(90deg, #6366f110, transparent)"
              }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: "16px"
                }}>
                  {loading ? (
                    <div style={{
                      width: "64px", height: "64px", borderRadius: "50%",
                      backgroundColor: "#2a2d3e",
                      display: "flex", alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <Loader2 size={20} color="#6366f1"
                        style={{ animation: "spin 1s linear infinite" }} />
                    </div>
                  ) : (
                    <div style={{
                      width: "64px", height: "64px", borderRadius: "50%",
                      backgroundColor: "#6366f1",
                      display: "flex", alignItems: "center",
                      justifyContent: "center",
                      fontSize: "22px", fontWeight: 800, color: "#ffffff",
                      boxShadow: "0 0 20px #6366f140"
                    }}>
                      {(profile.firstName?.[0] || profile.username?.[0] || "U").toUpperCase()}
                      {(profile.lastName?.[0]  || "").toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff" }}>
                      {loading ? "Loading..." : `${profile.firstName} ${profile.lastName}`.trim() || profile.username}
                    </p>
                    <p style={{ fontSize: "13px", color: "#8b8fa8", marginTop: "3px" }}>
                      @{profile.username}
                    </p>
                    <div style={{ display: "flex", gap: "6px", marginTop: "8px", flexWrap: "wrap" }}>
                      {profile.roles
                        .filter(r => !["default-roles-flowdesk", "offline_access", "uma_authorization"].includes(r))
                        .map(role => (
                          <span key={role} style={{
                            fontSize: "10px", padding: "2px 8px",
                            borderRadius: "20px", fontWeight: 600,
                            backgroundColor: role === "admin" ? "#6366f120" : "#10b98120",
                            color:           role === "admin" ? "#6366f1"   : "#10b981",
                            border: `1px solid ${role === "admin" ? "#6366f130" : "#10b98130"}`
                          }}>
                            ● {role}
                          </span>
                        ))
                      }
                    </div>
                  </div>
                </div>

                {/* Keycloak badge */}
                <div style={{
                  padding: "8px 14px", borderRadius: "8px",
                  backgroundColor: "#6366f110",
                  border: "1px solid #6366f130",
                  display: "flex", alignItems: "center", gap: "6px"
                }}>
                  <Shield size={13} color="#6366f1" />
                  <span style={{ fontSize: "12px", color: "#6366f1", fontWeight: 600 }}>
                    Keycloak IAM
                  </span>
                </div>
              </div>

              {/* Form Fields */}
              {loading ? (
                <div style={{
                  padding: "48px", display: "flex",
                  alignItems: "center", justifyContent: "center", gap: "12px"
                }}>
                  <Loader2 size={20} color="#6366f1"
                    style={{ animation: "spin 1s linear infinite" }} />
                  <span style={{ color: "#8b8fa8" }}>
                    Loading from Keycloak...
                  </span>
                </div>
              ) : (
                <div style={{
                  padding: "24px",
                  display: "flex", flexDirection: "column", gap: "20px"
                }}>

                  {/* Username — readonly */}
                  <div>
                    <label style={labelStyle}>Username</label>
                    <div style={{
                      ...inputStyle,
                      backgroundColor: "#0a0d14",
                      color: "#8b8fa8",
                      display: "flex", alignItems: "center",
                      justifyContent: "space-between"
                    }}>
                      <span>{profile.username}</span>
                      <span style={{
                        fontSize: "10px", padding: "2px 6px",
                        borderRadius: "4px", backgroundColor: "#2a2d3e",
                        color: "#8b8fa8"
                      }}>
                        read-only
                      </span>
                    </div>
                  </div>

                  {/* Name fields */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr", gap: "16px"
                  }}>
                    <div>
                      <label style={labelStyle}>First Name</label>
                      <input
                        style={inputStyle}
                        value={profile.firstName}
                        onChange={e => setProfile({
                          ...profile, firstName: e.target.value
                        })}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Last Name</label>
                      <input
                        style={inputStyle}
                        value={profile.lastName}
                        onChange={e => setProfile({
                          ...profile, lastName: e.target.value
                        })}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label style={labelStyle}>
                      Email Address
                    </label>
                    <input
                      style={inputStyle}
                      type="email"
                      value={profile.email}
                      onChange={e => setProfile({
                        ...profile, email: e.target.value
                      })}
                    />
                  </div>

                  {/* Account created */}
                  <div style={{
                    padding: "12px 16px", borderRadius: "8px",
                    backgroundColor: "#0f1117", border: "1px solid #2a2d3e",
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between"
                  }}>
                    <span style={{ fontSize: "13px", color: "#8b8fa8" }}>
                      Account created
                    </span>
                    <span style={{ fontSize: "13px", color: "#ffffff", fontWeight: 500 }}>
                      {profile.createdAt}
                    </span>
                  </div>

                </div>
              )}
            </div>
          )}

          {/* ── Security Tab ── */}
          {activeTab === "security" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* Keycloak Info Card */}
              <div style={{
                backgroundColor: "#1a1d27", borderRadius: "12px",
                border: "1px solid #6366f140", padding: "24px",
                display: "flex", gap: "16px"
              }}>
                <div style={{
                  width: "48px", height: "48px", borderRadius: "12px",
                  backgroundColor: "#6366f120",
                  display: "flex", alignItems: "center",
                  justifyContent: "center", flexShrink: 0
                }}>
                  <Shield size={22} color="#6366f1" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontSize: "15px", fontWeight: 700,
                    color: "#ffffff", marginBottom: "8px"
                  }}>
                    Secured by Keycloak IAM
                  </p>
                  <p style={{
                    fontSize: "13px", color: "#8b8fa8",
                    lineHeight: 1.6, marginBottom: "16px"
                  }}>
                    Your account security is fully managed by Keycloak Identity &
                    Access Management. This includes password policies, session
                    management, MFA, and role-based access control.
                  </p>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {[
                      "OAuth 2.0",
                      "OpenID Connect",
                      "RBAC",
                      "Direct Grant",
                      "JWT Tokens",
                    ].map(badge => (
                      <span key={badge} style={{
                        fontSize: "11px", padding: "4px 10px",
                        borderRadius: "20px", fontWeight: 600,
                        backgroundColor: "#6366f120", color: "#6366f1",
                        border: "1px solid #6366f130"
                      }}>
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Account Info */}
              <div style={{
                backgroundColor: "#1a1d27", borderRadius: "12px",
                border: "1px solid #2a2d3e", overflow: "hidden"
              }}>
                <div style={{
                  padding: "16px 20px", borderBottom: "1px solid #2a2d3e"
                }}>
                  <h3 style={{
                    color: "#ffffff", fontWeight: 600, fontSize: "14px"
                  }}>
                    Account Information
                  </h3>
                </div>
                <div style={{
                  padding: "16px 20px",
                  display: "flex", flexDirection: "column", gap: "12px"
                }}>
                  {[
                    { label: "Identity Provider", value: "Keycloak" },
                    { label: "Realm",             value: "flowdesk"                  },
                    { label: "Auth Protocol",     value: "OpenID Connect / OAuth 2.0"},
                    { label: "Token Type",        value: "JWT (RS256)"               },
                    { label: "Session Duration",  value: "8 hours"                   },
                    { label: "Account Status",    value: "Active ✓",    green: true  },
                  ].map((item: any) => (
                    <div key={item.label} style={{
                      display: "flex", alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px", borderRadius: "8px",
                      backgroundColor: "#0f1117"
                    }}>
                      <span style={{ fontSize: "13px", color: "#8b8fa8" }}>
                        {item.label}
                      </span>
                      <span style={{
                        fontSize: "13px", fontWeight: 500,
                        color: item.green ? "#10b981" : "#ffffff",
                        fontFamily: item.label === "Realm" ? "monospace" : "inherit"
                      }}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Logout all sessions */}
              <div style={{
                backgroundColor: "#1a1d27", borderRadius: "12px",
                border: "1px solid #ef444430", padding: "20px",
                display: "flex", alignItems: "center",
                justifyContent: "space-between"
              }}>
                <div>
                  <p style={{
                    fontSize: "14px", fontWeight: 600, color: "#ffffff"
                  }}>
                    Sign out of all sessions
                  </p>
                  <p style={{ fontSize: "12px", color: "#8b8fa8", marginTop: "4px" }}>
                    This will log you out from all devices
                  </p>
                </div>
                <button
                  onClick={async () => {
                    await fetch("/api/auth/logout", { method: "POST" });
                    window.location.href = "/login";
                  }}
                  style={{
                    padding: "8px 16px", borderRadius: "8px",
                    backgroundColor: "#ef444420",
                    border: "1px solid #ef444440",
                    color: "#ef4444", fontSize: "13px",
                    fontWeight: 600, cursor: "pointer"
                  }}>
                  Sign Out All
                </button>
              </div>
            </div>
          )}

   

          {/* Save Button — only for profile tab */}
          {activeTab === "profile" && !loading && (
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "12px 28px", borderRadius: "10px",
                  backgroundColor: saved ? "#10b981" : "#6366f1",
                  border: "none", color: "#ffffff",
                  fontSize: "14px", fontWeight: 700,
                  cursor: saving ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                  minWidth: "160px", justifyContent: "center",
                  opacity: saving ? 0.8 : 1,
                }}>
                {saving ? (
                  <>
                    <Loader2 size={16}
                      style={{ animation: "spin 1s linear infinite" }} />
                    Saving to Keycloak...
                  </>
                ) : saved ? (
                  <><Check size={16} /> Saved to Keycloak!</>
                ) : (
                  <><Save size={16} /> Save Changes</>
                )}
              </button>
              <style>{`
                @keyframes spin {
                  from { transform: rotate(0deg); }
                  to   { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          )}

          {/* Refresh button */}
          {activeTab === "profile" && !loading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <button
                onClick={fetchProfile}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "8px 14px", borderRadius: "8px",
                  backgroundColor: "transparent",
                  border: "1px solid #2a2d3e",
                  color: "#8b8fa8", fontSize: "12px", cursor: "pointer"
                }}>
                <RefreshCw size={12} />
                Refresh from Keycloak
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}