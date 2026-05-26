"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, BarChart3, CreditCard,
  Users, Settings, Zap, Bell,
} from "lucide-react";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { label: "Customers", href: "/dashboard/customers", icon: Users },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside style={{
      position: "fixed", left: 0, top: 0,
      height: "100vh", width: "240px",
      display: "flex", flexDirection: "column",
      backgroundColor: "#1a1d27",
      borderRight: "1px solid #2a2d3e",
    }}>

      {/* Logo */}
      <div style={{
        display: "flex", alignItems: "center", gap: "12px",
        padding: "20px 24px",
        borderBottom: "1px solid #2a2d3e"
      }}>
        <div style={{
          width: "32px", height: "32px", borderRadius: "8px",
          backgroundColor: "#6366f1",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <Zap size={16} color="white" fill="white" />
        </div>
        <div>
          <h1 style={{ fontWeight: 700, color: "#ffffff", fontSize: "17px", lineHeight: 1 }}>
            FlowDesk
          </h1>
          <p style={{ fontSize: "11px", color: "#8b8fa8", marginTop: "3px" }}>
            Enterprise Platform
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: "4px" }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "10px 12px", borderRadius: "8px",
              fontSize: "14px", fontWeight: 500,
              textDecoration: "none",
              backgroundColor: isActive ? "#6366f1" : "transparent",
              color: isActive ? "#ffffff" : "#8b8fa8",
              transition: "all 0.15s ease",
            }}>
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ padding: "16px", borderTop: "1px solid #2a2d3e" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          padding: "10px 12px", borderRadius: "8px",
          backgroundColor: "#0f1117"
        }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "50%",
            backgroundColor: "#6366f1",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "12px", fontWeight: 700, color: "#ffffff"
          }}>
            ES
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff" }}>Ekta Shah</p>
            <p style={{ fontSize: "11px", color: "#8b8fa8" }}>Admin</p>
          </div>
          <Bell size={15} color="#8b8fa8" />
        </div>
      </div>
    </aside>
  );
}