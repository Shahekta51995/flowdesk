"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, ExternalLink } from "lucide-react";

interface SupersetEmbedProps {
  height?: number;
}

export default function SupersetEmbed({ height = 600 }: SupersetEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading,    setLoading]  = useState(true);
  const [error,      setError]    = useState("");
  const mountedRef   = useRef(false);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    const embedDashboard = async () => {
      try {
        // Step 1 — Get guest token from our API
        const tokenRes  = await fetch("/api/superset/guest-token");
        const tokenData = await tokenRes.json();

        if (!tokenData.success || !tokenData.token) {
          setError(tokenData.error || "Failed to get guest token");
          setLoading(false);
          return;
        }

        // Step 2 — Import SDK dynamically
        const { embedDashboard } = await import("@superset-ui/embedded-sdk");

        if (!containerRef.current) return;

        const embedUuid = process.env.NEXT_PUBLIC_SUPERSET_EMBED_UUID || "";

        // Step 3 — Embed using SDK
        await embedDashboard({
          id:           embedUuid,
          supersetDomain: "http://localhost:8088",
          mountPoint:   containerRef.current,
          fetchGuestToken: () => Promise.resolve(tokenData.token),
          dashboardUiConfig: {
            hideTitle:         true,
            hideChartControls: false,
            hideTab:           false,
            filters: {
              expanded: false,
              visible:  true,
            },
          },
        });

        setLoading(false);

      } catch (err: any) {
        console.error("Superset embed error:", err);
        setError(err.message || "Failed to embed dashboard");
        setLoading(false);
      }
    };

    embedDashboard();
  }, []);

  if (error) {
    return (
      <div style={{
        height: `${height}px`,
        display: "flex", alignItems: "center",
        justifyContent: "center", flexDirection: "column", gap: "16px"
      }}>
        <div style={{
          padding: "24px", borderRadius: "12px",
          backgroundColor: "#f59e0b10",
          border: "1px solid #f59e0b30",
          textAlign: "center", maxWidth: "420px"
        }}>
          <p style={{
            fontSize: "15px", fontWeight: 600,
            color: "#f59e0b", marginBottom: "8px"
          }}>
            📊 Superset Dashboard
          </p>
          <p style={{
            fontSize: "13px", color: "#8b8fa8",
            lineHeight: 1.6, marginBottom: "16px"
          }}>
            {error}
          </p>
          <p style={{ fontSize: "12px", color: "#8b8fa8", marginBottom: "16px" }}>
            Make sure:
            <br />• Superset is running on port 8088
            <br />• Embedding is enabled on the dashboard
            <br />• EMBED_UUID is correct in .env.local
          </p>
          <a href="http://localhost:8088"
            target="_blank" rel="noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              padding: "8px 16px", borderRadius: "8px",
              backgroundColor: "#f59e0b20",
              border: "1px solid #f59e0b40",
              color: "#f59e0b", fontSize: "13px",
              fontWeight: 600, textDecoration: "none"
            }}>
            <ExternalLink size={13} />
            Open Superset directly
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      {/* Loading overlay */}
      {loading && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center",
          justifyContent: "center", flexDirection: "column",
          gap: "16px", zIndex: 10,
          backgroundColor: "#0f1117",
          borderRadius: "8px", height: `${height}px`
        }}>
          <Loader2 size={32} color="#f59e0b"
            style={{ animation: "spin 1s linear infinite" }} />
          <p style={{ color: "#8b8fa8", fontSize: "14px" }}>
            Loading Superset dashboard...
          </p>
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to   { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
 <style>{`
    .superset-embed-container iframe {
      width: 100% !important;
      height: ${height}px !important;
      border: none !important;
      border-radius: 8px !important;
    }
    .superset-embed-container > div {
      width: 100% !important;
      height: ${height}px !important;
    }
  `}</style>
      {/* SDK mounts the iframe here */}
      <div
        ref={containerRef}
         className="superset-embed-container"
        style={{
          width:  "100%",
          height: `${height}px`,
          borderRadius: "8px",
          overflow: "hidden",
          backgroundColor: "#0f1117",
        }}
      />

      {/* Live badge */}
      {!loading && (
        <div style={{
          position: "absolute", bottom: "12px", right: "12px",
          fontSize: "11px", padding: "4px 10px",
          borderRadius: "20px", fontWeight: 600,
          backgroundColor: "#10b98120", color: "#10b981",
          border: "1px solid #10b98130",
          pointerEvents: "none"
        }}>
          ● Live Superset
        </div>
      )}
    </div>
  );
}