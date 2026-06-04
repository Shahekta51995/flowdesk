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
    </header>
  );
}