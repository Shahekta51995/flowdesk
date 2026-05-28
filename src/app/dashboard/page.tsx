"use client";

import Header from "@/components/ui/Header";
import { useEffect, useState, useCallback } from "react";
import {
  TrendingUp, CreditCard, Users, Activity,
  ArrowUpRight, ArrowDownRight, Loader2,
  RefreshCw
} from "lucide-react";

const statusColors: Record<string, string> = {
  SETTLED:    "#10b981",
  CAPTURED:   "#6366f1",
  PROCESSING: "#f59e0b",
  FAILED:     "#ef4444",
  REFUNDED:   "#f59e0b",
  INITIATED:  "#8b8fa8",
  // legacy
  Success: "#10b981",
  Pending: "#f59e0b",
  Failed:  "#ef4444",
};

const formatAmount = (paise: number) =>
  `₹${(paise / 100).toLocaleString("en-IN")}`;

const formatTime = (date: string) => {
  const d    = new Date(date);
  const diff = Math.floor((Date.now() - d.getTime()) / 60000);
  if (diff < 1)  return "Just now";
  if (diff < 60) return `${diff} min ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)} hr ago`;
  return `${Math.floor(diff / 1440)} days ago`;
};

export default function DashboardPage() {
  const [stats,    setStats]    = useState<any>(null);
  const [loading,  setLoading]  = useState(true);
  const [lastSync, setLastSync] = useState<string>("");

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/dashboard/stats");
      const json = await res.json();
      if (json.success) {
        setStats(json);
        setLastSync(new Date().toLocaleTimeString("en-IN"));
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const kpiCards = stats ? [
    {
      label:    "Total Revenue",
      value:    formatAmount(stats.stats.totalRevenue.value),
      change:   stats.stats.totalRevenue.change,
      positive: true,
      icon:     TrendingUp,
      color:    "#6366f1",
    },
    {
      label:    "Transactions",
      value:    stats.stats.transactions.value.toLocaleString(),
      change:   stats.stats.transactions.change,
      positive: true,
      icon:     CreditCard,
      color:    "#10b981",
    },
    {
      label:    "Active Clients",
      value:    stats.stats.activeClients.value.toLocaleString(),
      change:   stats.stats.activeClients.change,
      positive: true,
      icon:     Users,
      color:    "#f59e0b",
    },
    {
      label:    "Failed Today",
      value:    stats.stats.failedPayments.value.toLocaleString(),
      change:   stats.stats.failedPayments.change,
      positive: false,
      icon:     Activity,
      color:    "#ef4444",
    },
  ] : [];

  return (
    <div style={{ flex: 1, overflowY: "auto", backgroundColor: "#0f1117" }}>
      <Header
        title="Overview"
        subtitle="Welcome back — here's what's happening today"
      />

      <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "28px" }}>

        {/* Live data indicator */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{
              fontSize: "11px", padding: "3px 10px",
              borderRadius: "20px", fontWeight: 600,
              backgroundColor: "#10b98120", color: "#10b981",
              border: "1px solid #10b98130"
            }}>
              ● LIVE MongoDB
            </span>
            {lastSync && (
              <span style={{ fontSize: "12px", color: "#8b8fa8" }}>
                Last synced: {lastSync}
              </span>
            )}
          </div>
          <button
            onClick={fetchStats}
            disabled={loading}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "6px 12px", borderRadius: "8px",
              backgroundColor: "#1a1d27", border: "1px solid #2a2d3e",
              color: "#8b8fa8", fontSize: "12px", cursor: "pointer"
            }}>
            <RefreshCw size={12}
              style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
            Refresh
          </button>
          <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>

        {/* KPI Cards */}
        {loading && !stats ? (
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px"
          }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{
                padding: "20px", borderRadius: "12px",
                backgroundColor: "#1a1d27", border: "1px solid #2a2d3e",
                display: "flex", alignItems: "center",
                justifyContent: "center", height: "120px"
              }}>
                <Loader2 size={20} color="#6366f1"
                  style={{ animation: "spin 1s linear infinite" }} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px"
          }}>
            {kpiCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} style={{
                  padding: "20px", borderRadius: "12px",
                  backgroundColor: "#1a1d27",
                  border: "1px solid #2a2d3e",
                }}>
                  <div style={{
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between", marginBottom: "16px"
                  }}>
                    <span style={{ fontSize: "13px", fontWeight: 500, color: "#8b8fa8" }}>
                      {stat.label}
                    </span>
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "8px",
                      backgroundColor: `${stat.color}20`,
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      <Icon size={18} color={stat.color} />
                    </div>
                  </div>
                  <p style={{
                    fontSize: "24px", fontWeight: 700,
                    color: "#ffffff", marginBottom: "8px"
                  }}>
                    {stat.value}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    {stat.positive
                      ? <ArrowUpRight   size={14} color="#10b981" />
                      : <ArrowDownRight size={14} color="#ef4444" />
                    }
                    <span style={{
                      fontSize: "12px", fontWeight: 600,
                      color: stat.positive ? "#10b981" : "#ef4444"
                    }}>
                      {stat.change}
                    </span>
                    <span style={{ fontSize: "12px", color: "#8b8fa8" }}>
                      vs last month
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Recent Payments */}
        <div style={{
          borderRadius: "12px", backgroundColor: "#1a1d27",
          border: "1px solid #2a2d3e", overflow: "hidden"
        }}>
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: "1px solid #2a2d3e"
          }}>
            <h3 style={{ fontWeight: 600, color: "#ffffff", fontSize: "15px" }}>
              Recent Payments
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{
                fontSize: "11px", padding: "3px 8px",
                borderRadius: "20px", fontWeight: 600,
                backgroundColor: "#10b98120", color: "#10b981",
                border: "1px solid #10b98130"
              }}>
                ● Live
              </span>
              <button
                onClick={() => window.location.href = "/dashboard/payments"}
                style={{
                  fontSize: "13px", color: "#6366f1",
                  background: "none", border: "none", cursor: "pointer"
                }}>
                View all →
              </button>
            </div>
          </div>

          {loading && !stats ? (
            <div style={{
              padding: "48px", display: "flex",
              alignItems: "center", justifyContent: "center", gap: "12px"
            }}>
              <Loader2 size={20} color="#6366f1"
                style={{ animation: "spin 1s linear infinite" }} />
              <span style={{ color: "#8b8fa8", fontSize: "14px" }}>
                Loading from MongoDB...
              </span>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #2a2d3e" }}>
                  {["Transaction ID", "Client", "Amount", "Status", "Time"].map((h) => (
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
                {(stats?.recentPayments || []).length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{
                      padding: "48px", textAlign: "center",
                      color: "#8b8fa8", fontSize: "14px"
                    }}>
                      No payments yet.{" "}
                      <a href="/api/seed" style={{ color: "#6366f1" }}>
                        Seed the database
                      </a>
                    </td>
                  </tr>
                ) : (stats?.recentPayments || []).map((payment: any, i: number) => (
                  <tr key={payment.id} style={{
                    borderBottom: i < (stats?.recentPayments?.length - 1)
                      ? "1px solid #2a2d3e" : "none"
                  }}>
                    <td style={{
                      padding: "16px 24px", fontSize: "13px",
                      fontFamily: "monospace", color: "#6366f1"
                    }}>
                      {String(payment.id).slice(0, 12)}...
                    </td>
                    <td style={{ padding: "16px 24px", fontSize: "14px", color: "#ffffff" }}>
                      {payment.client}
                    </td>
                    <td style={{
                      padding: "16px 24px", fontSize: "14px",
                      fontWeight: 600, color: "#ffffff"
                    }}>
                      {formatAmount(payment.amount)}
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <span style={{
                        fontSize: "12px", fontWeight: 500,
                        padding: "4px 10px", borderRadius: "20px",
                        backgroundColor: `${statusColors[payment.status] || "#8b8fa8"}20`,
                        color: statusColors[payment.status] || "#8b8fa8"
                      }}>
                        {payment.status}
                      </span>
                    </td>
                    <td style={{
                      padding: "16px 24px",
                      fontSize: "13px", color: "#8b8fa8"
                    }}>
                      {formatTime(payment.time)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}