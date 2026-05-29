"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, CreditCard,
  History, Zap, LogOut, Bell
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/app",         icon: LayoutDashboard },
  { label: "Make Payment", href: "/app/pay",  icon: CreditCard      },
  { label: "History",   href: "/app/history", icon: History         },
];

export default function UserSidebar() {
  const pathname = usePathname();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const cookies = document.cookie.split(";");
    const sessionCookie = cookies.find(c =>
      c.trim().startsWith("flowdesk_session=")
    );
    if (sessionCookie) {
      try {
        const value   = decodeURIComponent(sessionCookie.split("=")[1]);
        const session = JSON.parse(value);
        setUserData(session.user);
      } catch {}
    }
  }, []);

  const userName  = userData?.name  || "User";
  const userEmail = userData?.email || "";
  const initials  = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

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
        padding: "20px 24px", borderBottom: "1px solid #2a2d3e"
      }}>
        <div style={{
          width: "32px", height: "32px", borderRadius: "8px",
          backgroundColor: "#10b981",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <Zap size={16} color="white" fill="white" />
        </div>
        <div>
          <h1 style={{
            fontWeight: 700, color: "#ffffff",
            fontSize: "17px", lineHeight: 1
          }}>
            FlowDesk
          </h1>
          <p style={{ fontSize: "11px", color: "#8b8fa8", marginTop: "3px" }}>
            My Account
          </p>
        </div>
      </div>

      {/* Role Badge */}
      <div style={{
        padding: "12px 16px", borderBottom: "1px solid #2a2d3e"
      }}>
        <span style={{
          fontSize: "11px", padding: "3px 10px",
          borderRadius: "20px", fontWeight: 600,
          backgroundColor: "#10b98120", color: "#10b981",
          border: "1px solid #10b98130"
        }}>
          ● User
        </span>
      </div>

      {/* Nav */}
      <nav style={{
        flex: 1, padding: "16px 12px",
        display: "flex", flexDirection: "column", gap: "4px"
      }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon     = item.icon;
          return (
            <Link key={item.href} href={item.href} style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "10px 12px", borderRadius: "8px",
              fontSize: "14px", fontWeight: 500,
              textDecoration: "none",
              backgroundColor: isActive ? "#10b981" : "transparent",
              color:           isActive ? "#ffffff" : "#8b8fa8",
              transition: "all 0.15s ease",
            }}>
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div style={{ padding: "16px", borderTop: "1px solid #2a2d3e" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          padding: "10px 12px", borderRadius: "8px",
          backgroundColor: "#0f1117", marginBottom: "8px"
        }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "50%",
            backgroundColor: "#10b981",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "12px", fontWeight: 700,
            color: "#ffffff", flexShrink: 0
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: "13px", fontWeight: 600, color: "#ffffff",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
            }}>
              {userName}
            </p>
            <p style={{
              fontSize: "11px", color: "#8b8fa8",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
            }}>
              {userEmail}
            </p>
          </div>
          <Bell size={15} color="#8b8fa8" />
        </div>

        <button
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/login";
          }}
          style={{
            width: "100%", padding: "9px 12px",
            borderRadius: "8px", border: "1px solid #2a2d3e",
            backgroundColor: "transparent",
            display: "flex", alignItems: "center", gap: "8px",
            cursor: "pointer", color: "#8b8fa8",
            fontSize: "13px", fontWeight: 500,
            transition: "all 0.15s ease"
          }}
          onMouseOver={e => {
            e.currentTarget.style.backgroundColor = "#ef444420";
            e.currentTarget.style.borderColor     = "#ef444440";
            e.currentTarget.style.color           = "#ef4444";
          }}
          onMouseOut={e => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.borderColor     = "#2a2d3e";
            e.currentTarget.style.color           = "#8b8fa8";
          }}>
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </aside>
  );
}