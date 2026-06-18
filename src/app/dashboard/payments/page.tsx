"use client";

import Header from "@/components/ui/Header";
import { useCallback, useEffect, useState } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Zap,
  Shield,
  Database,
  TrendingUp,
  Loader2,
} from "lucide-react";

// --- Types ---
type PaymentStatus =
  | "INITIATED"
  | "PROCESSING"
  | "CAPTURED"
  | "SETTLED"
  | "FAILED"
  | "REFUNDED";

interface Payment {
  _id?: string;
  id: string;
  paymentId?: string;
  orderId: string;
  client: string;
  amount: number;
  status: PaymentStatus;
  method: string;
  upiId?: string;
  createdAt: string;
  updatedAt: string;
  webhookEvents: WebhookEvent[];
}

interface WebhookEvent {
  event: string;
  timestamp: string;
  status: "received" | "processed" | "failed";
  payload: string;
}

interface LedgerEntry {
  id: string;
  type: "CREDIT" | "DEBIT";
  amount: number;
  reference: string;
  referenceType: string;
  description: string;
  balanceAfter: number;
  createdAt: string;
}

// --- Status Config ---
const statusConfig: Record<
  PaymentStatus,
  { color: string; bg: string; icon: any; label: string }
> = {
  INITIATED: {
    color: "#8b8fa8",
    bg: "#8b8fa820",
    icon: Clock,
    label: "Initiated",
  },
  PROCESSING: {
    color: "#f59e0b",
    bg: "#f59e0b20",
    icon: RefreshCw,
    label: "Processing",
  },
  CAPTURED: {
    color: "#6366f1",
    bg: "#6366f120",
    icon: CheckCircle,
    label: "Captured",
  },
  SETTLED: {
    color: "#10b981",
    bg: "#10b98120",
    icon: CheckCircle,
    label: "Settled",
  },
  FAILED: { color: "#ef4444", bg: "#ef444420", icon: XCircle, label: "Failed" },
  REFUNDED: {
    color: "#f59e0b",
    bg: "#f59e0b20",
    icon: AlertCircle,
    label: "Refunded",
  },
};

// State machine steps
const stateMachineSteps: PaymentStatus[] = [
  "INITIATED",
  "PROCESSING",
  "CAPTURED",
  "SETTLED",
];

const formatAmount = (paise: number) =>
  `₹${(paise / 100).toLocaleString("en-IN")}`;

export default function PaymentsPage() {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [activeTab, setActiveTab] = useState<
    "payments" | "ledger" | "webhooks"
  >("payments");
  const [apiPayments, setApiPayments] = useState<any[]>([]);
  const [apiLedger,       setApiLedger]       = useState<LedgerEntry[]>([]);
  const [apiLoading,      setApiLoading]      = useState(true);
  const [ledgerLoading,   setLedgerLoading]   = useState(true);
  const [isLive, setIsLive] = useState(false);

  const fetchPayments = useCallback(async () => {
    setApiLoading(true);
    try {
      const res = await fetch("/api/payments");
      const json = await res.json();
      if (json.success && json.data.length > 0) {
        // Normalize API data to match our interface
        const normalized: Payment[] = json.data.map((p: any) => ({
          ...p,
          id: p.paymentId || p._id,
          webhookEvents: (p.webhookEvents || []).map((e: any) => ({
            event: e.event,
            timestamp: new Date(e.timestamp).toLocaleTimeString("en-IN"),
            status: e.status,
            payload: e.payload,
          })),
          createdAt: new Date(p.createdAt).toLocaleString("en-IN"),
          updatedAt: new Date(p.updatedAt).toLocaleString("en-IN"),
        }));
        setApiPayments(normalized);
        setSelectedPayment(normalized[0]);
        setIsLive(true);
      }
    } catch (err) {
      console.error("Payments fetch failed:", err);
    } finally {
      setApiLoading(false);
    }
  }, []);
  const fetchLedger = useCallback(async () => {
    setLedgerLoading(true);
    try {
      const res  = await fetch("/api/payments/ledger");
      const json = await res.json();
      if (json.success && json.data?.length > 0) {
        const normalized: LedgerEntry[] = json.data.map((e: any) => ({
          ...e,
          id:        e._id?.toString() || e.id,
          createdAt: new Date(e.createdAt).toLocaleString("en-IN"),
        }));
        setApiLedger(normalized);
      }
    } catch (err) {
      console.error("Ledger fetch failed:", err);
    } finally {
      setLedgerLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
    fetchLedger();
  }, [fetchPayments,fetchLedger]);

  const stats = [
    {
      label: "Total Collected",
      value: formatAmount(
        apiPayments
          .filter((p) => ["SETTLED", "CAPTURED"].includes(p.status))
          .reduce((a, p) => a + p.amount, 0),
      ),
      color: "#10b981",
      icon: TrendingUp,
    },
    {
      label: "Processing",
      value: apiPayments
        .filter((p) => p.status === "PROCESSING")
        .length.toString(),
      color: "#f59e0b",
      icon: RefreshCw,
    },
    {
      label: "Failed",
      value: apiPayments.filter((p) => p.status === "FAILED").length.toString(),
      color: "#ef4444",
      icon: XCircle,
    },
    { label: "Success Rate", value: "94.2%", color: "#6366f1", icon: Shield },
  ];

    const currentStatus = (selectedPayment?.status ?? "INITIATED") as PaymentStatus;
  const currentIndex  = stateMachineSteps.includes(currentStatus)
    ? stateMachineSteps.indexOf(currentStatus)
    : -1;
  const isTerminal    = ["FAILED", "REFUNDED"].includes(currentStatus);


  return (
    <div style={{ flex: 1, overflowY: "auto", backgroundColor: "#0f1117" }}>
      <Header
        title="Payments"
        subtitle="UPI payment flows, webhook events, and immutable ledger"
      />

      <div
        style={{
          padding: "32px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
             {/* ── Live badge ── */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{
                    fontSize: "11px", padding: "3px 10px", borderRadius: "20px", fontWeight: 600,
                    backgroundColor: isLive ? "#10b98120" : "#8b8fa820",
                    color: isLive ? "#10b981" : "#8b8fa8",
                    border: `1px solid ${isLive ? "#10b98130" : "#8b8fa830"}`,
                  }}>
                    {isLive ? "● LIVE MongoDB" : "● Loading..."}
                  </span>
                  <button
                    onClick={() => { fetchPayments(); fetchLedger(); }}
                    disabled={apiLoading}
                    style={{
                      display: "flex", alignItems: "center", gap: "6px",
                      padding: "4px 10px", borderRadius: "8px",
                      backgroundColor: "#1a1d27", border: "1px solid #2a2d3e",
                      color: "#8b8fa8", fontSize: "12px", cursor: "pointer",
                    }}>
                    <RefreshCw size={11} style={{ animation: apiLoading ? "spin 1s linear infinite" : "none" }} />
                    Refresh
                  </button>
                  <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
                </div>
        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
          }}
        >
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                style={{
                  padding: "18px",
                  borderRadius: "12px",
                  backgroundColor: "#1a1d27",
                  border: "1px solid #2a2d3e",
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    backgroundColor: `${s.color}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={18} color={s.color} />
                </div>
                <div>
                  <p
                    style={{
                      fontSize: "11px",
                      color: "#8b8fa8",
                      marginBottom: "4px",
                    }}
                  >
                    {s.label}
                  </p>
                  <p
                    style={{
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "#ffffff",
                    }}
                  >
                    {s.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* UPI State Machine */}
        <div
          style={{
            borderRadius: "12px",
            backgroundColor: "#1a1d27",
            border: "1px solid #2a2d3e",
            padding: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "20px",
            }}
          >
            <Zap size={16} color="#6366f1" />
            <h3 style={{ color: "#ffffff", fontWeight: 600, fontSize: "15px" }}>
              UPI Payment State Machine
            </h3>
            <span
              style={{
                fontSize: "11px",
                padding: "3px 8px",
                borderRadius: "20px",
                backgroundColor: "#6366f120",
                color: "#6366f1",
                fontWeight: 600,
              }}
            >
              ARCHITECTURE
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0",
              flexWrap: "wrap",
            }}
          >
            {stateMachineSteps.map((step, i) => {
              const config    = statusConfig[step];
              const Icon      = config.icon;
              const isActive  = !isTerminal && i <= currentIndex;
              const isCurrent = step === currentStatus;

              return (
                <div
                  key={step}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        border: `2px solid ${isActive ? config.color : "#2a2d3e"}`,
                        backgroundColor: isActive
                          ? `${config.color}20`
                          : "#0f1117",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.3s ease",
                        boxShadow: isCurrent
                          ? `0 0 12px ${config.color}60`
                          : "none",
                      }}
                    >
                      <Icon
                        size={18}
                        color={isActive ? config.color : "#2a2d3e"}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        color: isActive ? config.color : "#8b8fa8",
                      }}
                    >
                      {config.label}
                    </span>
                  </div>
                  {i < stateMachineSteps.length - 1 && (
                    <div style={{
                      width: "60px", height: "2px", margin: "0 4px", marginBottom: "20px",
                      backgroundColor: !isTerminal && i < currentIndex ? "#6366f1" : "#2a2d3e",
                      transition: "all 0.3s ease",
                    }} />
                  )}
                </div>
              );
            })}

            {/* Failed / Refunded branch */}
            <div style={{ marginLeft: "20px", display: "flex", gap: "10px" }}>
              {(["FAILED", "REFUNDED"] as PaymentStatus[]).map((s) => {
                const config = statusConfig[s as PaymentStatus];
                const Icon = config.icon;
                const isActive = selectedPayment?.status === s;
                return (
                  <div
                    key={s}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        border: `2px solid ${isActive ? config.color : "#2a2d3e"}`,
                        backgroundColor: isActive
                          ? `${config.color}20`
                          : "#0f1117",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: isActive
                          ? `0 0 12px ${config.color}60`
                          : "none",
                      }}
                    >
                      <Icon
                        size={18}
                        color={isActive ? config.color : "#2a2d3e"}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        color: isActive ? config.color : "#8b8fa8",
                      }}
                    >
                      {config.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div
          style={{
            borderRadius: "12px",
            backgroundColor: "#1a1d27",
            border: "1px solid #2a2d3e",
            overflow: "hidden",
          }}
        >
          {/* Tab Headers */}
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid #2a2d3e",
            }}
          >
            {[
              { key: "payments", label: "💳 Payments" },
              { key: "webhooks", label: "⚡ Webhook Events" },
              { key: "ledger", label: "📒 Immutable Ledger" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                style={{
                  padding: "14px 24px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  border: "none",
                  background: "none",
                  color: activeTab === tab.key ? "#6366f1" : "#8b8fa8",
                  borderBottom: `2px solid ${activeTab === tab.key ? "#6366f1" : "transparent"}`,
                  transition: "all 0.15s ease",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

 {/* ── Payments tab ── */}
          {activeTab === "payments" && (
            apiLoading ? (
              <div style={{
                padding: "64px", display: "flex",
                alignItems: "center", justifyContent: "center", gap: "12px",
              }}>
                <Loader2 size={20} color="#6366f1" style={{ animation: "spin 1s linear infinite" }} />
                <span style={{ color: "#8b8fa8", fontSize: "14px" }}>Fetching from MongoDB...</span>
              </div>
            ) : apiPayments.length === 0 ? (
              <div style={{ padding: "48px", textAlign: "center", color: "#8b8fa8", fontSize: "14px" }}>
                No payments found.{" "}
                <a href="/api/seed" style={{ color: "#6366f1" }}>Seed the database</a>
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #2a2d3e" }}>
                    {["Order ID", "Client", "Amount", "Method", "Status", "Time", ""].map((h) => (
                      <th key={h} style={{
                        textAlign: "left", padding: "12px 20px",
                        fontSize: "11px", fontWeight: 600,
                        color: "#8b8fa8", textTransform: "uppercase", letterSpacing: "0.05em",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {apiPayments.map((payment, i) => {
                    const config     = statusConfig[payment.status] ?? statusConfig["INITIATED"];
                    const Icon       = config.icon;
                    const isSelected = selectedPayment?.id === payment.id;
                    return (
                      <tr
                        key={payment.id}
                        onClick={() => setSelectedPayment(payment)}
                        style={{
                          borderBottom: i < apiPayments.length - 1 ? "1px solid #2a2d3e" : "none",
                          backgroundColor: isSelected ? "#6366f110" : "transparent",
                          cursor: "pointer",
                        }}>
                        <td style={{ padding: "14px 20px", fontSize: "12px", fontFamily: "monospace", color: "#6366f1" }}>
                          {payment.orderId}
                        </td>
                        <td style={{ padding: "14px 20px", fontSize: "13px", color: "#ffffff" }}>
                          {payment.client}
                        </td>
                        <td style={{ padding: "14px 20px", fontSize: "13px", fontWeight: 700, color: "#ffffff" }}>
                          {formatAmount(payment.amount)}
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <span style={{
                            fontSize: "11px", padding: "3px 8px", borderRadius: "4px",
                            backgroundColor: "#6366f120", color: "#6366f1", fontWeight: 600,
                          }}>
                            {payment.method}{payment.upiId && ` • ${payment.upiId}`}
                          </span>
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: "5px",
                            fontSize: "12px", fontWeight: 600,
                            padding: "4px 10px", borderRadius: "20px",
                            backgroundColor: config.bg, color: config.color,
                          }}>
                            <Icon size={11} />
                            {config.label}
                          </span>
                        </td>
                        <td style={{ padding: "14px 20px", fontSize: "12px", color: "#8b8fa8" }}>
                          {payment.createdAt}
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <ArrowRight size={14} color={isSelected ? "#6366f1" : "#8b8fa8"} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )
          )}

          {/* ── Webhooks tab ── */}
          {activeTab === "webhooks" && (
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {!selectedPayment ? (
                <div style={{ padding: "48px", textAlign: "center", color: "#8b8fa8", fontSize: "14px" }}>
                  Select a payment from the Payments tab to view webhook events.
                </div>
              ) : (
                <>
                  <div style={{
                    padding: "14px 16px", borderRadius: "8px",
                    backgroundColor: "#6366f110", border: "1px solid #6366f130",
                    display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap",
                  }}>
                    <Zap size={14} color="#6366f1" />
                    <span style={{ fontSize: "13px", color: "#8b8fa8" }}>Showing events for:</span>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff" }}>
                      {selectedPayment.orderId} — {selectedPayment.client}
                    </span>
                    <span style={{ fontSize: "12px", color: "#8b8fa8" }}>
                      (click a row in Payments tab to change)
                    </span>
                  </div>

                  {!selectedPayment.webhookEvents?.length ? (
                    <div style={{ padding: "32px", textAlign: "center", color: "#8b8fa8", fontSize: "13px" }}>
                      No webhook events recorded for this payment.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {selectedPayment.webhookEvents.map((event, i) => (
                        <div key={i} style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "4px" }}>
                            <div style={{
                              width: "10px", height: "10px", borderRadius: "50%", flexShrink: 0,
                              backgroundColor: event.status === "processed" ? "#10b981"
                                : event.status === "failed" ? "#ef4444" : "#f59e0b",
                            }} />
                            {i < selectedPayment.webhookEvents.length - 1 && (
                              <div style={{ width: "2px", height: "40px", backgroundColor: "#2a2d3e", marginTop: "4px" }} />
                            )}
                          </div>
                          <div style={{
                            flex: 1, padding: "12px 16px", borderRadius: "8px",
                            backgroundColor: "#0f1117", border: "1px solid #2a2d3e", marginBottom: "4px",
                          }}>
                            <div style={{
                              display: "flex", alignItems: "center",
                              justifyContent: "space-between", marginBottom: "6px",
                            }}>
                              <span style={{ fontSize: "13px", fontWeight: 600, fontFamily: "monospace", color: "#6366f1" }}>
                                {event.event}
                              </span>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span style={{ fontSize: "11px", color: "#8b8fa8" }}>{event.timestamp}</span>
                                <span style={{
                                  fontSize: "10px", padding: "2px 7px", borderRadius: "20px", fontWeight: 600,
                                  backgroundColor: event.status === "processed" ? "#10b98120" : "#ef444420",
                                  color: event.status === "processed" ? "#10b981" : "#ef4444",
                                }}>
                                  {event.status.toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <code style={{ fontSize: "11px", color: "#8b8fa8", fontFamily: "monospace" }}>
                              {event.payload}
                            </code>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{
                    padding: "14px 16px", borderRadius: "8px",
                    backgroundColor: "#10b98110", border: "1px solid #10b98130",
                    display: "flex", gap: "10px",
                  }}>
                    <Shield size={16} color="#10b981" style={{ flexShrink: 0, marginTop: "1px" }} />
                    <div>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: "#10b981", marginBottom: "4px" }}>
                        Idempotency Protection Active
                      </p>
                      <p style={{ fontSize: "12px", color: "#8b8fa8", lineHeight: 1.5 }}>
                        Every webhook is verified using HMAC-SHA256 signature.
                        Duplicate events are detected via idempotency keys and safely ignored.
                        Failed events are retried up to 3 times with exponential backoff.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Ledger tab ── */}
          {activeTab === "ledger" && (
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{
                padding: "14px 16px", borderRadius: "8px",
                backgroundColor: "#6366f110", border: "1px solid #6366f130",
                display: "flex", gap: "10px",
              }}>
                <Database size={16} color="#6366f1" style={{ flexShrink: 0, marginTop: "1px" }} />
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#6366f1", marginBottom: "4px" }}>
                    Double-Entry Immutable Ledger
                  </p>
                  <p style={{ fontSize: "12px", color: "#8b8fa8", lineHeight: 1.5 }}>
                    Every transaction is recorded as an immutable entry. Records are NEVER updated —
                    refunds create new DEBIT entries. All amounts stored in paise (₹1 = 100 paise)
                    to avoid floating-point errors. RBI-compliant audit trail.
                  </p>
                </div>
              </div>

              {ledgerLoading ? (
                <div style={{
                  padding: "48px", display: "flex",
                  alignItems: "center", justifyContent: "center", gap: "12px",
                }}>
                  <Loader2 size={20} color="#6366f1" style={{ animation: "spin 1s linear infinite" }} />
                  <span style={{ color: "#8b8fa8", fontSize: "14px" }}>Fetching ledger from MongoDB...</span>
                </div>
              ) : apiLedger.length === 0 ? (
                <div style={{ padding: "32px", textAlign: "center", color: "#8b8fa8", fontSize: "13px" }}>
                  No ledger entries found.
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #2a2d3e" }}>
                      {["Entry ID", "Type", "Amount", "Reference", "Description", "Balance After", "Timestamp"].map((h) => (
                        <th key={h} style={{
                          textAlign: "left", padding: "10px 16px",
                          fontSize: "11px", fontWeight: 600,
                          color: "#8b8fa8", textTransform: "uppercase", letterSpacing: "0.05em",
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {apiLedger.map((entry, i) => (
                      <tr key={entry.id} style={{
                        borderBottom: i < apiLedger.length - 1 ? "1px solid #2a2d3e" : "none",
                      }}>
                        <td style={{ padding: "14px 16px", fontSize: "12px", fontFamily: "monospace", color: "#8b8fa8" }}>
                          {entry.id}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{
                            fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "4px",
                            backgroundColor: entry.type === "CREDIT" ? "#10b98120" : "#ef444420",
                            color: entry.type === "CREDIT" ? "#10b981" : "#ef4444",
                          }}>
                            {entry.type === "CREDIT" ? "▲" : "▼"} {entry.type}
                          </span>
                        </td>
                        <td style={{
                          padding: "14px 16px", fontSize: "13px", fontWeight: 700,
                          color: entry.type === "CREDIT" ? "#10b981" : "#ef4444",
                        }}>
                          {entry.type === "CREDIT" ? "+" : "-"}{formatAmount(entry.amount)}
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: "12px", fontFamily: "monospace", color: "#6366f1" }}>
                          {entry.reference}
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: "13px", color: "#ffffff" }}>
                          {entry.description}
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: 600, color: "#ffffff" }}>
                          {formatAmount(entry.balanceAfter)}
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: "12px", color: "#8b8fa8" }}>
                          {entry.createdAt}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
      </div>
    </div>
  );
}
