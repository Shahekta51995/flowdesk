"use client";

import Header from "@/components/ui/Header";
import { useState, useEffect, useCallback } from "react";
import {
  Search, Download, ChevronLeft,
  ChevronRight, ChevronUp, ChevronDown,
  Building2,  TrendingUp,
  Users, UserCheck, UserX, ArrowUpDown,
  Loader2
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

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const statusConfig = {
  ACTIVE:   { color: "#10b981", bg: "#10b98120", label: "Active"   },
  INACTIVE: { color: "#f59e0b", bg: "#f59e0b20", label: "Inactive" },
  CHURNED:  { color: "#ef4444", bg: "#ef444420", label: "Churned"  },
};

const industries = ["FinTech", "SaaS", "Retail", "Logistics", "Healthcare", "EdTech"];
const PAGE_SIZE_OPTIONS = [10, 20, 50];
const formatAmount = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN")}`;

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
   const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [industryFilter, setIndustryFilter] = useState("ALL");
  const [sortField, setSortField] = useState<SortField>("totalSpend");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

   // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        sortField,
        sortDir,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(statusFilter !== "ALL" && { status: statusFilter }),
        ...(industryFilter !== "ALL" && { industry: industryFilter }),
      });

      const res = await fetch(`/api/customers?${params}`);
      const json = await res.json();

      if (json.success) {
        setCustomers(json.data);
        setPagination(json.pagination);
      }
    } catch (err) {
      console.error("Failed to fetch customers:", err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sortField, sortDir, debouncedSearch, statusFilter, industryFilter]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

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
     if (selectedIds.size === customers.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(customers.map((c:any) => c._id)));
  };

  // CSV Export
  const handleExport = async() => {
    const res  = await fetch(`/api/customers?limit=1000&sortField=${sortField}&sortDir=${sortDir}`);
    const json = await res.json();
    const rows = json.data.map((c: Customer) =>
      [c.id, c.name, c.email, c.company, c.industry,
       formatAmount(c.totalSpend), c.transactions, c.status,
       new Date(c.joinedAt).toLocaleDateString()].join(",")
    );
    const csv = ["ID,Name,Email,Company,Industry,Total Spend,Transactions,Status,Joined", ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = "customers.csv"; a.click();
  };

  // Stats
  const totalActive   = customers.filter(c => c.status === "ACTIVE").length;
  const totalInactive = customers.filter(c => c.status === "INACTIVE").length;
  const totalRevenue  = customers.reduce((a, c) => a + c.totalSpend, 0);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown size={12} color="#8b8fa8" />;
    return sortDir === "asc"
      ? <ChevronUp size={12} color="#6366f1" />
      : <ChevronDown size={12} color="#6366f1" />;
  };

  return (
     <div style={{ flex: 1, overflowY: "auto", backgroundColor: "#0f1117" }}>
      <Header title="Customers" subtitle="Live data from MongoDB — enterprise client base" />

      <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
          {[
            { label: "Total Clients",  value: pagination.total.toString(), icon: Users,     color: "#6366f1" },
            { label: "Active",         value: totalActive.toString(),      icon: UserCheck,  color: "#10b981" },
            { label: "Inactive",       value: totalInactive.toString(),    icon: UserX,      color: "#f59e0b" },
            { label: "Page Revenue",   value: formatAmount(totalRevenue),  icon: TrendingUp, color: "#10b981" },
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
                  onChange={e => setSearch(e.target.value)}
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
                  <button key={s}
                    onClick={() => { setStatusFilter(s); setPage(1); }}
                    style={{
                      padding: "6px 12px", borderRadius: "6px",
                      fontSize: "12px", fontWeight: 600, cursor: "pointer",
                      border: "1px solid",
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
                  color: "#ffffff", fontSize: "13px", cursor: "pointer", outline: "none"
                }}>
                <option value="ALL">All Industries</option>
                {industries.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {selectedIds.size > 0 && (
                <span style={{ fontSize: "12px", color: "#6366f1", fontWeight: 600 }}>
                  {selectedIds.size} selected
                </span>
              )}

              {/* Live DB badge */}
              <span style={{
                fontSize: "11px", padding: "3px 8px", borderRadius: "20px",
                backgroundColor: "#10b98120", color: "#10b981",
                fontWeight: 600, border: "1px solid #10b98130"
              }}>
                ● LIVE MongoDB
              </span>

              <span style={{ fontSize: "12px", color: "#8b8fa8" }}>
                {pagination.total} results
              </span>
              <button onClick={handleExport}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "7px 14px", borderRadius: "8px",
                  backgroundColor: "#6366f120", border: "1px solid #6366f140",
                  color: "#6366f1", fontSize: "12px", fontWeight: 600, cursor: "pointer"
                }}>
                <Download size={13} />
                Export CSV
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div style={{
              padding: "64px", display: "flex",
              alignItems: "center", justifyContent: "center", gap: "12px"
            }}>
              <Loader2 size={20} color="#6366f1"
                style={{ animation: "spin 1s linear infinite" }} />
              <span style={{ color: "#8b8fa8", fontSize: "14px" }}>
                Loading from MongoDB...
              </span>
              <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : (
            <>
              {/* Table */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #2a2d3e" }}>
                      <th style={{ padding: "12px 16px", width: "40px" }}>
                        <input type="checkbox"
                          checked={selectedIds.size === customers.length && customers.length > 0}
                          onChange={toggleAll}
                          style={{ cursor: "pointer", accentColor: "#6366f1" }}
                        />
                      </th>
                      {[
                        { label: "Customer",     field: "name"        as SortField },
                        { label: "Company",      field: "company"     as SortField },
                        { label: "Industry",     field: null },
                        { label: "Total Spend",  field: "totalSpend"  as SortField },
                        { label: "Transactions", field: null },
                        { label: "Status",       field: "status"      as SortField },
                        { label: "Joined",       field: "joinedAt"    as SortField },
                      ].map(({ label, field }) => (
                        <th key={label}
                          onClick={() => field && handleSort(field)}
                          style={{
                            textAlign: "left", padding: "12px 16px",
                            fontSize: "11px", fontWeight: 600,
                            color: "#8b8fa8", textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            cursor: field ? "pointer" : "default",
                            userSelect: "none", whiteSpace: "nowrap"
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
                    {customers.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{
                          padding: "48px", textAlign: "center",
                          color: "#8b8fa8", fontSize: "14px"
                        }}>
                          No customers found.
                        </td>
                      </tr>
                    ) : customers.map((customer, i) => {
                      const config = statusConfig[customer.status];
                      const isSelected = selectedIds.has(customer.id);
                      return (
                        <tr key={customer.id} style={{
                          borderBottom: i < customers.length - 1
                            ? "1px solid #2a2d3e" : "none",
                          backgroundColor: isSelected ? "#6366f108" : "transparent",
                        }}>
                          <td style={{ padding: "14px 16px" }}>
                            <input type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(customer.id)}
                              style={{ cursor: "pointer", accentColor: "#6366f1" }}
                            />
                          </td>
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
                          <td style={{ padding: "14px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <Building2 size={13} color="#8b8fa8" />
                              <span style={{ fontSize: "13px", color: "#ffffff" }}>
                                {customer.company}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            <span style={{
                              fontSize: "11px", padding: "3px 8px", borderRadius: "4px",
                              backgroundColor: "#2a2d3e", color: "#8b8fa8", fontWeight: 500
                            }}>
                              {customer.industry}
                            </span>
                          </td>
                          <td style={{
                            padding: "14px 16px", fontSize: "13px",
                            fontWeight: 700, color: "#ffffff"
                          }}>
                            {formatAmount(customer.totalSpend)}
                          </td>
                          <td style={{ padding: "14px 16px", fontSize: "13px", color: "#8b8fa8" }}>
                            {customer.transactions}
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            <span style={{
                              fontSize: "11px", fontWeight: 600,
                              padding: "4px 10px", borderRadius: "20px",
                              backgroundColor: config.bg, color: config.color
                            }}>
                              {config.label}
                            </span>
                          </td>
                          <td style={{ padding: "14px 16px", fontSize: "12px", color: "#8b8fa8" }}>
                            {new Date(customer.joinedAt).toLocaleDateString("en-IN")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div style={{
                padding: "14px 20px", borderTop: "1px solid #2a2d3e",
                display: "flex", alignItems: "center",
                justifyContent: "space-between", flexWrap: "wrap", gap: "10px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "12px", color: "#8b8fa8" }}>Rows per page:</span>
                  {PAGE_SIZE_OPTIONS.map(size => (
                    <button key={size}
                      onClick={() => { setPageSize(size); setPage(1); }}
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

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "12px", color: "#8b8fa8" }}>
                    {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, pagination.total)} of {pagination.total}
                  </span>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <button onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      style={{
                        width: "30px", height: "30px", borderRadius: "6px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        backgroundColor: "#0f1117", border: "1px solid #2a2d3e",
                        cursor: page === 1 ? "not-allowed" : "pointer",
                        opacity: page === 1 ? 0.4 : 1, color: "#ffffff"
                      }}>
                      <ChevronLeft size={14} />
                    </button>

                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(page - 2, pagination.totalPages - 4)) + i;
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

                    <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                      disabled={page === pagination.totalPages}
                      style={{
                        width: "30px", height: "30px", borderRadius: "6px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        backgroundColor: "#0f1117", border: "1px solid #2a2d3e",
                        cursor: page === pagination.totalPages ? "not-allowed" : "pointer",
                        opacity: page === pagination.totalPages ? 0.4 : 1, color: "#ffffff"
                      }}>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}