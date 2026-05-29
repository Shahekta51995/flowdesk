"use client";

import { useEffect, useState } from "react";
import Header from "@/components/ui/Header";
import {
  CheckCircle, Clock, XCircle,
  ArrowRight, ChevronLeft, ChevronRight,
  Download
} from "lucide-react";

const formatAmount = (paise: number) =>
  `₹${(paise / 100).toLocaleString("en-IN")}`;

const statusConfig: Record<string, { color: string; bg: string; icon: any; label: string }> = {
  SETTLED:    { color: "#10b981", bg: "#10b98120", icon: CheckCircle, label: "Settled"    },
  CAPTURED:   { color: "#6366f1", bg: "#6366f120", icon: CheckCircle, label: "Captured"   },
  PROCESSING: { color: "#f59e0b", bg: "#f59e0b20", icon: Clock,       label: "Processing" },
  INITIATED:  { color: "#8b8fa8", bg: "#8b8fa820", icon: Clock,       label: "Initiated"  },
  FAILED:     { color: "#ef4444", bg: "#ef444420", icon: XCircle,     label: "Failed"     },
  REFUNDED:   { color: "#f59e0b", bg: "#f59e0b20", icon: ArrowRight,  label: "Refunded"   },
};

export default function PaymentHistory() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);
  const [status,   setStatus]   = useState("ALL");
  const pageSize = 10;

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page:  page.toString(),
        limit: pageSize.toString(),
        ...(status !== "ALL" && { status }),
      });
      const res  = await fetch(`/api/payments?${params}`);
      const json = await res.json();
      if (json.success) {
        setPayments(json.data);
        setTotal(json.pagination?.total || 0);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, [page, status]);

  const totalPages = Math.ceil(total / pageSize);

  const handleExport = () => {
    const rows = payments.map(p =>
      [p.orderId, formatAmount(p.amount), p.status, p.method,
       new Date(p.createdAt).toLocaleDateString("en-IN")].join(",")
    );
    const csv  = ["Order ID,Amount,Status,Method,Date", ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "payment-history.csv"; a.click();
  };

  return (
    <div style={{ flex: 1, overflowY: "auto", backgroundColor: "#0f1117" }}>
      <Header
        title="Payment History"
        subtitle="All your transactions in one place"
      />

      <div style={{ padding: "32px" }}>
        <div style={{
          borderRadius: "12px", backgroundColor: "#1a1d27",
          border: "1px solid #2a2d3e", overflow: "hidden"
        }}>

          {/* Toolbar */}
          <div style={{
            padding: "16px 20px", borderBottom: "1px solid #2a2d3e",
            display: "flex", alignItems: "center",
            justifyContent: "space-between", flexWrap: "wrap", gap: "10px"
          }}>
            {/* Status Filter */}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {["ALL","SETTLED","PROCESSING","FAILED","REFUNDED"].map(s => (
                <button key={s}
                  onClick={() => { setStatus(s); setPage(1); }}
                  style={{
                    padding: "6px 12px", borderRadius: "6px",
                    fontSize: "12px", fontWeight: 600,
                    cursor: "pointer", border: "1px solid",
                    borderColor: status === s ? "#10b981" : "#2a2d3e",
                    backgroundColor: status === s ? "#10b98120" : "transparent",
                    color: status === s ? "#10b981" : "#8b8fa8",
                  }}>
                  {s}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "12px", color: "#8b8fa8" }}>
                {total} transactions
              </span>
              <button onClick={handleExport}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "7px 14px", borderRadius: "8px",
                  backgroundColor: "#10b98120", border: "1px solid #10b98140",
                  color: "#10b981", fontSize: "12px",
                  fontWeight: 600, cursor: "pointer"
                }}>
                <Download size={13} />
                Export CSV
              </button>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div style={{
              padding: "48px", textAlign: "center",
              color: "#8b8fa8", fontSize: "14px"
            }}>
              Loading transactions...
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #2a2d3e" }}>
                  {["Order ID","Amount","Method","UPI ID","Status","Date"].map(h => (
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
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{
                      padding: "48px", textAlign: "center",
                      color: "#8b8fa8", fontSize: "14px"
                    }}>
                      No transactions found
                    </td>
                  </tr>
                ) : payments.map((p, i) => {
                  const config = statusConfig[p.status] || statusConfig.INITIATED;
                  const Icon   = config.icon;
                  return (
                    <tr key={p._id} style={{
                      borderBottom: i < payments.length - 1
                        ? "1px solid #2a2d3e" : "none"
                    }}>
                      <td style={{
                        padding: "14px 20px", fontSize: "12px",
                        fontFamily: "monospace", color: "#6366f1"
                      }}>
                        {p.orderId}
                      </td>
                      <td style={{
                        padding: "14px 20px", fontSize: "13px",
                        fontWeight: 700, color: "#ffffff"
                      }}>
                        {formatAmount(p.amount)}
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{
                          fontSize: "11px", padding: "3px 8px",
                          borderRadius: "4px", backgroundColor: "#6366f120",
                          color: "#6366f1", fontWeight: 600
                        }}>
                          {p.method || "UPI"}
                        </span>
                      </td>
                      <td style={{
                        padding: "14px 20px", fontSize: "12px",
                        color: "#8b8fa8", fontFamily: "monospace"
                      }}>
                        {p.upiId || "—"}
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center",
                          gap: "5px", fontSize: "12px", fontWeight: 600,
                          padding: "4px 10px", borderRadius: "20px",
                          backgroundColor: config.bg, color: config.color
                        }}>
                          <Icon size={11} />
                          {config.label}
                        </span>
                      </td>
                      <td style={{
                        padding: "14px 20px", fontSize: "12px",
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              padding: "14px 20px", borderTop: "1px solid #2a2d3e",
              display: "flex", alignItems: "center",
              justifyContent: "space-between"
            }}>
              <span style={{ fontSize: "12px", color: "#8b8fa8" }}>
                Page {page} of {totalPages}
              </span>
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    width: "32px", height: "32px", borderRadius: "6px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    backgroundColor: "#0f1117", border: "1px solid #2a2d3e",
                    cursor: page === 1 ? "not-allowed" : "pointer",
                    opacity: page === 1 ? 0.4 : 1, color: "#ffffff"
                  }}>
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{
                    width: "32px", height: "32px", borderRadius: "6px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    backgroundColor: "#0f1117", border: "1px solid #2a2d3e",
                    cursor: page === totalPages ? "not-allowed" : "pointer",
                    opacity: page === totalPages ? 0.4 : 1, color: "#ffffff"
                  }}>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}