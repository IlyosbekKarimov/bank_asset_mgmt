"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { format } from "date-fns";

const ACTIONS = ["CREATE", "UPDATE", "DELETE", "ASSIGN", "RETURN", "STATUS_CHANGE", "MAINTENANCE_ADD", "LOGIN", "LOGOUT", "FAILED_LOGIN", "EXPORT_DATA"];
const ACTION_ICONS: Record<string, string> = { CREATE: "🆕", UPDATE: "✏️", DELETE: "🗑️", ASSIGN: "👤", RETURN: "↩️", STATUS_CHANGE: "🔄", MAINTENANCE_ADD: "🔧", LOGIN: "🔑", LOGOUT: "🚪", FAILED_LOGIN: "🚫", EXPORT_DATA: "📤" };
const ROLE_COLORS: Record<string, string> = { SUPER_ADMIN: "#f87171", ADMIN: "#fbbf24", MANAGER: "#60a5fa", EMPLOYEE: "#34d399", AUDITOR: "#a78bfa" };

interface AuditLog {
    id: string; action: string; entityType: string; entityId: string;
    changes: string | null; ipAddress: string | null; createdAt: string;
    user: { firstName: string; lastName: string; email: string; role: string };
}

export default function AuditPage() {
    const [action, setAction] = useState("");
    const [page, setPage] = useState(1);

    const { data, isLoading } = useQuery<{ logs: AuditLog[]; pagination: { total: number; totalPages: number } }>({
        queryKey: ["audit", action, page],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (action) params.set("action", action);
            params.set("page", page.toString());
            const res = await fetch(`/api/audit?${params}`);
            return res.json();
        },
    });

    return (
        <div>
            <div style={{ marginBottom: "24px" }}>
                <h1 style={{ fontSize: "24px", fontWeight: 700 }}>Audit Log</h1>
                <p style={{ fontSize: "14px", color: "var(--text-tertiary)" }}>Complete audit trail of all system actions</p>
            </div>

            {/* Filters */}
            <div className="glass" style={{ borderRadius: "var(--radius-lg)", padding: "16px 20px", marginBottom: "16px" }}>
                <select value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }}
                    style={{ padding: "10px 12px", background: "var(--bg-input)", border: "1px solid var(--border-secondary)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", fontSize: "13px", fontFamily: "inherit", outline: "none" }}>
                    <option value="">All Actions</option>
                    {ACTIONS.map((a) => <option key={a} value={a}>{a.replace("_", " ")}</option>)}
                </select>
                {data?.pagination && (
                    <span style={{ marginLeft: "16px", fontSize: "13px", color: "var(--text-muted)" }}>{data.pagination.total} total entries</span>
                )}
            </div>

            {/* Log Entries */}
            <div className="glass" style={{ borderRadius: "var(--radius-lg)", padding: "8px" }}>
                {isLoading ? Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} style={{ padding: "12px 16px" }}><div className="skeleton" style={{ height: "20px" }} /></div>
                )) : data?.logs?.length === 0 ? (
                    <p style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>No audit logs found</p>
                ) : data?.logs?.map((log) => (
                    <div key={log.id} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 16px", borderRadius: "var(--radius-sm)", transition: "background var(--transition-fast)" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-card-hover)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                        <span style={{ fontSize: "18px", width: "28px", textAlign: "center" }}>{ACTION_ICONS[log.action] || "📋"}</span>
                        <div style={{ width: "140px", flexShrink: 0 }}>
                            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{format(new Date(log.createdAt), "MMM dd, HH:mm:ss")}</p>
                        </div>
                        <div style={{ width: "160px", flexShrink: 0 }}>
                            <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>{log.user.firstName} {log.user.lastName}</p>
                            <p style={{ fontSize: "11px", color: ROLE_COLORS[log.user.role] || "var(--text-muted)" }}>{log.user.role.replace("_", " ")}</p>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ fontSize: "12px", color: "var(--text-muted)", marginRight: "8px" }}>[{log.action}]</span>
                            <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{log.changes || `${log.entityType} ${log.entityId.substring(0, 8)}...`}</span>
                        </div>
                        {log.ipAddress && <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "monospace" }}>{log.ipAddress}</span>}
                    </div>
                ))}

                {data?.pagination && data.pagination.totalPages > 1 && (
                    <div style={{ display: "flex", justifyContent: "center", gap: "8px", padding: "12px", borderTop: "1px solid var(--border-secondary)" }}>
                        <button disabled={page <= 1} onClick={() => setPage(page - 1)} style={{ padding: "6px 12px", background: "var(--bg-input)", border: "1px solid var(--border-secondary)", borderRadius: "var(--radius-sm)", color: "var(--text-secondary)", cursor: page <= 1 ? "not-allowed" : "pointer", fontSize: "12px", fontFamily: "inherit", opacity: page <= 1 ? 0.5 : 1 }}>Previous</button>
                        <span style={{ padding: "6px 12px", fontSize: "12px", color: "var(--text-muted)" }}>Page {page} of {data.pagination.totalPages}</span>
                        <button disabled={page >= data.pagination.totalPages} onClick={() => setPage(page + 1)} style={{ padding: "6px 12px", background: "var(--bg-input)", border: "1px solid var(--border-secondary)", borderRadius: "var(--radius-sm)", color: "var(--text-secondary)", cursor: page >= data.pagination.totalPages ? "not-allowed" : "pointer", fontSize: "12px", fontFamily: "inherit", opacity: page >= data.pagination.totalPages ? 0.5 : 1 }}>Next</button>
                    </div>
                )}
            </div>
        </div>
    );
}
