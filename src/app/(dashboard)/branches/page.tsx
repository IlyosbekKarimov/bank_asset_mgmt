"use client";

import { useQuery } from "@tanstack/react-query";

interface Branch {
    id: string; name: string; code: string | null; address: string | null; phone: string | null;
    _count: { departments: number; users: number; assets: number };
}

export default function BranchesPage() {
    const { data: branches, isLoading } = useQuery<Branch[]>({
        queryKey: ["branches"],
        queryFn: async () => { const res = await fetch("/api/branches"); return res.json(); },
    });

    return (
        <div>
            <div style={{ marginBottom: "24px" }}>
                <h1 style={{ fontSize: "24px", fontWeight: 700 }}>Branches</h1>
                <p style={{ fontSize: "14px", color: "var(--text-tertiary)" }}>Organization branch locations</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "16px" }}>
                {isLoading ? Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="skeleton" style={{ height: "180px", borderRadius: "var(--radius-lg)" }} />
                )) : branches?.map((branch) => (
                    <div key={branch.id} className="glass" style={{ borderRadius: "var(--radius-lg)", padding: "24px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                            <div>
                                <h3 style={{ fontSize: "18px", fontWeight: 600, color: "var(--text-primary)" }}>{branch.name}</h3>
                                {branch.code && <p style={{ fontSize: "12px", color: "var(--gold-400)", fontFamily: "monospace", marginTop: "2px" }}>{branch.code}</p>}
                            </div>
                            <div style={{ width: "42px", height: "42px", borderRadius: "var(--radius-md)", background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#34d399" }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                            </div>
                        </div>
                        {branch.address && <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "4px" }}>📍 {branch.address}</p>}
                        {branch.phone && <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px" }}>📞 {branch.phone}</p>}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", paddingTop: "16px", borderTop: "1px solid var(--border-secondary)" }}>
                            <div>
                                <p style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)" }}>{branch._count.departments}</p>
                                <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>Departments</p>
                            </div>
                            <div>
                                <p style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)" }}>{branch._count.users}</p>
                                <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>Users</p>
                            </div>
                            <div>
                                <p style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)" }}>{branch._count.assets}</p>
                                <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>Assets</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
