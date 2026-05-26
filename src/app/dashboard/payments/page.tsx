"use client";

import Header from "@/components/ui/Header";
import { useState } from "react";
import {
  Clock, CheckCircle, XCircle, AlertCircle,
  RefreshCw, ArrowRight, Zap, Shield,
  Database, TrendingUp
} from "lucide-react";

// --- Types ---
type PaymentStatus = "INITIATED" | "PROCESSING" | "CAPTURED" | "SETTLED" | "FAILED" | "REFUNDED";

interface Payment {
  id: string;
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

// --- Mock Data ---
const mockPayments: Payment[] = [
  {
    id: "pay_001",
    orderId: "ORD_2024_001",
    client: "Acme Corp",
    amount: 4500000,
    status: "SETTLED",
    method: "UPI",
    upiId: "acme@okaxis",
    createdAt: "2024-01-15 09:23:11",
    updatedAt: "2024-01-15 09:23:45",
    webhookEvents: [
      { event: "payment.initiated", timestamp: "09:23:11", status: "processed", payload: '{"amount": 4500000, "currency": "INR"}' },
      { event: "payment.processing", timestamp: "09:23:18", status: "processed", payload: '{"upi_ref": "UPI2401150923"}' },
      { event: "payment.captured", timestamp: "09:23:38", status: "processed", payload: '{"bank_ref": "AXIS2401150923"}' },
      { event: "payment.settled", timestamp: "09:23:45", status: "processed", payload: '{"settlement_id": "STL_001"}' },
    ]
  },
  {
    id: "pay_002",
    orderId: "ORD_2024_002",
    client: "TechStart Inc",
    amount: 1250000,
    status: "PROCESSING",
    method: "UPI",
    upiId: "techstart@paytm",
    createdAt: "2024-01-15 10:15:22",
    updatedAt: "2024-01-15 10:15:35",
    webhookEvents: [
      { event: "payment.initiated", timestamp: "10:15:22", status: "processed", payload: '{"amount": 1250000}' },
      { event: "payment.processing", timestamp: "10:15:35", status: "processed", payload: '{"upi_ref": "UPI2401151015"}' },
    ]
  },
  {
    id: "pay_003",
    orderId: "ORD_2024_003",
    client: "RetailHub",
    amount: 720000,
    status: "FAILED",
    method: "UPI",
    upiId: "retail@ybl",
    createdAt: "2024-01-15 11:02:44",
    updatedAt: "2024-01-15 11:02:58",
    webhookEvents: [
      { event: "payment.initiated", timestamp: "11:02:44", status: "processed", payload: '{"amount": 720000}' },
      { event: "payment.failed", timestamp: "11:02:58", status: "failed", payload: '{"error": "INSUFFICIENT_FUNDS", "code": "U16"}' },
    ]
  },
  {
    id: "pay_004",
    orderId: "ORD_2024_004",
    client: "FinServ Ltd",
    amount: 23400000,
    status: "CAPTURED",
    method: "UPI",
    upiId: "finserv@hdfcbank",
    createdAt: "2024-01-15 12:30:00",
    updatedAt: "2024-01-15 12:30:22",
    webhookEvents: [
      { event: "payment.initiated", timestamp: "12:30:00", status: "processed", payload: '{"amount": 23400000}' },
      { event: "payment.processing", timestamp: "12:30:08", status: "processed", payload: '{"upi_ref": "UPI2401151230"}' },
      { event: "payment.captured", timestamp: "12:30:22", status: "processed", payload: '{"bank_ref": "HDFC2401151230"}' },
    ]
  },
  {
    id: "pay_005",
    orderId: "ORD_2024_005",
    client: "GlobalTrade",
    amount: 9800000,
    status: "REFUNDED",
    method: "UPI",
    upiId: "global@icici",
    createdAt: "2024-01-14 15:45:00",
    updatedAt: "2024-01-15 09:00:00",
    webhookEvents: [
      { event: "payment.initiated", timestamp: "15:45:00", status: "processed", payload: '{"amount": 9800000}' },
      { event: "payment.captured", timestamp: "15:45:22", status: "processed", payload: '{"bank_ref": "ICICI2401141545"}' },
      { event: "payment.settled", timestamp: "15:46:00", status: "processed", payload: '{"settlement_id": "STL_005"}' },
      { event: "refund.initiated", timestamp: "09:00:00", status: "processed", payload: '{"refund_id": "RFD_005", "reason": "customer_request"}' },
      { event: "refund.processed", timestamp: "09:00:45", status: "processed", payload: '{"refund_ref": "RFND2401150900"}' },
    ]
  },
];

const mockLedger: LedgerEntry[] = [
  { id: "L001", type: "CREDIT", amount: 4500000, reference: "pay_001", referenceType: "PAYMENT", description: "Payment from Acme Corp", balanceAfter: 4500000, createdAt: "2024-01-15 09:23:45" },
  { id: "L002", type: "CREDIT", amount: 23400000, reference: "pay_004", referenceType: "PAYMENT", description: "Payment from FinServ Ltd", balanceAfter: 27900000, createdAt: "2024-01-15 12:30:22" },
  { id: "L003", type: "DEBIT", amount: 9800000, reference: "RFD_005", referenceType: "REFUND", description: "Refund to GlobalTrade", balanceAfter: 18100000, createdAt: "2024-01-15 09:00:45" },
  { id: "L004", type: "CREDIT", amount: 1250000, reference: "pay_002", referenceType: "PAYMENT", description: "Payment from TechStart Inc", balanceAfter: 19350000, createdAt: "2024-01-15 10:15:35" },
];

// --- Status Config ---
const statusConfig: Record<PaymentStatus, { color: string; bg: string; icon: any; label: string }> = {
  INITIATED:  { color: "#8b8fa8", bg: "#8b8fa820", icon: Clock,       label: "Initiated"  },
  PROCESSING: { color: "#f59e0b", bg: "#f59e0b20", icon: RefreshCw,   label: "Processing" },
  CAPTURED:   { color: "#6366f1", bg: "#6366f120", icon: CheckCircle, label: "Captured"   },
  SETTLED:    { color: "#10b981", bg: "#10b98120", icon: CheckCircle, label: "Settled"    },
  FAILED:     { color: "#ef4444", bg: "#ef444420", icon: XCircle,     label: "Failed"     },
  REFUNDED:   { color: "#f59e0b", bg: "#f59e0b20", icon: AlertCircle, label: "Refunded"   },
};

// State machine steps
const stateMachineSteps: PaymentStatus[] = [
  "INITIATED", "PROCESSING", "CAPTURED", "SETTLED"
];

const formatAmount = (paise: number) =>
  `₹${(paise / 100).toLocaleString("en-IN")}`;

export default function PaymentsPage() {
  const [selectedPayment, setSelectedPayment] = useState<Payment>(mockPayments[0]);
  const [activeTab, setActiveTab] = useState<"payments" | "ledger" | "webhooks">("payments");

  const stats = [
    { label: "Total Collected", value: formatAmount(mockPayments.filter(p => ["SETTLED", "CAPTURED"].includes(p.status)).reduce((a, p) => a + p.amount, 0)), color: "#10b981", icon: TrendingUp },
    { label: "Processing", value: mockPayments.filter(p => p.status === "PROCESSING").length.toString(), color: "#f59e0b", icon: RefreshCw },
    { label: "Failed Today", value: mockPayments.filter(p => p.status === "FAILED").length.toString(), color: "#ef4444", icon: XCircle },
    { label: "Success Rate", value: "94.2%", color: "#6366f1", icon: Shield },
  ];

  return (
    <div style={{ flex: 1, overflowY: "auto", backgroundColor: "#0f1117" }}>
      <Header
        title="Payments"
        subtitle="UPI payment flows, webhook events, and immutable ledger"
      />

      <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} style={{
                padding: "18px", borderRadius: "12px",
                backgroundColor: "#1a1d27", border: "1px solid #2a2d3e",
                display: "flex", alignItems: "center", gap: "14px"
              }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "10px",
                  backgroundColor: `${s.color}20`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0
                }}>
                  <Icon size={18} color={s.color} />
                </div>
                <div>
                  <p style={{ fontSize: "11px", color: "#8b8fa8", marginBottom: "4px" }}>{s.label}</p>
                  <p style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff" }}>{s.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* UPI State Machine */}
        <div style={{
          borderRadius: "12px", backgroundColor: "#1a1d27",
          border: "1px solid #2a2d3e", padding: "24px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
            <Zap size={16} color="#6366f1" />
            <h3 style={{ color: "#ffffff", fontWeight: 600, fontSize: "15px" }}>
              UPI Payment State Machine
            </h3>
            <span style={{
              fontSize: "11px", padding: "3px 8px", borderRadius: "20px",
              backgroundColor: "#6366f120", color: "#6366f1", fontWeight: 600
            }}>
              ARCHITECTURE
            </span>
          </div>

          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "center", gap: "0", flexWrap: "wrap"
          }}>
            {stateMachineSteps.map((step, i) => {
              const config = statusConfig[step];
              const Icon = config.icon;
              const currentIndex = stateMachineSteps.indexOf(
                stateMachineSteps.includes(selectedPayment.status as PaymentStatus)
                  ? selectedPayment.status as PaymentStatus
                  : "INITIATED"
              );
              const isActive = i <= currentIndex &&
                !["FAILED", "REFUNDED"].includes(selectedPayment.status);
              const isCurrent = step === selectedPayment.status;

              return (
                <div key={step} style={{ display: "flex", alignItems: "center" }}>
                  <div style={{
                    display: "flex", flexDirection: "column",
                    alignItems: "center", gap: "8px"
                  }}>
                    <div style={{
                      width: "48px", height: "48px", borderRadius: "50%",
                      border: `2px solid ${isActive ? config.color : "#2a2d3e"}`,
                      backgroundColor: isActive ? `${config.color}20` : "#0f1117",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.3s ease",
                      boxShadow: isCurrent ? `0 0 12px ${config.color}60` : "none"
                    }}>
                      <Icon size={18} color={isActive ? config.color : "#2a2d3e"} />
                    </div>
                    <span style={{
                      fontSize: "11px", fontWeight: 600,
                      color: isActive ? config.color : "#8b8fa8"
                    }}>
                      {config.label}
                    </span>
                  </div>
                  {i < stateMachineSteps.length - 1 && (
                    <div style={{
                      width: "60px", height: "2px", margin: "0 4px",
                      marginBottom: "20px",
                      backgroundColor: i < currentIndex && !["FAILED", "REFUNDED"].includes(selectedPayment.status)
                        ? "#6366f1" : "#2a2d3e",
                      transition: "all 0.3s ease"
                    }} />
                  )}
                </div>
              );
            })}

            {/* Failed / Refunded branch */}
            <div style={{ marginLeft: "20px", display: "flex", gap: "10px" }}>
              {["FAILED", "REFUNDED"].map((s) => {
                const config = statusConfig[s as PaymentStatus];
                const Icon = config.icon;
                const isActive = selectedPayment.status === s;
                return (
                  <div key={s} style={{
                    display: "flex", flexDirection: "column",
                    alignItems: "center", gap: "8px"
                  }}>
                    <div style={{
                      width: "48px", height: "48px", borderRadius: "50%",
                      border: `2px solid ${isActive ? config.color : "#2a2d3e"}`,
                      backgroundColor: isActive ? `${config.color}20` : "#0f1117",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: isActive ? `0 0 12px ${config.color}60` : "none"
                    }}>
                      <Icon size={18} color={isActive ? config.color : "#2a2d3e"} />
                    </div>
                    <span style={{
                      fontSize: "11px", fontWeight: 600,
                      color: isActive ? config.color : "#8b8fa8"
                    }}>
                      {config.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          borderRadius: "12px", backgroundColor: "#1a1d27",
          border: "1px solid #2a2d3e", overflow: "hidden"
        }}>
          {/* Tab Headers */}
          <div style={{
            display: "flex", borderBottom: "1px solid #2a2d3e"
          }}>
            {[
              { key: "payments", label: "💳 Payments" },
              { key: "webhooks", label: "⚡ Webhook Events" },
              { key: "ledger",   label: "📒 Immutable Ledger" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                style={{
                  padding: "14px 24px", fontSize: "13px", fontWeight: 600,
                  cursor: "pointer", border: "none", background: "none",
                  color: activeTab === tab.key ? "#6366f1" : "#8b8fa8",
                  borderBottom: `2px solid ${activeTab === tab.key ? "#6366f1" : "transparent"}`,
                  transition: "all 0.15s ease"
                }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Payments Tab */}
          {activeTab === "payments" && (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #2a2d3e" }}>
                  {["Order ID", "Client", "Amount", "Method", "Status", "Time", ""].map((h) => (
                    <th key={h} style={{
                      textAlign: "left", padding: "12px 20px",
                      fontSize: "11px", fontWeight: 600,
                      color: "#8b8fa8", textTransform: "uppercase",
                      letterSpacing: "0.05em"
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockPayments.map((payment, i) => {
                  const config = statusConfig[payment.status];
                  const Icon = config.icon;
                  const isSelected = selectedPayment.id === payment.id;
                  return (
                    <tr key={payment.id} style={{
                      borderBottom: i < mockPayments.length - 1 ? "1px solid #2a2d3e" : "none",
                      backgroundColor: isSelected ? "#6366f110" : "transparent",
                      cursor: "pointer"
                    }}
                      onClick={() => setSelectedPayment(payment)}>
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
                          backgroundColor: "#6366f120", color: "#6366f1", fontWeight: 600
                        }}>
                          {payment.method}
                          {payment.upiId && ` • ${payment.upiId}`}
                        </span>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: "5px",
                          fontSize: "12px", fontWeight: 600,
                          padding: "4px 10px", borderRadius: "20px",
                          backgroundColor: config.bg, color: config.color
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
          )}

          {/* Webhook Events Tab */}
          {activeTab === "webhooks" && (
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* Selected Payment Info */}
              <div style={{
                padding: "14px 16px", borderRadius: "8px",
                backgroundColor: "#6366f110", border: "1px solid #6366f130",
                display: "flex", alignItems: "center", gap: "12px"
              }}>
                <Zap size={14} color="#6366f1" />
                <span style={{ fontSize: "13px", color: "#8b8fa8" }}>
                  Showing webhook events for:
                </span>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff" }}>
                  {selectedPayment.orderId} — {selectedPayment.client}
                </span>
                <span style={{ fontSize: "12px", color: "#8b8fa8" }}>
                  (click a row in Payments tab to change)
                </span>
              </div>

              {/* Webhook Timeline */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {selectedPayment.webhookEvents.map((event, i) => (
                  <div key={i} style={{
                    display: "flex", gap: "14px", alignItems: "flex-start"
                  }}>
                    {/* Timeline dot */}
                    <div style={{
                      display: "flex", flexDirection: "column",
                      alignItems: "center", paddingTop: "4px"
                    }}>
                      <div style={{
                        width: "10px", height: "10px", borderRadius: "50%", flexShrink: 0,
                        backgroundColor: event.status === "processed" ? "#10b981"
                          : event.status === "failed" ? "#ef4444" : "#f59e0b"
                      }} />
                      {i < selectedPayment.webhookEvents.length - 1 && (
                        <div style={{
                          width: "2px", height: "40px",
                          backgroundColor: "#2a2d3e", marginTop: "4px"
                        }} />
                      )}
                    </div>

                    {/* Event Card */}
                    <div style={{
                      flex: 1, padding: "12px 16px", borderRadius: "8px",
                      backgroundColor: "#0f1117", border: "1px solid #2a2d3e",
                      marginBottom: "4px"
                    }}>
                      <div style={{
                        display: "flex", alignItems: "center",
                        justifyContent: "space-between", marginBottom: "6px"
                      }}>
                        <span style={{
                          fontSize: "13px", fontWeight: 600,
                          fontFamily: "monospace", color: "#6366f1"
                        }}>
                          {event.event}
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "11px", color: "#8b8fa8" }}>
                            {event.timestamp}
                          </span>
                          <span style={{
                            fontSize: "10px", padding: "2px 7px",
                            borderRadius: "20px", fontWeight: 600,
                            backgroundColor: event.status === "processed" ? "#10b98120"
                              : "#ef444420",
                            color: event.status === "processed" ? "#10b981" : "#ef4444"
                          }}>
                            {event.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <code style={{
                        fontSize: "11px", color: "#8b8fa8",
                        fontFamily: "monospace"
                      }}>
                        {event.payload}
                      </code>
                    </div>
                  </div>
                ))}
              </div>

              {/* Idempotency Note */}
              <div style={{
                padding: "14px 16px", borderRadius: "8px",
                backgroundColor: "#10b98110", border: "1px solid #10b98130",
                display: "flex", gap: "10px"
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
            </div>
          )}

          {/* Ledger Tab */}
          {activeTab === "ledger" && (
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* Immutable Ledger Note */}
              <div style={{
                padding: "14px 16px", borderRadius: "8px",
                backgroundColor: "#6366f110", border: "1px solid #6366f130",
                display: "flex", gap: "10px"
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

              {/* Ledger Table */}
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #2a2d3e" }}>
                    {["Entry ID", "Type", "Amount", "Reference", "Description", "Balance After", "Timestamp"].map((h) => (
                      <th key={h} style={{
                        textAlign: "left", padding: "10px 16px",
                        fontSize: "11px", fontWeight: 600,
                        color: "#8b8fa8", textTransform: "uppercase",
                        letterSpacing: "0.05em"
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mockLedger.map((entry, i) => (
                    <tr key={entry.id} style={{
                      borderBottom: i < mockLedger.length - 1 ? "1px solid #2a2d3e" : "none"
                    }}>
                      <td style={{ padding: "14px 16px", fontSize: "12px", fontFamily: "monospace", color: "#8b8fa8" }}>
                        {entry.id}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{
                          fontSize: "11px", fontWeight: 700,
                          padding: "3px 10px", borderRadius: "4px",
                          backgroundColor: entry.type === "CREDIT" ? "#10b98120" : "#ef444420",
                          color: entry.type === "CREDIT" ? "#10b981" : "#ef4444"
                        }}>
                          {entry.type === "CREDIT" ? "▲" : "▼"} {entry.type}
                        </span>
                      </td>
                      <td style={{
                        padding: "14px 16px", fontSize: "13px", fontWeight: 700,
                        color: entry.type === "CREDIT" ? "#10b981" : "#ef4444"
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
            </div>
          )}
        </div>

      </div>
    </div>
  );
}