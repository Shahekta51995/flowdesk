"use client";

import Header from "@/components/ui/Header";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
import { Zap, Clock, Database, TrendingUp } from "lucide-react";
import { useState } from "react";

// --- Fake Data ---
const revenueData = [
  { month: "Jan", revenue: 420000, transactions: 1200 },
  { month: "Feb", revenue: 380000, transactions: 980 },
  { month: "Mar", revenue: 510000, transactions: 1450 },
  { month: "Apr", revenue: 470000, transactions: 1320 },
  { month: "May", revenue: 620000, transactions: 1800 },
  { month: "Jun", revenue: 590000, transactions: 1650 },
  { month: "Jul", revenue: 710000, transactions: 2100 },
  { month: "Aug", revenue: 680000, transactions: 1950 },
  { month: "Sep", revenue: 790000, transactions: 2300 },
  { month: "Oct", revenue: 850000, transactions: 2450 },
  { month: "Nov", revenue: 920000, transactions: 2700 },
  { month: "Dec", revenue: 1040000, transactions: 3100 },
];

const categoryData = [
  { category: "SaaS", value: 42 },
  { category: "FinTech", value: 28 },
  { category: "Retail", value: 18 },
  { category: "Logistics", value: 8 },
  { category: "Others", value: 4 },
];

// --- Performance Comparison (Your StarRocks showcase!) ---
const performanceData = [
  { rows: "1M rows",   starrocks: 45,   mysql: 2800  },
  { rows: "5M rows",   starrocks: 98,   mysql: 8400  },
  { rows: "10M rows",  starrocks: 180,  mysql: 14200 },
  { rows: "50M rows",  starrocks: 340,  mysql: 58000 },
  { rows: "100M rows", starrocks: 520,  mysql: 98000 },
];

const queryStats = [
  { label: "Avg Query Time", value: "193ms", icon: Clock, color: "#6366f1", sub: "StarRocks OLAP" },
  { label: "Rows Scanned", value: "8.4M", icon: Database, color: "#10b981", sub: "per query avg" },
  { label: "MySQL Equivalent", value: "11.2s", icon: Clock, color: "#ef4444", sub: "58x slower" },
  { label: "Queries Today", value: "24,891", icon: TrendingUp, color: "#f59e0b", sub: "all under 500ms" },
];

// Custom Tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: "#1a1d27",
        border: "1px solid #2a2d3e",
        borderRadius: "8px",
        padding: "12px 16px",
      }}>
        <p style={{ color: "#8b8fa8", fontSize: "12px", marginBottom: "6px" }}>{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color, fontSize: "13px", fontWeight: 600 }}>
            {p.name}: {typeof p.value === "number" && p.value > 1000
              ? p.name.includes("ms") || p.name.includes("MySQL") || p.name.includes("StarRocks")
                ? `${p.value}ms`
                : `₹${(p.value / 100000).toFixed(1)}L`
              : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const [activeRows, setActiveRows] = useState("10M rows");

  const selected = performanceData.find(d => d.rows === activeRows)!;

  return (
    <div style={{ flex: 1, overflowY: "auto", backgroundColor: "#0f1117" }}>
      <Header
        title="Analytics"
        subtitle="Real-time business intelligence powered by StarRocks OLAP"
      />

      <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "28px" }}>

        {/* ⭐ STARROCKS PERFORMANCE SHOWCASE */}
        <div style={{
          borderRadius: "12px",
          backgroundColor: "#1a1d27",
          border: "1px solid #6366f1",
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            padding: "20px 24px",
            borderBottom: "1px solid #2a2d3e",
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(90deg, #6366f110, transparent)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "8px",
                backgroundColor: "#6366f1",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <Zap size={16} color="white" fill="white" />
              </div>
              <div>
                <h3 style={{ color: "#ffffff", fontWeight: 700, fontSize: "15px" }}>
                  StarRocks vs MySQL — Query Performance
                </h3>
                <p style={{ color: "#8b8fa8", fontSize: "12px", marginTop: "2px" }}>
                  Analytical queries on large datasets. Same data, same query — different engine.
                </p>
              </div>
            </div>
            <span style={{
              fontSize: "11px", padding: "4px 10px",
              borderRadius: "20px", fontWeight: 600,
              backgroundColor: "#6366f120", color: "#6366f1",
              border: "1px solid #6366f140"
            }}>
              OLAP ENGINE
            </span>
          </div>

          <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>

            {/* Query Stats Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
              {queryStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} style={{
                    padding: "16px",
                    borderRadius: "10px",
                    backgroundColor: "#0f1117",
                    border: "1px solid #2a2d3e",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                      <Icon size={15} color={stat.color} />
                      <span style={{ fontSize: "12px", color: "#8b8fa8" }}>{stat.label}</span>
                    </div>
                    <p style={{ fontSize: "22px", fontWeight: 700, color: stat.color }}>{stat.value}</p>
                    <p style={{ fontSize: "11px", color: "#8b8fa8", marginTop: "4px" }}>{stat.sub}</p>
                  </div>
                );
              })}
            </div>

            {/* Row Selector */}
            <div>
              <p style={{ fontSize: "13px", color: "#8b8fa8", marginBottom: "12px" }}>
                Select dataset size to compare:
              </p>
              <div style={{ display: "flex", gap: "8px" }}>
                {performanceData.map((d) => (
                  <button
                    key={d.rows}
                    onClick={() => setActiveRows(d.rows)}
                    style={{
                      padding: "6px 14px", borderRadius: "6px",
                      fontSize: "12px", fontWeight: 600,
                      cursor: "pointer", border: "1px solid",
                      borderColor: activeRows === d.rows ? "#6366f1" : "#2a2d3e",
                      backgroundColor: activeRows === d.rows ? "#6366f120" : "transparent",
                      color: activeRows === d.rows ? "#6366f1" : "#8b8fa8",
                      transition: "all 0.15s ease"
                    }}>
                    {d.rows}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Comparison */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {/* StarRocks */}
              <div style={{
                padding: "20px", borderRadius: "10px",
                backgroundColor: "#6366f110",
                border: "1px solid #6366f140",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#6366f1" }}>
                    ⚡ StarRocks (OLAP)
                  </span>
                  <span style={{
                    fontSize: "11px", padding: "3px 8px",
                    borderRadius: "20px", backgroundColor: "#10b98120",
                    color: "#10b981", fontWeight: 600
                  }}>FAST</span>
                </div>
                <p style={{ fontSize: "36px", fontWeight: 800, color: "#ffffff" }}>
                  {selected.starrocks}<span style={{ fontSize: "16px", color: "#8b8fa8", fontWeight: 400 }}>ms</span>
                </p>
                <p style={{ fontSize: "12px", color: "#8b8fa8", marginTop: "6px" }}>
                  Columnar storage + vectorized execution
                </p>
                {/* Progress bar */}
                <div style={{
                  marginTop: "12px", height: "6px",
                  borderRadius: "3px", backgroundColor: "#2a2d3e", overflow: "hidden"
                }}>
                  <div style={{
                    height: "100%", borderRadius: "3px",
                    backgroundColor: "#6366f1",
                    width: `${(selected.starrocks / selected.mysql) * 100}%`,
                    minWidth: "4px"
                  }} />
                </div>
              </div>

              {/* MySQL */}
              <div style={{
                padding: "20px", borderRadius: "10px",
                backgroundColor: "#ef444410",
                border: "1px solid #ef444440",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#ef4444" }}>
                    🐢 MySQL (Row-based)
                  </span>
                  <span style={{
                    fontSize: "11px", padding: "3px 8px",
                    borderRadius: "20px", backgroundColor: "#ef444420",
                    color: "#ef4444", fontWeight: 600
                  }}>SLOW</span>
                </div>
                <p style={{ fontSize: "36px", fontWeight: 800, color: "#ffffff" }}>
                  {selected.mysql >= 1000
                    ? `${(selected.mysql / 1000).toFixed(1)}s`
                    : `${selected.mysql}ms`}
                </p>
                <p style={{ fontSize: "12px", color: "#8b8fa8", marginTop: "6px" }}>
                  Row scan on non-indexed analytical query
                </p>
                {/* Progress bar */}
                <div style={{
                  marginTop: "12px", height: "6px",
                  borderRadius: "3px", backgroundColor: "#2a2d3e", overflow: "hidden"
                }}>
                  <div style={{
                    height: "100%", borderRadius: "3px",
                    backgroundColor: "#ef4444",
                    width: "100%"
                  }} />
                </div>
              </div>
            </div>

            {/* Speedup Badge */}
            <div style={{
              padding: "14px 20px", borderRadius: "10px",
              backgroundColor: "#10b98110",
              border: "1px solid #10b98130",
              display: "flex", alignItems: "center",
              justifyContent: "center", gap: "10px"
            }}>
              <Zap size={16} color="#10b981" fill="#10b981" />
              <p style={{ color: "#10b981", fontWeight: 700, fontSize: "14px" }}>
                StarRocks is {Math.round(selected.mysql / selected.starrocks)}x faster
                than MySQL on {activeRows} analytical query
              </p>
            </div>

          </div>
        </div>

        {/* Revenue Chart */}
        <div style={{
          borderRadius: "12px",
          backgroundColor: "#1a1d27",
          border: "1px solid #2a2d3e",
          padding: "24px"
        }}>
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ color: "#ffffff", fontWeight: 600, fontSize: "15px" }}>
              Revenue Trend — 2024
            </h3>
            <p style={{ color: "#8b8fa8", fontSize: "12px", marginTop: "4px" }}>
              Monthly revenue in INR • Powered by StarRocks
            </p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
              <XAxis dataKey="month" stroke="#8b8fa8" tick={{ fontSize: 12 }} />
              <YAxis stroke="#8b8fa8" tick={{ fontSize: 12 }}
                tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone" dataKey="revenue" name="Revenue"
                stroke="#6366f1" strokeWidth={2}
                fill="url(#revenueGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom Row — Transactions + Category */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

          {/* Transactions Bar Chart */}
          <div style={{
            borderRadius: "12px",
            backgroundColor: "#1a1d27",
            border: "1px solid #2a2d3e",
            padding: "24px"
          }}>
            <h3 style={{ color: "#ffffff", fontWeight: 600, fontSize: "15px", marginBottom: "6px" }}>
              Monthly Transactions
            </h3>
            <p style={{ color: "#8b8fa8", fontSize: "12px", marginBottom: "20px" }}>
              Total count per month
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
                <XAxis dataKey="month" stroke="#8b8fa8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#8b8fa8" tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="transactions" name="Transactions"
                  fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Breakdown */}
          <div style={{
            borderRadius: "12px",
            backgroundColor: "#1a1d27",
            border: "1px solid #2a2d3e",
            padding: "24px"
          }}>
            <h3 style={{ color: "#ffffff", fontWeight: 600, fontSize: "15px", marginBottom: "6px" }}>
              Revenue by Industry
            </h3>
            <p style={{ color: "#8b8fa8", fontSize: "12px", marginBottom: "20px" }}>
              Client distribution breakdown
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {categoryData.map((cat) => (
                <div key={cat.category}>
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    marginBottom: "6px"
                  }}>
                    <span style={{ fontSize: "13px", color: "#ffffff" }}>{cat.category}</span>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#8b8fa8" }}>
                      {cat.value}%
                    </span>
                  </div>
                  <div style={{
                    height: "6px", borderRadius: "3px",
                    backgroundColor: "#2a2d3e", overflow: "hidden"
                  }}>
                    <div style={{
                      height: "100%", borderRadius: "3px",
                      backgroundColor: "#6366f1",
                      width: `${cat.value}%`,
                      opacity: 0.6 + (cat.value / 100)
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}