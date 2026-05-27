"use client";

import Header from "@/components/ui/Header";
import { useState, useMemo } from "react";
import {
  Search, Filter, Download, ChevronLeft,
  ChevronRight, ChevronUp, ChevronDown,
  Building2, Mail, Phone, TrendingUp,
  Users, UserCheck, UserX, ArrowUpDown
} from "lucide-react";

// --- Types ---
type SortField = "name" | "company" | "totalSpend" | "joinedAt" | "status";
type SortDir = "asc" | "desc";
type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE" | "CHURNED";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  industry: string;
  totalSpend: number;
  transactions: number;
  status: "ACTIVE" | "INACTIVE" | "CHURNED";
  joinedAt: string;
  lastActivity: string;
}

// --- Generate 50 mock customers ---
const industries = ["FinTech", "SaaS", "Retail", "Logistics", "Healthcare", "EdTech"];
const statuses: Customer["status"][] = ["ACTIVE", "ACTIVE", "ACTIVE", "INACTIVE", "CHURNED"];
const companies = [
  "Acme Corp", "TechStart Inc", "GlobalTrade", "RetailHub", "FinServ Ltd",
  "DataSync", "CloudBase", "SwiftPay", "NeoBank", "PayFlow",
  "ShopEasy", "LogiTrack", "MediCare", "EduLearn", "GreenTech",
  "FastShip", "SecurePay", "SmartRetail", "HealthFirst", "LearnHub",
  "TradeCo", "NetSoft", "DigiPay", "FlexWork", "BrightMind",
  "QuickServe", "ProTech", "SafeBank", "EcoShop", "TalentHub",
  "StreamPay", "DataVault", "SwiftMove", "ClearPay", "TrustBank",
  "SmartFlow", "PureData", "NimblePay", "OptiTrade", "VisionTech",
  "RapidServe", "CorePay", "AgileBank", "PeakRetail", "ZenTech",
  "BoldPay", "PrimeSoft", "MaxFlow", "NextGen", "AlphaTech",
];

const mockCustomers: Customer[] = companies.map((company, i) => ({
  id: `CUST_${String(i + 1).padStart(3, "0")}`,
  name: ["Rahul Sharma", "Priya Patel", "Amit Kumar", "Sneha Gupta", "Raj Mehta",
    "Ananya Singh", "Vikram Nair", "Pooja Joshi", "Arjun Reddy", "Kavya Iyer"][i % 10],
  email: `${company.toLowerCase().replace(/\s/g, ".")}@gmail.com`,
  phone: `+91 ${9800000000 + i}`,
  company,
  industry: industries[i % industries.length],
  totalSpend: Math.floor(Math.random() * 5000000) + 100000,
  transactions: Math.floor(Math.random() * 200) + 10,
  status: statuses[i % statuses.length],
  joinedAt: `2023-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`,
  lastActivity: `${i % 30 + 1} days ago`,
}));

const statusConfig = {
  ACTIVE:   { color: "#10b981", bg: "#10b98120", label: "Active"   },
  INACTIVE: { color: "#f59e0b", bg: "#f59e0b20", label: "Inactive" },
  CHURNED:  { color: "#ef4444", bg: "#ef444420", label: "Churned"  },
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const formatAmount = (paise: number) =>
  `₹${(paise / 100).toLocaleString("en-IN")}`;

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [industryFilter, setIndustryFilter] = useState("ALL");
  const [sortField, setSortField] = useState<SortField>("totalSpend");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // --- Filter + Sort ---
  const filtered = useMemo(() => {
    let data = [...mockCustomers];

    if (search) {
      const q = search.toLowerCase();
      data = data.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "ALL")
      data = data.filter(c => c.status === statusFilter);

    if (industryFilter !== "ALL")
      data = data.filter(c => c.industry === industryFilter);

    data.sort((a, b) => {
      let diff = 0;
      if (sortField === "name")      diff = a.name.localeCompare(b.name);
      if (sortField === "company")   diff = a.company.localeCompare(b.company);
      if (sortField === "totalSpend") diff = a.totalSpend - b.totalSpend;
      if (sortField === "joinedAt")  diff = a.joinedAt.localeCompare(b.joinedAt);
      if (sortField === "status")    diff = a.status.localeCompare(b.status);
      return sortDir === "asc" ? diff : -diff;
    });

    return data;
  }, [search, statusFilter, industryFilter, sortField, sortDir]);

  // --- Pagination ---
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
    setPage(1);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === paginated.length)
      setSelectedIds(new Set());
    else
      setSelectedIds(new Set(paginated.map(c => c.id)));
  };

  // CSV Export
  const handleExport = () => {
    const rows = filtered.map(c =>
      [c.id, c.name, c.email, c.company, c.industry,
       formatAmount(c.totalSpend), c.transactions, c.status, c.joinedAt].join(",")
    );
    const csv = ["ID,Name,Email,Company,Industry,Total Spend,Transactions,Status,Joined", ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = "customers.csv"; a.click();
  };

  // Stats
  const totalActive   = mockCustomers.filter(c => c.status === "ACTIVE").length;
  const totalInactive = mockCustomers.filter(c => c.status === "INACTIVE").length;
  const totalChurned  = mockCustomers.filter(c => c.status === "CHURNED").length;
  const totalRevenue  = mockCustomers.reduce((a, c) => a + c.totalSpend, 0);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown size={12} color="#8b8fa8" />;
    return sortDir === "asc"
      ? <ChevronUp size={12} color="#6366f1" />
      : <ChevronDown size={12} color="#6366f1" />;
  };

  return (
    <div style={{ flex: 1, overflowY: "auto", backgroundColor: "#0f1117" }}>
      <Header title="Customers" subtitle="Manage and analyse your enterprise client base" />

      <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
          {[
            { label: "Total Clients",    value: mockCustomers.length.toString(), icon: Users,     color: "#6366f1" },
            { label: "Active",           value: totalActive.toString(),          icon: UserCheck,  color: "#10b981" },
            { label: "Inactive",         value: totalInactive.toString(),        icon: UserX,      color: "#f59e0b" },
            { label: "Total Revenue",    value: formatAmount(totalRevenue),      icon: TrendingUp, color: "#10b981" },
          ].map((s) => {
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
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
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

        {/* Table Card */}
        <div style={{
          borderRadius: "12px", backgroundColor: "#1a1d27",
          border: "1px solid #2a2d3e", overflow: "hidden"
        }}>

          {/* Toolbar */}
          <div style={{
            padding: "16px 20px", borderBottom: "1px solid #2a2d3e",
            display: "flex", alignItems: "center",
            justifyContent: "space-between", gap: "12px", flexWrap: "wrap"
          }}>
            {/* Left — Search + Filters */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>

              {/* Search */}
              <div style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "8px 12px", borderRadius: "8px",
                backgroundColor: "#0f1117", border: "1px solid #2a2d3e",
                minWidth: "220px"
              }}>
                <Search size={14} color="#8b8fa8" />
                <input
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search name, company, email..."
                  style={{
                    background: "none", border: "none", outline: "none",
                    color: "#ffffff", fontSize: "13px", width: "100%"
                  }}
                />
              </div>

              {/* Status Filter */}
              <div style={{ display: "flex", gap: "6px" }}>
                {(["ALL", "ACTIVE", "INACTIVE", "CHURNED"] as StatusFilter[]).map(s => (
                  <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
                    style={{
                      padding: "6px 12px", borderRadius: "6px",
                      fontSize: "12px", fontWeight: 600,
                      cursor: "pointer", border: "1px solid",
                      borderColor: statusFilter === s ? "#6366f1" : "#2a2d3e",
                      backgroundColor: statusFilter === s ? "#6366f120" : "transparent",
                      color: statusFilter === s ? "#6366f1" : "#8b8fa8",
                    }}>
                    {s}
                  </button>
                ))}
              </div>

              {/* Industry Filter */}
              <select
                value={industryFilter}
                onChange={e => { setIndustryFilter(e.target.value); setPage(1); }}
                style={{
                  padding: "7px 12px", borderRadius: "8px",
                  backgroundColor: "#0f1117", border: "1px solid #2a2d3e",
                  color: "#ffffff", fontSize: "13px", cursor: "pointer",
                  outline: "none"
                }}>
                <option value="ALL">All Industries</option>
                {industries.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>

            {/* Right — Results + Export */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {selectedIds.size > 0 && (
                <span style={{ fontSize: "12px", color: "#6366f1", fontWeight: 600 }}>
                  {selectedIds.size} selected
                </span>
              )}
              <span style={{ fontSize: "12px", color: "#8b8fa8" }}>
                {filtered.length} results
              </span>
              <button onClick={handleExport}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "7px 14px", borderRadius: "8px",
                  backgroundColor: "#6366f120", border: "1px solid #6366f140",
                  color: "#6366f1", fontSize: "12px", fontWeight: 600,
                  cursor: "pointer"
                }}>
                <Download size={13} />
                Export CSV
              </button>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #2a2d3e" }}>

                  {/* Checkbox */}
                  <th style={{ padding: "12px 16px", width: "40px" }}>
                    <input type="checkbox"
                      checked={selectedIds.size === paginated.length && paginated.length > 0}
                      onChange={toggleAll}
                      style={{ cursor: "pointer", accentColor: "#6366f1" }}
                    />
                  </th>

                  {[
                    { label: "Customer",     field: "name"       as SortField },
                    { label: "Company",      field: "company"    as SortField },
                    { label: "Industry",     field: null },
                    { label: "Total Spend",  field: "totalSpend" as SortField },
                    { label: "Transactions", field: null },
                    { label: "Status",       field: "status"     as SortField },
                    { label: "Joined",       field: "joinedAt"   as SortField },
                    { label: "Last Active",  field: null },
                  ].map(({ label, field }) => (
                    <th key={label}
                      onClick={() => field && handleSort(field)}
                      style={{
                        textAlign: "left", padding: "12px 16px",
                        fontSize: "11px", fontWeight: 600,
                        color: "#8b8fa8", textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        cursor: field ? "pointer" : "default",
                        userSelect: "none",
                        whiteSpace: "nowrap"
                      }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        {label}
                        {field && <SortIcon field={field} />}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{
                      padding: "48px", textAlign: "center",
                      color: "#8b8fa8", fontSize: "14px"
                    }}>
                      No customers found matching your filters.
                    </td>
                  </tr>
                ) : paginated.map((customer, i) => {
                  const config = statusConfig[customer.status];
                  const isSelected = selectedIds.has(customer.id);
                  return (
                    <tr key={customer.id}
                      style={{
                        borderBottom: i < paginated.length - 1 ? "1px solid #2a2d3e" : "none",
                        backgroundColor: isSelected ? "#6366f108" : "transparent",
                        transition: "background 0.1s ease"
                      }}>

                      {/* Checkbox */}
                      <td style={{ padding: "14px 16px" }}>
                        <input type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(customer.id)}
                          style={{ cursor: "pointer", accentColor: "#6366f1" }}
                        />
                      </td>

                      {/* Customer */}
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{
                            width: "32px", height: "32px", borderRadius: "50%",
                            backgroundColor: "#6366f130",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "12px", fontWeight: 700, color: "#6366f1", flexShrink: 0
                          }}>
                            {customer.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <div>
                            <p style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff" }}>
                              {customer.name}
                            </p>
                            <p style={{ fontSize: "11px", color: "#8b8fa8", marginTop: "2px" }}>
                              {customer.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Company */}
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <Building2 size={13} color="#8b8fa8" />
                          <span style={{ fontSize: "13px", color: "#ffffff" }}>
                            {customer.company}
                          </span>
                        </div>
                      </td>

                      {/* Industry */}
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{
                          fontSize: "11px", padding: "3px 8px", borderRadius: "4px",
                          backgroundColor: "#2a2d3e", color: "#8b8fa8", fontWeight: 500
                        }}>
                          {customer.industry}
                        </span>
                      </td>

                      {/* Total Spend */}
                      <td style={{
                        padding: "14px 16px", fontSize: "13px",
                        fontWeight: 700, color: "#ffffff"
                      }}>
                        {formatAmount(customer.totalSpend)}
                      </td>

                      {/* Transactions */}
                      <td style={{
                        padding: "14px 16px", fontSize: "13px", color: "#8b8fa8"
                      }}>
                        {customer.transactions}
                      </td>

                      {/* Status */}
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{
                          fontSize: "11px", fontWeight: 600,
                          padding: "4px 10px", borderRadius: "20px",
                          backgroundColor: config.bg, color: config.color
                        }}>
                          {config.label}
                        </span>
                      </td>

                      {/* Joined */}
                      <td style={{
                        padding: "14px 16px", fontSize: "12px", color: "#8b8fa8"
                      }}>
                        {customer.joinedAt}
                      </td>

                      {/* Last Active */}
                      <td style={{
                        padding: "14px 16px", fontSize: "12px", color: "#8b8fa8"
                      }}>
                        {customer.lastActivity}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div style={{
            padding: "14px 20px",
            borderTop: "1px solid #2a2d3e",
            display: "flex", alignItems: "center",
            justifyContent: "space-between", flexWrap: "wrap", gap: "10px"
          }}>

            {/* Page size */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "12px", color: "#8b8fa8" }}>Rows per page:</span>
              {PAGE_SIZE_OPTIONS.map(size => (
                <button key={size} onClick={() => { setPageSize(size); setPage(1); }}
                  style={{
                    padding: "4px 10px", borderRadius: "5px",
                    fontSize: "12px", cursor: "pointer", border: "1px solid",
                    borderColor: pageSize === size ? "#6366f1" : "#2a2d3e",
                    backgroundColor: pageSize === size ? "#6366f120" : "transparent",
                    color: pageSize === size ? "#6366f1" : "#8b8fa8",
                    fontWeight: pageSize === size ? 600 : 400,
                  }}>
                  {size}
                </button>
              ))}
            </div>

            {/* Page info + nav */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "12px", color: "#8b8fa8" }}>
                {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}
              </span>
              <div style={{ display: "flex", gap: "4px" }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    width: "30px", height: "30px", borderRadius: "6px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    backgroundColor: "#0f1117", border: "1px solid #2a2d3e",
                    cursor: page === 1 ? "not-allowed" : "pointer",
                    opacity: page === 1 ? 0.4 : 1,
                    color: "#ffffff"
                  }}>
                  <ChevronLeft size={14} />
                </button>

                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                  return (
                    <button key={pageNum} onClick={() => setPage(pageNum)}
                      style={{
                        width: "30px", height: "30px", borderRadius: "6px",
                        fontSize: "12px", fontWeight: 600, cursor: "pointer",
                        border: "1px solid",
                        borderColor: page === pageNum ? "#6366f1" : "#2a2d3e",
                        backgroundColor: page === pageNum ? "#6366f1" : "#0f1117",
                        color: page === pageNum ? "#ffffff" : "#8b8fa8",
                      }}>
                      {pageNum}
                    </button>
                  );
                })}

                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{
                    width: "30px", height: "30px", borderRadius: "6px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    backgroundColor: "#0f1117", border: "1px solid #2a2d3e",
                    cursor: page === totalPages ? "not-allowed" : "pointer",
                    opacity: page === totalPages ? 0.4 : 1,
                    color: "#ffffff"
                  }}>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}