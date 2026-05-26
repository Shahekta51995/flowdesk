"use client";

import { Search, Plus } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <header style={{
      display: "flex", alignItems: "center",
      justifyContent: "space-between",
      padding: "20px 32px",
      borderBottom: "1px solid #2a2d3e",
      backgroundColor: "#0f1117",
    }}>
      <div>
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#ffffff" }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: "13px", color: "#8b8fa8", marginTop: "2px" }}>
            {subtitle}
          </p>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          padding: "8px 14px", borderRadius: "8px",
          backgroundColor: "#1a1d27",
          border: "1px solid #2a2d3e",
          color: "#8b8fa8", fontSize: "13px", cursor: "pointer"
        }}>
          <Search size={14} />
          <span>Search...</span>
          <span style={{
            fontSize: "11px", padding: "2px 6px",
            borderRadius: "4px", backgroundColor: "#2a2d3e"
          }}>⌘K</span>
        </div>

        <button style={{
          display: "flex", alignItems: "center", gap: "6px",
          padding: "8px 16px", borderRadius: "8px",
          backgroundColor: "#6366f1", color: "#ffffff",
          fontSize: "13px", fontWeight: 600,
          border: "none", cursor: "pointer"
        }}>
          <Plus size={14} />
          New
        </button>
      </div>
    </header>
  );
}