"use client";

import { useEffect, useState } from "react";
import Header from "@/components/ui/Header";
import {
  CreditCard, Clock, CheckCircle,
  XCircle, ArrowRight, TrendingUp,
  Zap, Plus
} from "lucide-react";
import { useRouter } from "next/navigation";

const formatAmount = (paise: number) =>
  `₹${(paise / 100).toLocaleString("en-IN")}`;

const statusConfig: Record<string, { color: string; bg: string; icon: any }> = {
  SETTLED:    { color: "#10b981", bg: "#10b98120", icon: CheckCircle },
  CAPTURED:   { color: "#6366f1", bg: "#6366f120", icon: CheckCircle },
  PROCESSING: { color: "#f59e0b", bg: "#f59e0b20", icon: Clock       },
  INITIATED:  { color: "#8b8fa8", bg: "#8b8fa820", icon: Clock       },
  FAILED:     { color: "#ef4444", bg: "#ef444420", icon: XCircle     },
  REFUNDED:   { color: "#f59e0b", bg: "#f59e0b20", icon: ArrowRight  },
};

export default function UserDashboard() {
  const router = useRouter();
  const [payments,  setPayments]  = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [userData,  setUserData]  = useState<any>(null);

  useEffect(() => {
    // Get user from cookie
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

    // Fetch payments
    fetch("/api/payments?limit=5")
      .then(r => r.json())
      .then(json => {
        if (json.success) setPayments(json.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalSpent = payments
    .filter(p => ["SETTLED","CAPTURED"].includes(p.status))
    .reduce((a, p) => a + p.amount, 0);

  const successCount = payments.filter(p =>
    ["SETTLED","CAPTURED"].includes(p.status)
  ).length;

  const pendingCount = payments.filter(p =>
    ["PROCESSING","INITIATED"].includes(p.status)
  ).length;

  return (
    <div style={{ flex: 1, overflowY: "auto", backgroundColor: "#0f1117" }}>
      <Header
        title={`Welcome, ${userData?.name?.split(" ")[0] || "User"} 👋`}
        subtitle="Here's an overview of your payments"
      />

      <div style={{
        padding: "32px",
        display: "flex", flexDirection: "column", gap: "28px"
      }}>

        {/* Stats */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px"
        }}>
          {[
            { label: "Total Paid",       value: formatAmount(totalSpent), icon: TrendingUp, color: "#10b981" },
            { label: "Successful",       value: successCount.toString(),  icon: CheckCircle,color: "#6366f1" },
            { label: "Pending",          value: pendingCount.toString(),  icon: Clock,      color: "#f59e0b" },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} style={{
                padding: "20px", borderRadius: "12px",
                backgroundColor: "#1a1d27", border: "1px solid #2a2d3e",
                display: "flex", alignItems: "center", gap: "14px"
              }}>
                <div style={{
                  width: "44px", height: "44px", borderRadius: "10px",
                  backgroundColor: `${s.color}20`,
                  display: "flex", alignItems: "center",
                  justifyContent: "center", flexShrink: 0
                }}>
                  <Icon size={20} color={s.color} />
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "#8b8fa8", marginBottom: "4px" }}>
                    {s.label}
                  </p>
                  <p style={{ fontSize: "22px", fontWeight: 700, color: "#ffffff" }}>
                    {s.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Action */}
        <div
          onClick={() => router.push("/app/pay")}
          style={{
            padding: "20px 24px", borderRadius: "12px",
            backgroundColor: "#10b98115",
            border: "1px solid #10b98130",
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer", transition: "all 0.2s ease"
          }}
          onMouseOver={e => {
            e.currentTarget.style.backgroundColor = "#10b98125";
            e.currentTarget.style.borderColor     = "#10b98150";
          }}
          onMouseOut={e => {
            e.currentTarget.style.backgroundColor = "#10b98115";
            e.currentTarget.style.borderColor     = "#10b98130";
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "10px",
              backgroundColor: "#10b981",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Plus size={20} color="white" />
            </div>
            <div>
              <p style={{
                fontSize: "15px", fontWeight: 700, color: "#ffffff"
              }}>
                Make a New Payment
              </p>
              <p style={{ fontSize: "13px", color: "#8b8fa8", marginTop: "2px" }}>
                Pay via UPI instantly
              </p>
            </div>
          </div>
          <ArrowRight size={20} color="#10b981" />
        </div>

        {/* Recent Payments */}
        <div style={{
          borderRadius: "12px", backgroundColor: "#1a1d27",
          border: "1px solid #2a2d3e", overflow: "hidden"
        }}>
          <div style={{
            padding: "18px 24px", borderBottom: "1px solid #2a2d3e",
            display: "flex", alignItems: "center", justifyContent: "space-between"
          }}>
            <h3 style={{ color: "#ffffff", fontWeight: 600, fontSize: "15px" }}>
              Recent Payments
            </h3>
            <button
              onClick={() => router.push("/app/history")}
              style={{
                fontSize: "13px", color: "#10b981",
                background: "none", border: "none", cursor: "pointer"
              }}>
              View all →
            </button>
          </div>

          {loading ? (
            <div style={{
              padding: "48px", textAlign: "center",
              color: "#8b8fa8", fontSize: "14px"
            }}>
              Loading payments...
            </div>
          ) : payments.length === 0 ? (
            <div style={{
              padding: "48px", textAlign: "center"
            }}>
              <CreditCard size={32} color="#2a2d3e"
                style={{ margin: "0 auto 12px" }} />
              <p style={{ color: "#8b8fa8", fontSize: "14px" }}>
                No payments yet
              </p>
              <button
                onClick={() => router.push("/app/pay")}
                style={{
                  marginTop: "16px", padding: "10px 20px",
                  borderRadius: "8px", backgroundColor: "#10b981",
                  border: "none", color: "#ffffff",
                  fontSize: "13px", fontWeight: 600, cursor: "pointer"
                }}>
                Make your first payment
              </button>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #2a2d3e" }}>
                  {["Order ID", "Amount", "Status", "Date"].map(h => (
                    <th key={h} style={{
                      textAlign: "left", padding: "12px 24px",
                      fontSize: "11px", fontWeight: 600,
                      color: "#8b8fa8", textTransform: "uppercase",
                      letterSpacing: "0.05em"
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map((p, i) => {
                  const config = statusConfig[p.status] || statusConfig.INITIATED;
                  const Icon   = config.icon;
                  return (
                    <tr key={p._id} style={{
                      borderBottom: i < payments.length - 1
                        ? "1px solid #2a2d3e" : "none"
                    }}>
                      <td style={{
                        padding: "14px 24px", fontSize: "12px",
                        fontFamily: "monospace", color: "#6366f1"
                      }}>
                        {p.orderId}
                      </td>
                      <td style={{
                        padding: "14px 24px", fontSize: "14px",
                        fontWeight: 700, color: "#ffffff"
                      }}>
                        {formatAmount(p.amount)}
                      </td>
                      <td style={{ padding: "14px 24px" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center",
                          gap: "5px", fontSize: "12px", fontWeight: 600,
                          padding: "4px 10px", borderRadius: "20px",
                          backgroundColor: config.bg, color: config.color
                        }}>
                          <Icon size={11} />
                          {p.status}
                        </span>
                      </td>
                      <td style={{
                        padding: "14px 24px", fontSize: "12px",
                        color: "#8b8fa8"
                      }}>
                        {new Date(p.createdAt).toLocaleDateString("en-IN")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}