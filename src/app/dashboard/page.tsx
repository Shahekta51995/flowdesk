import Header from "@/components/ui/Header";
import {
  TrendingUp, CreditCard, Users, Activity,
  ArrowUpRight, ArrowDownRight,
} from "lucide-react";

const stats = [
  { label: "Total Revenue", value: "₹24,31,500", change: "+12.5%", positive: true, icon: TrendingUp, color: "#6366f1" },
  { label: "Transactions", value: "8,492", change: "+8.2%", positive: true, icon: CreditCard, color: "#10b981" },
  { label: "Active Clients", value: "1,284", change: "+3.1%", positive: true, icon: Users, color: "#f59e0b" },
  { label: "Failed Payments", value: "23", change: "-18.4%", positive: false, icon: Activity, color: "#ef4444" },
];

const recentPayments = [
  { id: "PAY001", client: "Acme Corp", amount: "₹45,000", status: "Success", time: "2 min ago" },
  { id: "PAY002", client: "TechStart Inc", amount: "₹12,500", status: "Pending", time: "5 min ago" },
  { id: "PAY003", client: "GlobalTrade", amount: "₹98,000", status: "Success", time: "12 min ago" },
  { id: "PAY004", client: "RetailHub", amount: "₹7,200", status: "Failed", time: "18 min ago" },
  { id: "PAY005", client: "FinServ Ltd", amount: "₹2,34,000", status: "Success", time: "25 min ago" },
];

const statusColors: Record<string, string> = {
  Success: "#10b981",
  Pending: "#f59e0b",
  Failed: "#ef4444",
};

export default function DashboardPage() {
  return (
    <div style={{ flex: 1, overflowY: "auto", backgroundColor: "#0f1117" }}>
      <Header
        title="Overview"
        subtitle="Welcome back, Ekta — here's what's happening today"
      />

      <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "32px" }}>

        {/* Stats Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "20px"
        }}>
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} style={{
                padding: "20px",
                borderRadius: "12px",
                backgroundColor: "#1a1d27",
                border: "1px solid #2a2d3e",
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px"
                }}>
                  <span style={{ fontSize: "13px", fontWeight: 500, color: "#8b8fa8" }}>
                    {stat.label}
                  </span>
                  <div style={{
                    width: "36px", height: "36px",
                    borderRadius: "8px",
                    backgroundColor: `${stat.color}20`,
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    <Icon size={18} color={stat.color} />
                  </div>
                </div>

                <p style={{ fontSize: "24px", fontWeight: 700, color: "#ffffff", marginBottom: "8px" }}>
                  {stat.value}
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  {stat.positive
                    ? <ArrowUpRight size={14} color="#10b981" />
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

        {/* Recent Payments */}
        <div style={{
          borderRadius: "12px",
          backgroundColor: "#1a1d27",
          border: "1px solid #2a2d3e",
          overflow: "hidden"
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
            <button style={{
              fontSize: "13px", color: "#6366f1",
              background: "none", border: "none", cursor: "pointer"
            }}>
              View all →
            </button>
          </div>

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
              {recentPayments.map((payment, i) => (
                <tr key={payment.id} style={{
                  borderBottom: i < recentPayments.length - 1
                    ? "1px solid #2a2d3e" : "none"
                }}>
                  <td style={{
                    padding: "16px 24px", fontSize: "13px",
                    fontFamily: "monospace", color: "#6366f1"
                  }}>
                    {payment.id}
                  </td>
                  <td style={{ padding: "16px 24px", fontSize: "14px", color: "#ffffff" }}>
                    {payment.client}
                  </td>
                  <td style={{
                    padding: "16px 24px", fontSize: "14px",
                    fontWeight: 600, color: "#ffffff"
                  }}>
                    {payment.amount}
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <span style={{
                      fontSize: "12px", fontWeight: 500,
                      padding: "4px 10px", borderRadius: "20px",
                      backgroundColor: `${statusColors[payment.status]}20`,
                      color: statusColors[payment.status]
                    }}>
                      {payment.status}
                    </span>
                  </td>
                  <td style={{
                    padding: "16px 24px", fontSize: "13px", color: "#8b8fa8"
                  }}>
                    {payment.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}