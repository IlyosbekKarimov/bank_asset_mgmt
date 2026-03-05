"use client";

import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export default function ReportsPage() {
    const { data: dashboard } = useQuery({
        queryKey: ["dashboard"],
        queryFn: async () => { const res = await fetch("/api/dashboard"); return res.json(); },
    });

    const handleExport = async (type: string) => {
        try {
            if (type === "csv") {
                const res = await fetch("/api/assets?limit=1000");
                const data = await res.json();
                const headers = ["Name", "Asset Tag", "Serial Number", "Category", "Status", "Condition", "Purchase Price", "Current Value", "Location"];
                const rows = data.assets.map((a: Record<string, unknown>) => [
                    a.name, a.assetTag, a.serialNumber || "", a.category, a.status, a.condition,
                    a.purchasePrice || "", a.currentValue || "", a.location || "",
                ]);
                const csv = [headers.join(","), ...rows.map((r: string[]) => r.map((c: string) => `"${c}"`).join(","))].join("\n");
                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url; a.download = `assets_report_${new Date().toISOString().split("T")[0]}.csv`;
                a.click(); URL.revokeObjectURL(url);
                toast.success("CSV exported successfully");
            }
        } catch {
            toast.error("Export failed");
        }
    };

    const reports = [
        { title: "Asset Inventory Report", desc: "Complete list of all assets with current status, condition, and financial data", icon: "📊", action: () => handleExport("csv") },
        { title: "Depreciation Report", desc: "Asset value depreciation analysis from purchase to current value", icon: "📉", action: () => handleExport("csv") },
        { title: "Maintenance History", desc: "All maintenance records with costs, vendors, and completion status", icon: "🔧", action: () => toast.info("Coming soon") },
        { title: "Assignment Summary", desc: "Current and historical asset assignments by employee and department", icon: "👥", action: () => toast.info("Coming soon") },
        { title: "Warranty Status", desc: "Assets with warranty information and expiration alerts", icon: "🛡️", action: () => toast.info("Coming soon") },
        { title: "Audit Compliance", desc: "Full audit trail for regulatory compliance and internal review", icon: "✅", action: () => toast.info("Coming soon") },
    ];

    return (
        <div>
            <div style={{ marginBottom: "24px" }}>
                <h1 style={{ fontSize: "24px", fontWeight: 700 }}>Reports</h1>
                <p style={{ fontSize: "14px", color: "var(--text-tertiary)" }}>Generate and export organizational reports</p>
            </div>

            {/* Quick Stats */}
            {dashboard && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
                    <div className="glass" style={{ borderRadius: "var(--radius-lg)", padding: "20px" }}>
                        <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>Total Portfolio Value</p>
                        <p style={{ fontSize: "24px", fontWeight: 700, color: "var(--emerald-400)" }}>
                            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(dashboard.kpi.totalValue)}
                        </p>
                    </div>
                    <div className="glass" style={{ borderRadius: "var(--radius-lg)", padding: "20px" }}>
                        <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>Total Purchase Value</p>
                        <p style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)" }}>
                            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(dashboard.kpi.totalPurchaseValue)}
                        </p>
                    </div>
                    <div className="glass" style={{ borderRadius: "var(--radius-lg)", padding: "20px" }}>
                        <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>Total Depreciation</p>
                        <p style={{ fontSize: "24px", fontWeight: 700, color: "var(--red-400)" }}>
                            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(dashboard.kpi.totalPurchaseValue - dashboard.kpi.totalValue)}
                        </p>
                    </div>
                </div>
            )}

            {/* Report Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
                {reports.map((report) => (
                    <div key={report.title} className="glass" style={{ borderRadius: "var(--radius-lg)", padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div>
                            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "12px" }}>
                                <span style={{ fontSize: "28px" }}>{report.icon}</span>
                                <div>
                                    <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>{report.title}</h3>
                                    <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px", lineHeight: 1.4 }}>{report.desc}</p>
                                </div>
                            </div>
                        </div>
                        <button onClick={report.action}
                            style={{ marginTop: "16px", padding: "10px 16px", background: "var(--bg-input)", border: "1px solid var(--border-secondary)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", fontSize: "13px", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "all var(--transition-fast)" }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-card-hover)"; e.currentTarget.style.borderColor = "var(--border-primary)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-input)"; e.currentTarget.style.borderColor = "var(--border-secondary)"; }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                            Export Report
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
