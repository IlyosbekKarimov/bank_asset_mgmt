"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

interface Assignment {
    id: string; status: string; assignedAt: string; returnedAt: string | null; notes: string | null;
    asset: { name: string; assetTag: string; category: string };
    assignedToUser: { firstName: string; lastName: string; employeeId: string } | null;
    assignedByUser: { firstName: string; lastName: string };
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
    ACTIVE: { bg: "rgba(16,185,129,0.15)", text: "#34d399" },
    RETURNED: { bg: "rgba(59,130,246,0.15)", text: "#60a5fa" },
    TRANSFERRED: { bg: "rgba(245,158,11,0.15)", text: "#fbbf24" },
};

export default function AssignmentsPage() {
    const { data: assignments, isLoading } = useQuery<Assignment[]>({
        queryKey: ["assignments"],
        queryFn: async () => { const res = await fetch("/api/assignments"); return res.json(); },
    });

    return (
        <div>
            <div style={{ marginBottom: "24px" }}>
                <h1 style={{ fontSize: "24px", fontWeight: 700 }}>Assignments</h1>
                <p style={{ fontSize: "14px", color: "var(--text-tertiary)" }}>Track asset assignments to employees</p>
            </div>

            <div className="glass" style={{ borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid var(--border-secondary)" }}>
                            {["Asset", "Assigned To", "Assigned By", "Status", "Date", "Notes"].map((h) => (
                                <th key={h} style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left" }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? Array.from({ length: 3 }).map((_, i) => (
                            <tr key={i}><td colSpan={6} style={{ padding: "16px" }}><div className="skeleton" style={{ height: "20px" }} /></td></tr>
                        )) : assignments?.length === 0 ? (
                            <tr><td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>No assignments found</td></tr>
                        ) : assignments?.map((a) => (
                            <tr key={a.id} style={{ borderBottom: "1px solid var(--border-secondary)" }}
                                onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-card-hover)"}
                                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                                <td style={{ padding: "14px 16px" }}>
                                    <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>{a.asset.name}</p>
                                    <p style={{ fontSize: "11px", color: "var(--gold-400)", fontFamily: "monospace" }}>{a.asset.assetTag}</p>
                                </td>
                                <td style={{ padding: "14px 16px" }}>
                                    {a.assignedToUser ? (
                                        <>
                                            <p style={{ fontSize: "13px", color: "var(--text-primary)" }}>{a.assignedToUser.firstName} {a.assignedToUser.lastName}</p>
                                            <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{a.assignedToUser.employeeId}</p>
                                        </>
                                    ) : <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>—</span>}
                                </td>
                                <td style={{ padding: "14px 16px", fontSize: "13px", color: "var(--text-secondary)" }}>{a.assignedByUser.firstName} {a.assignedByUser.lastName}</td>
                                <td style={{ padding: "14px 16px" }}>
                                    <span style={{ padding: "3px 10px", borderRadius: "10px", fontSize: "11px", fontWeight: 600, background: STATUS_COLORS[a.status]?.bg || "rgba(100,116,139,0.15)", color: STATUS_COLORS[a.status]?.text || "#94a3b8" }}>{a.status}</span>
                                </td>
                                <td style={{ padding: "14px 16px", fontSize: "12px", color: "var(--text-secondary)" }}>{format(new Date(a.assignedAt), "MMM dd, yyyy")}</td>
                                <td style={{ padding: "14px 16px", fontSize: "12px", color: "var(--text-muted)" }}>{a.notes || "—"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
