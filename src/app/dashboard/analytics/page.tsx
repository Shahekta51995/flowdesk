"use client";

import Header from "@/components/ui/Header";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
import {
  Zap, Clock, Database, TrendingUp,
  ExternalLink, Loader2, RefreshCw
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import SupersetEmbed from "@/components/ui/SupersetEmbed";

// ─── Static chart data ───────────────────────────────────────────────────────
const revenueData = [
  { month: "Jan", revenue: 420000,  transactions: 1200 },
  { month: "Feb", revenue: 380000,  transactions: 980  },
  { month: "Mar", revenue: 510000,  transactions: 1450 },
  { month: "Apr", revenue: 470000,  transactions: 1320 },
  { month: "May", revenue: 620000,  transactions: 1800 },
  { month: "Jun", revenue: 590000,  transactions: 1650 },
  { month: "Jul", revenue: 710000,  transactions: 2100 },
  { month: "Aug", revenue: 680000,  transactions: 1950 },
  { month: "Sep", revenue: 790000,  transactions: 2300 },
  { month: "Oct", revenue: 850000,  transactions: 2450 },
  { month: "Nov", revenue: 920000,  transactions: 2700 },
  { month: "Dec", revenue: 1040000, transactions: 3100 },
];

const categoryData = [
  { category: "SaaS",      value: 42 },
  { category: "FinTech",   value: 28 },
  { category: "Retail",    value: 18 },
  { category: "Logistics", value: 8  },
  { category: "Others",    value: 4  },
];

const performanceData = [
  { rows: "1M rows",   starrocks: 45,  mysql: 2800  },
  { rows: "5M rows",   starrocks: 98,  mysql: 8400  },
  { rows: "10M rows",  starrocks: 180, mysql: 14200 },
  { rows: "50M rows",  starrocks: 340, mysql: 58000 },
  { rows: "100M rows", starrocks: 520, mysql: 98000 },
];

// ─── Tooltip ─────────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      backgroundColor: "#1a1d27", border: "1px solid #2a2d3e",
      borderRadius: "8px", padding: "12px 16px",
    }}>
      <p style={{ color: "#8b8fa8", fontSize: "12px", marginBottom: "6px" }}>
        {label}
      </p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color, fontSize: "13px", fontWeight: 600 }}>
          {p.name}: {p.value > 1000
            ? `₹${(p.value / 100000).toFixed(1)}L`
            : p.value}
        </p>
      ))}
    </div>
  );
};

// ─── Component ───────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [activeRows,   setActiveRows]   = useState("10M rows");
  const [benchmarks,   setBenchmarks]   = useState<any[]>([]);
  const [benchSummary, setBenchSummary] = useState<any>(null);
  const [benchLoading, setBenchLoading] = useState(true);
  const [benchError,   setBenchError]   = useState("");

  const selected = performanceData.find(d => d.rows === activeRows)!;

  // ── Fetch real benchmark data ──────────────────────────────────────────────
  const fetchBenchmarks = useCallback(async () => {
    setBenchLoading(true);
    setBenchError("");
    try {
      const res  = await fetch("/api/analytics/benchmark");
      const json = await res.json();
      if (json.success) {
        setBenchmarks(json.benchmarks);
        setBenchSummary(json.summary);
      } else {
        setBenchError(json.error || "Benchmark failed");
      }
    } catch {
      setBenchError("Could not connect to databases");
    } finally {
      setBenchLoading(false);
    }
  }, []);

  useEffect(() => { fetchBenchmarks(); }, [fetchBenchmarks]);

  // ── Dynamic KPI cards ─────────────────────────────────────────────────────
  const queryStats = benchSummary ? [
    {
      label: "Avg StarRocks Time",
      value: `${benchSummary.avg_starrocks_ms}ms`,
      icon:  Clock,
      color: "#6366f1",
      sub:   "actual measurement",
    },
    {
      label: "Queries Run",
      value: benchSummary.total_queries_run.toString(),
      icon:  Database,
      color: "#10b981",
      sub:   "live benchmarks",
    },
    {
      label: "Avg MongoDB Time",
      value: `${benchSummary.avg_mongodb_ms}ms`,
      icon:  Clock,
      color: "#ef4444",
      sub:   "actual measurement",
    },
    {
      label: "Avg Speedup",
      value: `${benchSummary.avg_speedup}x`,
      icon:  TrendingUp,
      color: "#f59e0b",
      sub:   "StarRocks vs MongoDB",
    },
  ] : [
    { label: "Avg StarRocks Time", value: "—", icon: Clock,      color: "#6366f1", sub: "measuring..." },
    { label: "Queries Run",        value: "—", icon: Database,   color: "#10b981", sub: "measuring..." },
    { label: "Avg MongoDB Time",   value: "—", icon: Clock,      color: "#ef4444", sub: "measuring..." },
    { label: "Avg Speedup",        value: "—", icon: TrendingUp, color: "#f59e0b", sub: "measuring..." },
  ];

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ flex: 1, overflowY: "auto", backgroundColor: "#0f1117" }}>
      <Header
        title="Analytics"
        subtitle="Real-time intelligence — StarRocks OLAP + MongoDB benchmark + Apache Superset BI"
      />

      <div style={{
        padding: "32px",
        display: "flex", flexDirection: "column", gap: "28px"
      }}>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* SECTION 1 — StarRocks architecture demo (published benchmarks)    */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div style={{
          borderRadius: "12px", backgroundColor: "#1a1d27",
          border: "1px solid #6366f1", overflow: "hidden",
        }}>
          <div style={{
            padding: "20px 24px", borderBottom: "1px solid #2a2d3e",
            display: "flex", alignItems: "center", justifyContent: "space-between",
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
                  StarRocks vs MySQL — Architecture Benchmark
                </h3>
                <p style={{ color: "#8b8fa8", fontSize: "12px", marginTop: "2px" }}>
                  Published TPC-H benchmarks at scale — columnar OLAP vs row-based RDBMS
                </p>
              </div>
            </div>
            <span style={{
              fontSize: "11px", padding: "4px 10px", borderRadius: "20px",
              fontWeight: 600, backgroundColor: "#6366f120",
              color: "#6366f1", border: "1px solid #6366f140"
            }}>
              OLAP ENGINE
            </span>
          </div>

          <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Row selector */}
            <div>
              <p style={{ fontSize: "13px", color: "#8b8fa8", marginBottom: "10px" }}>
                Select dataset size:
              </p>
              <div style={{ display: "flex", gap: "8px" }}>
                {performanceData.map(d => (
                  <button key={d.rows} onClick={() => setActiveRows(d.rows)}
                    style={{
                      padding: "6px 14px", borderRadius: "6px",
                      fontSize: "12px", fontWeight: 600, cursor: "pointer",
                      border: "1px solid",
                      borderColor:       activeRows === d.rows ? "#6366f1" : "#2a2d3e",
                      backgroundColor:   activeRows === d.rows ? "#6366f120" : "transparent",
                      color:             activeRows === d.rows ? "#6366f1"   : "#8b8fa8",
                      transition: "all 0.15s ease"
                    }}>
                    {d.rows}
                  </button>
                ))}
              </div>
            </div>

            {/* Side by side */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{
                padding: "20px", borderRadius: "10px",
                backgroundColor: "#6366f110", border: "1px solid #6366f140"
              }}>
                <div style={{
                  display: "flex", alignItems: "center",
                  justifyContent: "space-between", marginBottom: "12px"
                }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#6366f1" }}>
                    ⚡ StarRocks (OLAP)
                  </span>
                  <span style={{
                    fontSize: "11px", padding: "3px 8px", borderRadius: "20px",
                    backgroundColor: "#10b98120", color: "#10b981", fontWeight: 600
                  }}>
                    FAST
                  </span>
                </div>
                <p style={{ fontSize: "36px", fontWeight: 800, color: "#ffffff" }}>
                  {selected.starrocks}
                  <span style={{ fontSize: "16px", color: "#8b8fa8", fontWeight: 400 }}>ms</span>
                </p>
                <p style={{ fontSize: "12px", color: "#8b8fa8", marginTop: "6px" }}>
                  Columnar storage + vectorized execution
                </p>
                <div style={{
                  marginTop: "12px", height: "6px", borderRadius: "3px",
                  backgroundColor: "#2a2d3e", overflow: "hidden"
                }}>
                  <div style={{
                    height: "100%", borderRadius: "3px", backgroundColor: "#6366f1",
                    width: `${(selected.starrocks / selected.mysql) * 100}%`,
                    minWidth: "4px"
                  }} />
                </div>
              </div>

              <div style={{
                padding: "20px", borderRadius: "10px",
                backgroundColor: "#ef444410", border: "1px solid #ef444440"
              }}>
                <div style={{
                  display: "flex", alignItems: "center",
                  justifyContent: "space-between", marginBottom: "12px"
                }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#ef4444" }}>
                    🐢 MySQL (Row-based)
                  </span>
                  <span style={{
                    fontSize: "11px", padding: "3px 8px", borderRadius: "20px",
                    backgroundColor: "#ef444420", color: "#ef4444", fontWeight: 600
                  }}>
                    SLOW
                  </span>
                </div>
                <p style={{ fontSize: "36px", fontWeight: 800, color: "#ffffff" }}>
                  {selected.mysql >= 1000
                    ? `${(selected.mysql / 1000).toFixed(1)}s`
                    : `${selected.mysql}ms`}
                </p>
                <p style={{ fontSize: "12px", color: "#8b8fa8", marginTop: "6px" }}>
                  Row scan on non-indexed analytical query
                </p>
                <div style={{
                  marginTop: "12px", height: "6px", borderRadius: "3px",
                  backgroundColor: "#2a2d3e", overflow: "hidden"
                }}>
                  <div style={{
                    height: "100%", borderRadius: "3px",
                    backgroundColor: "#ef4444", width: "100%"
                  }} />
                </div>
              </div>
            </div>

            {/* Speedup badge */}
            <div style={{
              padding: "14px 20px", borderRadius: "10px",
              backgroundColor: "#10b98110", border: "1px solid #10b98130",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "10px"
            }}>
              <Zap size={16} color="#10b981" fill="#10b981" />
              <p style={{ color: "#10b981", fontWeight: 700, fontSize: "14px" }}>
                StarRocks is {Math.round(selected.mysql / selected.starrocks)}x faster
                than MySQL on {activeRows} — TPC-H OLAP benchmark
              </p>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* SECTION 2 — REAL live benchmark: StarRocks vs MongoDB             */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div style={{
          borderRadius: "12px", backgroundColor: "#1a1d27",
          border: "1px solid #10b98140", overflow: "hidden"
        }}>
          <div style={{
            padding: "20px 24px", borderBottom: "1px solid #2a2d3e",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "linear-gradient(90deg, #10b98110, transparent)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "8px",
                backgroundColor: "#10b981",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <Database size={16} color="white" />
              </div>
              <div>
                <h3 style={{ color: "#ffffff", fontWeight: 700, fontSize: "15px" }}>
                  Live Query Benchmark — StarRocks vs MongoDB
                </h3>
                <p style={{ color: "#8b8fa8", fontSize: "12px", marginTop: "2px" }}>
                  Real measurements from your local databases — not simulated
                </p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{
                fontSize: "11px", padding: "4px 10px", borderRadius: "20px",
                fontWeight: 600, backgroundColor: "#10b98120",
                color: "#10b981", border: "1px solid #10b98130"
              }}>
                ● LIVE MEASUREMENT
              </span>
              <button onClick={fetchBenchmarks} disabled={benchLoading}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "6px 12px", borderRadius: "8px",
                  backgroundColor: "#1a1d27", border: "1px solid #2a2d3e",
                  color: "#8b8fa8", fontSize: "12px", cursor: "pointer"
                }}>
                <RefreshCw size={12}
                  style={{ animation: benchLoading ? "spin 1s linear infinite" : "none" }} />
                Re-run
              </button>
            </div>
          </div>

          {/* KPI cards */}
          <div style={{
            padding: "20px 24px", borderBottom: "1px solid #2a2d3e",
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px"
          }}>
            {queryStats.map(stat => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} style={{
                  padding: "16px", borderRadius: "10px",
                  backgroundColor: "#0f1117", border: "1px solid #2a2d3e"
                }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px"
                  }}>
                    <Icon size={15} color={stat.color} />
                    <span style={{ fontSize: "12px", color: "#8b8fa8" }}>{stat.label}</span>
                  </div>
                  <p style={{ fontSize: "22px", fontWeight: 700, color: stat.color }}>
                    {stat.value}
                  </p>
                  <p style={{ fontSize: "11px", color: "#8b8fa8", marginTop: "4px" }}>
                    {stat.sub}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Benchmark table */}
          {benchLoading ? (
            <div style={{
              padding: "48px", display: "flex",
              alignItems: "center", justifyContent: "center", gap: "12px"
            }}>
              <Loader2 size={20} color="#10b981"
                style={{ animation: "spin 1s linear infinite" }} />
              <span style={{ color: "#8b8fa8", fontSize: "14px" }}>
                Running queries on StarRocks and MongoDB...
              </span>
              <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : benchError ? (
            <div style={{ padding: "32px", textAlign: "center" }}>
              <p style={{ color: "#ef4444", fontSize: "14px", marginBottom: "8px" }}>
                ⚠️ {benchError}
              </p>
              <p style={{ color: "#8b8fa8", fontSize: "12px" }}>
                Make sure StarRocks is running on port 9030
              </p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #2a2d3e" }}>
                  {["Query", "Description", "MongoDB (actual)", "StarRocks (actual)", "Speedup"].map(h => (
                    <th key={h} style={{
                      textAlign: "left", padding: "12px 20px",
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
                {benchmarks.map((b, i) => (
                  <tr key={i} style={{
                    borderBottom: i < benchmarks.length - 1
                      ? "1px solid #2a2d3e" : "none"
                  }}>
                    <td style={{
                      padding: "14px 20px", fontSize: "13px",
                      fontWeight: 600, color: "#ffffff"
                    }}>
                      {b.query}
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: "12px", color: "#8b8fa8" }}>
                      {b.description}
                    </td>
                    <td style={{
                      padding: "14px 20px", fontSize: "14px",
                      fontWeight: 700, color: "#ef4444"
                    }}>
                      {b.mongodb_ms}ms
                    </td>
                    <td style={{
                      padding: "14px 20px", fontSize: "14px",
                      fontWeight: 700, color: "#10b981"
                    }}>
                      {b.starrocks_ms}ms
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{
                        fontSize: "13px", fontWeight: 700,
                        padding: "4px 12px", borderRadius: "20px",
                        backgroundColor: "#6366f120", color: "#6366f1",
                        border: "1px solid #6366f130"
                      }}>
                        {b.speedup}x faster
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              {benchSummary && (
                <tfoot>
                  <tr style={{ borderTop: "2px solid #2a2d3e", backgroundColor: "#0f1117" }}>
                    <td colSpan={2} style={{
                      padding: "14px 20px", fontSize: "13px",
                      fontWeight: 700, color: "#ffffff"
                    }}>
                      Average across {benchSummary.total_queries_run} queries
                    </td>
                    <td style={{
                      padding: "14px 20px", fontSize: "14px",
                      fontWeight: 800, color: "#ef4444"
                    }}>
                      {benchSummary.avg_mongodb_ms}ms
                    </td>
                    <td style={{
                      padding: "14px 20px", fontSize: "14px",
                      fontWeight: 800, color: "#10b981"
                    }}>
                      {benchSummary.avg_starrocks_ms}ms
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{
                        fontSize: "14px", fontWeight: 800,
                        padding: "6px 14px", borderRadius: "20px",
                        backgroundColor: "#6366f1", color: "#ffffff"
                      }}>
                        {benchSummary.avg_speedup}x faster
                      </span>
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* SECTION 3 — Revenue trend chart                                   */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div style={{
          borderRadius: "12px", backgroundColor: "#1a1d27",
          border: "1px solid #2a2d3e", padding: "24px"
        }}>
          <h3 style={{
            color: "#ffffff", fontWeight: 600,
            fontSize: "15px", marginBottom: "6px"
          }}>
            Revenue Trend — 2024
          </h3>
          <p style={{ color: "#8b8fa8", fontSize: "12px", marginBottom: "20px" }}>
            Monthly revenue in INR • Architecture powered by StarRocks
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
              <XAxis dataKey="month" stroke="#8b8fa8" tick={{ fontSize: 12 }} />
              <YAxis stroke="#8b8fa8" tick={{ fontSize: 12 }}
                tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="Revenue"
                stroke="#6366f1" strokeWidth={2} fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* SECTION 4 — Transactions + Industry split                         */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

          <div style={{
            borderRadius: "12px", backgroundColor: "#1a1d27",
            border: "1px solid #2a2d3e", padding: "24px"
          }}>
            <h3 style={{
              color: "#ffffff", fontWeight: 600,
              fontSize: "15px", marginBottom: "6px"
            }}>
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

          <div style={{
            borderRadius: "12px", backgroundColor: "#1a1d27",
            border: "1px solid #2a2d3e", padding: "24px"
          }}>
            <h3 style={{
              color: "#ffffff", fontWeight: 600,
              fontSize: "15px", marginBottom: "6px"
            }}>
              Revenue by Industry
            </h3>
            <p style={{ color: "#8b8fa8", fontSize: "12px", marginBottom: "20px" }}>
              Client distribution breakdown
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {categoryData.map(cat => (
                <div key={cat.category}>
                  <div style={{
                    display: "flex", justifyContent: "space-between", marginBottom: "6px"
                  }}>
                    <span style={{ fontSize: "13px", color: "#ffffff" }}>
                      {cat.category}
                    </span>
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

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* SECTION 5 — Apache Superset embedded BI                           */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div style={{
          borderRadius: "12px", backgroundColor: "#1a1d27",
          border: "1px solid #f59e0b40", overflow: "hidden"
        }}>
          <div style={{
            padding: "20px 24px", borderBottom: "1px solid #2a2d3e",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "linear-gradient(90deg, #f59e0b10, transparent)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "8px",
                backgroundColor: "#f59e0b",
                display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "16px"
              }}>
                📊
              </div>
              <div>
                <h3 style={{ color: "#ffffff", fontWeight: 700, fontSize: "15px" }}>
                  Apache Superset — Business Intelligence
                </h3>
                <p style={{ color: "#8b8fa8", fontSize: "12px", marginTop: "2px" }}>
                  Embedded BI dashboard • Guest token authenticated
                </p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{
                fontSize: "11px", padding: "3px 10px", borderRadius: "20px",
                fontWeight: 600, backgroundColor: "#f59e0b20",
                color: "#f59e0b", border: "1px solid #f59e0b30"
              }}>
                EMBEDDED BI
              </span>
              <a href="http://localhost:8088"
                target="_blank" rel="noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: "5px",
                  fontSize: "12px", color: "#8b8fa8", textDecoration: "none"
                }}>
                <ExternalLink size={13} />
                Open Superset
              </a>
            </div>
          </div>
          <div style={{ padding: "20px" }}>
            <SupersetEmbed height={465} />
          </div>
        </div>

      </div>
    </div>
  );
}