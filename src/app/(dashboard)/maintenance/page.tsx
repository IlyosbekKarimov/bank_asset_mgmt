"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

interface MaintenanceRecord {
    id: string; maintenanceType: string; description: string; status: string;
    performedAt: string; completedAt: string | null; cost: number | null;
    vendor: string | null; notes: string | null;
    asset: { name: string; assetTag: string };
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
    SCHEDULED: { bg: "rgba(59,130,246,0.15)", text: "#60a5fa" },
    IN_PROGRESS: { bg: "rgba(245,158,11,0.15)", text: "#fbbf24" },
    COMPLETED: { bg: "rgba(16,185,129,0.15)", text: "#34d399" },
    CANCELLED: { bg: "rgba(100,116,139,0.15)", text: "#94a3b8" },
};

function formatCurrency(v: number | null) {
    if (!v) return "—";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(v);
}

export default function MaintenancePage() {
    const { data: records, isLoading } = useQuery<MaintenanceRecord[]>({
        queryKey: ["maintenance"],
        queryFn: async () => { const res = await fetch("/api/maintenance"); return res.json(); },
    });

    return (
        <div>
            <div style={{ marginBottom: "24px" }}>
                <h1 style={{ fontSize: "24px", fontWeight: 700 }}>Maintenance</h1>
                <p style={{ fontSize: "14px", color: "var(--text-tertiary)" }}>Track asset maintenance and repairs</p>
            </div>

            <div className="glass" style={{ borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid var(--border-secondary)" }}>
                            {["Asset", "Type", "Description", "Status", "Cost", "Date", "Vendor"].map((h) => (
                                <th key={h} style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left" }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? Array.from({ length: 3 }).map((_, i) => (
                            <tr key={i}><td colSpan={7} style={{ padding: "16px" }}><div className="skeleton" style={{ height: "20px" }} /></td></tr>
                        )) : records?.length === 0 ? (
                            <tr><td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>No maintenance records</td></tr>
                        ) : records?.map((r) => (
                            <tr key={r.id} style={{ borderBottom: "1px solid var(--border-secondary)" }}
                                onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-card-hover)"}
                                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                                <td style={{ padding: "14px 16px" }}>
                                    <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>{r.asset.name}</p>
                                    <p style={{ fontSize: "11px", color: "var(--gold-400)", fontFamily: "monospace" }}>{r.asset.assetTag}</p>
                                </td>
                                <td style={{ padding: "14px 16px", fontSize: "13px", color: "var(--text-secondary)" }}>{r.maintenanceType.replace("_", " ")}</td>
                                <td style={{ padding: "14px 16px", fontSize: "13px", color: "var(--text-secondary)", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.description}</td>
                                <td style={{ padding: "14px 16px" }}>
                                    <span style={{ padding: "3px 10px", borderRadius: "10px", fontSize: "11px", fontWeight: 600, background: STATUS_COLORS[r.status]?.bg, color: STATUS_COLORS[r.status]?.text }}>{r.status.replace("_", " ")}</span>
                                </td>
                                <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>{formatCurrency(r.cost)}</td>
                                <td style={{ padding: "14px 16px", fontSize: "12px", color: "var(--text-secondary)" }}>{format(new Date(r.performedAt), "MMM dd, yyyy")}</td>
                                <td style={{ padding: "14px 16px", fontSize: "12px", color: "var(--text-muted)" }}>{r.vendor || "—"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
