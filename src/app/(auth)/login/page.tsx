"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Zap, Shield, BarChart3, CreditCard } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Call NextAuth credentials sign-in
    const result:any = await signIn("credentials", {
      username,
      password,
      redirect: false, // Prevent automatic redirect so we can handle errors manually
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid username or password");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0f1117", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ width: "100%", maxWidth: "420px", display: "flex", flexDirection: "column", gap: "32px" }}>
        
        {/* Logo Section */}
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "14px", backgroundColor: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 0 40px #6366f140" }}>
            <Zap size={28} color="white" fill="white" />
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#ffffff" }}>FlowDesk</h1>
          <p style={{ fontSize: "14px", color: "#8b8fa8", marginTop: "6px" }}>Enterprise Analytics & Payments Platform</p>
        </div>

        {/* Features Section */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {[
            { icon: BarChart3, label: "Real-time Analytics", color: "#6366f1" },
            { icon: CreditCard, label: "UPI Payments", color: "#10b981" },
            { icon: Shield, label: "Keycloak SSO", color: "#f59e0b" },
            { icon: Zap, label: "StarRocks OLAP", color: "#ef4444" },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.label} style={{ padding: "14px", borderRadius: "10px", backgroundColor: "#1a1d27", border: "1px solid #2a2d3e", display: "flex", alignItems: "center", gap: "10px" }}>
                <Icon size={16} color={f.color} />
                <span style={{ fontSize: "12px", color: "#8b8fa8" }}>{f.label}</span>
              </div>
            );
          })}
        </div>

        {/* Login Card */}
        <form onSubmit={handleLogin} style={{ backgroundColor: "#1a1d27", border: "1px solid #2a2d3e", borderRadius: "16px", padding: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#ffffff" }}>Sign in to FlowDesk</h2>
            <p style={{ fontSize: "13px", color: "#8b8fa8", marginTop: "6px" }}>Secured via Keycloak Backend</p>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{ backgroundColor: "#ef444420", border: "1px solid #ef444440", color: "#ef4444", padding: "10px", borderRadius: "8px", fontSize: "13px", textAlign: "center" }}>
              {error}
            </div>
          )}

          {/* Inputs */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ width: "100%", padding: "12px", borderRadius: "8px", backgroundColor: "#0f1117", border: "1px solid #2a2d3e", color: "#fff", fontSize: "14px" }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "12px", borderRadius: "8px", backgroundColor: "#0f1117", border: "1px solid #2a2d3e", color: "#fff", fontSize: "14px" }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "14px", borderRadius: "10px", backgroundColor: "#6366f1", border: "none", color: "#ffffff", fontSize: "15px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", opacity: loading ? 0.6 : 1 }}
          >
            <Shield size={18} />
            {loading ? "Verifying..." : "Continue with Keycloak SSO"}
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#2a2d3e" }} />
            <span style={{ fontSize: "12px", color: "#8b8fa8" }}>secured by</span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#2a2d3e" }} />
          </div>

          {/* Security badges */}
          <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
            {["OAuth 2.0", "OpenID Connect", "RBAC"].map(badge => (
              <span key={badge} style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "20px", fontWeight: 600, backgroundColor: "#6366f120", color: "#6366f1", border: "1px solid #6366f130" }}>
                {badge}
              </span>
            ))}
          </div>
        </form>

        {/* Test credentials info box */}
        <div style={{ backgroundColor: "#1a1d27", border: "1px solid #2a2d3e", borderRadius: "12px", padding: "16px" }}>
          <p style={{ fontSize: "12px", fontWeight: 600, color: "#8b8fa8", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Test Credentials
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              { role: "Admin", user: "ekta.admin", pass: "Admin@123", color: "#6366f1" },
              { role: "User", user: "test.user", pass: "User@123", color: "#10b981" },
            ].map(cred => (
              <div key={cred.role} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderRadius: "8px", backgroundColor: "#0f1117" }}>
                <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "20px", fontWeight: 600, backgroundColor: `${cred.color}20`, color: cred.color }}>
                  {cred.role}
                </span>
                <span style={{ fontSize: "12px", fontFamily: "monospace", color: "#8b8fa8" }}>
                  {cred.user} / {cred.pass}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}