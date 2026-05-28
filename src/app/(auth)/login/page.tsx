"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Zap, Shield, BarChart3, CreditCard,
  Loader2, Eye, EyeOff, User, Lock
} from "lucide-react";

export default function LoginPage() {
  const router   = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Call our own API route directly — no NextAuth signIn needed
      const res  = await fetch("/api/auth/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Invalid username or password");
        setLoading(false);
        return;
      }

      // Store user in sessionStorage
      sessionStorage.setItem("flowdesk_user", JSON.stringify(data.user));
      sessionStorage.setItem("flowdesk_token", data.accessToken);
console.log("datttt",data)
      // Redirect based on role
      if (data.user.isAdmin) {
        console.log("test coming")
        router.push("/dashboard");
      } else {
        router.push("/app");
      }

    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const fillCredentials = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setError("");
  };

  return (
    <div style={{
      minHeight: "100vh", backgroundColor: "#0f1117",
      display: "flex", alignItems: "center",
      justifyContent: "center", padding: "20px"
    }}>
      <div style={{
        width: "100%", maxWidth: "420px",
        display: "flex", flexDirection: "column", gap: "24px"
      }}>

        {/* Logo */}
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "14px",
            backgroundColor: "#6366f1",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px", boxShadow: "0 0 40px #6366f140"
          }}>
            <Zap size={28} color="white" fill="white" />
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#ffffff" }}>
            FlowDesk
          </h1>
          <p style={{ fontSize: "14px", color: "#8b8fa8", marginTop: "6px" }}>
            Enterprise Analytics & Payments Platform
          </p>
        </div>

        {/* Feature Pills */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          {[
            { icon: BarChart3,  label: "Real-time Analytics", color: "#6366f1" },
            { icon: CreditCard, label: "UPI Payments",        color: "#10b981" },
            { icon: Shield,     label: "Keycloak IAM",        color: "#f59e0b" },
            { icon: Zap,        label: "StarRocks OLAP",      color: "#ef4444" },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.label} style={{
                padding: "12px", borderRadius: "10px",
                backgroundColor: "#1a1d27", border: "1px solid #2a2d3e",
                display: "flex", alignItems: "center", gap: "10px"
              }}>
                <Icon size={15} color={f.color} />
                <span style={{ fontSize: "12px", color: "#8b8fa8" }}>
                  {f.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Login Card */}
        <div style={{
          backgroundColor: "#1a1d27", border: "1px solid #2a2d3e",
          borderRadius: "16px", padding: "32px",
          display: "flex", flexDirection: "column", gap: "20px"
        }}>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#ffffff" }}>
              Welcome back
            </h2>
            <p style={{ fontSize: "13px", color: "#8b8fa8", marginTop: "6px" }}>
              Credentials verified via Keycloak IAM
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              backgroundColor: "#ef444415",
              border: "1px solid #ef444440",
              borderRadius: "8px", padding: "12px",
              fontSize: "13px", color: "#ef4444",
              display: "flex", alignItems: "center", gap: "8px"
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleLogin}
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            {/* Username */}
            <div>
              <label style={{
                fontSize: "12px", fontWeight: 600, color: "#8b8fa8",
                marginBottom: "6px", display: "block",
                textTransform: "uppercase", letterSpacing: "0.05em"
              }}>
                Username
              </label>
              <div style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "12px 14px", borderRadius: "8px",
                backgroundColor: "#0f1117",
                border: `1px solid ${username ? "#6366f1" : "#2a2d3e"}`,
                transition: "border-color 0.15s ease"
              }}>
                <User size={15} color="#8b8fa8" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  style={{
                    background: "none", border: "none", outline: "none",
                    color: "#ffffff", fontSize: "14px", width: "100%"
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{
                fontSize: "12px", fontWeight: 600, color: "#8b8fa8",
                marginBottom: "6px", display: "block",
                textTransform: "uppercase", letterSpacing: "0.05em"
              }}>
                Password
              </label>
              <div style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "12px 14px", borderRadius: "8px",
                backgroundColor: "#0f1117",
                border: `1px solid ${password ? "#6366f1" : "#2a2d3e"}`,
                transition: "border-color 0.15s ease"
              }}>
                <Lock size={15} color="#8b8fa8" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  style={{
                    background: "none", border: "none", outline: "none",
                    color: "#ffffff", fontSize: "14px", flex: 1
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    background: "none", border: "none",
                    cursor: "pointer", padding: 0
                  }}>
                  {showPass
                    ? <EyeOff size={15} color="#8b8fa8" />
                    : <Eye    size={15} color="#8b8fa8" />
                  }
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !username || !password}
              style={{
                width: "100%", padding: "14px", borderRadius: "10px",
                backgroundColor: "#6366f1", border: "none",
                color: "#ffffff", fontSize: "15px", fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center",
                justifyContent: "center", gap: "10px",
                opacity: loading || !username || !password ? 0.6 : 1,
                transition: "opacity 0.2s ease", marginTop: "4px"
              }}>
              {loading ? (
                <>
                  <Loader2 size={18}
                    style={{ animation: "spin 1s linear infinite" }} />
                  Verifying with Keycloak...
                </>
              ) : (
                <>
                  <Shield size={18} />
                  Sign In
                </>
              )}
              <style>{`
                @keyframes spin {
                  from { transform: rotate(0deg); }
                  to   { transform: rotate(360deg); }
                }
              `}</style>
            </button>
          </form>

          {/* Security Badges */}
          <div style={{
            display: "flex", justifyContent: "center",
            gap: "10px", flexWrap: "wrap",
            paddingTop: "12px", borderTop: "1px solid #2a2d3e"
          }}>
            {["OAuth 2.0", "OpenID Connect", "RBAC"].map(badge => (
              <span key={badge} style={{
                fontSize: "11px", padding: "4px 10px",
                borderRadius: "20px", fontWeight: 600,
                backgroundColor: "#6366f120",
                color: "#6366f1", border: "1px solid #6366f130"
              }}>
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* Quick Fill */}
        <div style={{
          backgroundColor: "#1a1d27", border: "1px solid #2a2d3e",
          borderRadius: "12px", padding: "16px"
        }}>
          <p style={{
            fontSize: "12px", fontWeight: 600, color: "#8b8fa8",
            marginBottom: "10px", textTransform: "uppercase",
            letterSpacing: "0.05em"
          }}>
            Quick Fill — Test Credentials
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              { role: "Admin", user: "ektaadmin", pass: "Test@123", color: "#6366f1" },
              { role: "User",  user: "ektauser",  pass: "Test@123",  color: "#10b981" },
            ].map(cred => (
              <button
                key={cred.role}
                type="button"
                onClick={() => fillCredentials(cred.user, cred.pass)}
                style={{
                  display: "flex", alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px", borderRadius: "8px",
                  backgroundColor: "#0f1117",
                  border: "1px solid #2a2d3e",
                  cursor: "pointer", width: "100%",
                  transition: "border-color 0.15s ease"
                }}
                onMouseOver={e => e.currentTarget.style.borderColor = cred.color}
                onMouseOut={e  => e.currentTarget.style.borderColor = "#2a2d3e"}
              >
                <span style={{
                  fontSize: "11px", padding: "2px 8px",
                  borderRadius: "20px", fontWeight: 600,
                  backgroundColor: `${cred.color}20`, color: cred.color
                }}>
                  {cred.role}
                </span>
                <span style={{
                  fontSize: "12px", fontFamily: "monospace", color: "#8b8fa8"
                }}>
                  {cred.user} / {cred.pass}
                </span>
                <span style={{ fontSize: "11px", color: cred.color }}>
                  Click to fill →
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}