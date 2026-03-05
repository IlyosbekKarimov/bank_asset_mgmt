"use client";

import { useQuery } from "@tanstack/react-query";

interface Dept {
    id: string; name: string; code: string | null; budget: number | null;
    branch: { name: string } | null;
    _count: { users: number; assets: number };
}

function formatCurrency(v: number | null) {
    if (!v) return "—";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(v);
}

export default function DepartmentsPage() {
    const { data: departments, isLoading } = useQuery<Dept[]>({
        queryKey: ["departments"],
        queryFn: async () => { const res = await fetch("/api/departments"); return res.json(); },
    });

    return (
        <div>
            <div style={{ marginBottom: "24px" }}>
                <h1 style={{ fontSize: "24px", fontWeight: 700 }}>Departments</h1>
                <p style={{ fontSize: "14px", color: "var(--text-tertiary)" }}>Organization department structure</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
                {isLoading ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="skeleton" style={{ height: "160px", borderRadius: "var(--radius-lg)" }} />
                )) : departments?.map((dept) => (
                    <div key={dept.id} className="glass" style={{ borderRadius: "var(--radius-lg)", padding: "20px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                            <div>
                                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)" }}>{dept.name}</h3>
                                {dept.code && <p style={{ fontSize: "12px", color: "var(--gold-400)", fontFamily: "monospace", marginTop: "2px" }}>{dept.code}</p>}
                            </div>
                            <div style={{ width: "38px", height: "38px", borderRadius: "var(--radius-md)", background: "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#60a5fa" }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 21h18" /><path d="M5 21V7l7-4 7 4v14" /><path d="M9 21v-4h6v4" /></svg>
                            </div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                            <div>
                                <p style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)" }}>{dept._count.users}</p>
                                <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>Users</p>
                            </div>
                            <div>
                                <p style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)" }}>{dept._count.assets}</p>
                                <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>Assets</p>
                            </div>
                            <div>
                                <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--emerald-400)" }}>{formatCurrency(dept.budget)}</p>
                                <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>Budget</p>
                            </div>
                        </div>
                        {dept.branch && (
                            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--border-secondary)" }}>
                                📍 {dept.branch.name}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
