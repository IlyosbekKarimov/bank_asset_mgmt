"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

const ROLES = ["SUPER_ADMIN", "ADMIN", "MANAGER", "EMPLOYEE", "AUDITOR"];
const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
    SUPER_ADMIN: { bg: "rgba(239,68,68,0.15)", text: "#f87171" },
    ADMIN: { bg: "rgba(245,158,11,0.15)", text: "#fbbf24" },
    MANAGER: { bg: "rgba(59,130,246,0.15)", text: "#60a5fa" },
    EMPLOYEE: { bg: "rgba(16,185,129,0.15)", text: "#34d399" },
    AUDITOR: { bg: "rgba(139,92,246,0.15)", text: "#a78bfa" },
};

interface User {
    id: string; email: string; employeeId: string;
    firstName: string; lastName: string; phone: string | null;
    position: string | null; role: string; isActive: boolean;
    lastLoginAt: string | null; createdAt: string;
    department: { name: string } | null;
    branch: { name: string } | null;
}

export default function UsersPage() {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [showCreate, setShowCreate] = useState(false);
    const canManage = ["SUPER_ADMIN", "ADMIN"].includes(session?.user?.role || "");

    const { data: users, isLoading } = useQuery<User[]>({
        queryKey: ["users", search],
        queryFn: async () => {
            const params = search ? `?search=${search}` : "";
            const res = await fetch(`/api/users${params}`);
            return res.json();
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data: Record<string, unknown>) => {
            const res = await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
            if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
            return res.json();
        },
        onSuccess: () => { toast.success("User created"); setShowCreate(false); queryClient.invalidateQueries({ queryKey: ["users"] }); },
        onError: (err: Error) => toast.error(err.message),
    });

    const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const d: Record<string, unknown> = {};
        fd.forEach((v, k) => { if (v) d[k] = v; });
        createMutation.mutate(d);
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                    <h1 style={{ fontSize: "24px", fontWeight: 700 }}>Users</h1>
                    <p style={{ fontSize: "14px", color: "var(--text-tertiary)" }}>Manage organizational users and access</p>
                </div>
                {canManage && (
                    <button onClick={() => setShowCreate(true)} style={{ padding: "10px 20px", background: "linear-gradient(135deg, var(--gold-500), var(--gold-600))", border: "none", borderRadius: "var(--radius-md)", color: "var(--navy-950)", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "8px" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        Add User
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="glass" style={{ borderRadius: "var(--radius-lg)", padding: "16px 20px", marginBottom: "16px" }}>
                <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)}
                    style={{ width: "100%", maxWidth: "400px", padding: "10px 12px", background: "var(--bg-input)", border: "1px solid var(--border-secondary)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", fontSize: "13px", outline: "none", fontFamily: "inherit" }} />
            </div>

            {/* Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
                {isLoading ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="skeleton" style={{ height: "160px", borderRadius: "var(--radius-lg)" }} />
                )) : users?.map((user) => (
                    <div key={user.id} className="glass" style={{ borderRadius: "var(--radius-lg)", padding: "20px", transition: "all var(--transition-fast)" }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--border-primary)"}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border-secondary)"}>
                        <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                            <div style={{ width: "44px", height: "44px", borderRadius: "var(--radius-md)", background: "linear-gradient(135deg, var(--gold-500), var(--gold-700))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: "var(--navy-950)", flexShrink: 0 }}>
                                {user.firstName[0]}{user.lastName[0]}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                    <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>{user.firstName} {user.lastName}</p>
                                    {!user.isActive && <span style={{ padding: "2px 6px", borderRadius: "6px", fontSize: "10px", background: "rgba(239,68,68,0.15)", color: "#f87171" }}>Inactive</span>}
                                </div>
                                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px" }}>{user.email}</p>
                                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                    <span style={{ padding: "3px 8px", borderRadius: "8px", fontSize: "11px", fontWeight: 600, background: ROLE_COLORS[user.role]?.bg, color: ROLE_COLORS[user.role]?.text }}>{user.role.replace("_", " ")}</span>
                                    {user.position && <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>{user.position}</span>}
                                </div>
                            </div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "14px", paddingTop: "12px", borderTop: "1px solid var(--border-secondary)" }}>
                            <div>
                                <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{user.department?.name || "No dept"} · {user.branch?.name || "No branch"}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>ID: {user.employeeId}</p>
                                {user.lastLoginAt && <p style={{ fontSize: "10px", color: "var(--text-muted)" }}>Last login: {format(new Date(user.lastLoginAt), "MMM dd")}</p>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Modal */}
            {showCreate && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
                    onClick={(e) => { if (e.target === e.currentTarget) setShowCreate(false); }}>
                    <div className="animate-scale-in" style={{ width: "100%", maxWidth: "500px", background: "var(--navy-800)", border: "1px solid var(--border-primary)", borderRadius: "var(--radius-xl)", overflow: "auto", maxHeight: "85vh" }}>
                        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-secondary)", display: "flex", justifyContent: "space-between" }}>
                            <h2 style={{ fontSize: "18px", fontWeight: 600 }}>Add New User</h2>
                            <button onClick={() => setShowCreate(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "20px" }}>×</button>
                        </div>
                        <form onSubmit={handleCreate} style={{ padding: "24px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                {[
                                    { name: "firstName", label: "First Name", required: true },
                                    { name: "lastName", label: "Last Name", required: true },
                                    { name: "email", label: "Email", required: true, type: "email", span: 2 },
                                    { name: "employeeId", label: "Employee ID", required: true },
                                    { name: "phone", label: "Phone" },
                                    { name: "position", label: "Position" },
                                    { name: "password", label: "Password", type: "password" },
                                ].map((f) => (
                                    <div key={f.name} style={{ gridColumn: (f as { span?: number }).span === 2 ? "1 / -1" : undefined }}>
                                        <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "6px" }}>
                                            {f.label} {f.required && <span style={{ color: "var(--red-400)" }}>*</span>}
                                        </label>
                                        <input name={f.name} type={f.type || "text"} required={f.required} style={{ width: "100%", padding: "10px 12px", background: "var(--bg-input)", border: "1px solid var(--border-secondary)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: "13px", outline: "none", fontFamily: "inherit" }} />
                                    </div>
                                ))}
                                <div>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "6px" }}>Role <span style={{ color: "var(--red-400)" }}>*</span></label>
                                    <select name="role" required style={{ width: "100%", padding: "10px 12px", background: "var(--bg-input)", border: "1px solid var(--border-secondary)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: "13px", fontFamily: "inherit", outline: "none" }}>
                                        {ROLES.map((r) => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px" }}>
                                <button type="button" onClick={() => setShowCreate(false)} style={{ padding: "10px 20px", background: "transparent", border: "1px solid var(--border-secondary)", borderRadius: "var(--radius-md)", color: "var(--text-secondary)", cursor: "pointer", fontSize: "13px", fontFamily: "inherit" }}>Cancel</button>
                                <button type="submit" disabled={createMutation.isPending} style={{ padding: "10px 20px", background: "linear-gradient(135deg, var(--gold-500), var(--gold-600))", border: "none", borderRadius: "var(--radius-md)", color: "var(--navy-950)", fontWeight: 600, cursor: "pointer", fontSize: "13px", fontFamily: "inherit" }}>{createMutation.isPending ? "Creating..." : "Create User"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
