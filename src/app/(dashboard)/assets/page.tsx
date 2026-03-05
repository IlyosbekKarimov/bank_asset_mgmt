"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

const CATEGORIES = ["IT", "OFFICE", "SECURITY", "FURNITURE", "VEHICLE", "NETWORK", "SERVER", "PRINTER", "TERMINAL", "OTHER"];
const STATUSES = ["REGISTERED", "ASSIGNED", "IN_REPAIR", "LOST", "WRITTEN_OFF", "IN_TRANSIT", "PENDING_APPROVAL"];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
    REGISTERED: { bg: "rgba(59,130,246,0.15)", text: "#60a5fa" },
    ASSIGNED: { bg: "rgba(16,185,129,0.15)", text: "#34d399" },
    IN_REPAIR: { bg: "rgba(245,158,11,0.15)", text: "#fbbf24" },
    LOST: { bg: "rgba(239,68,68,0.15)", text: "#f87171" },
    WRITTEN_OFF: { bg: "rgba(100,116,139,0.15)", text: "#94a3b8" },
    IN_TRANSIT: { bg: "rgba(6,182,212,0.15)", text: "#22d3ee" },
    PENDING_APPROVAL: { bg: "rgba(139,92,246,0.15)", text: "#a78bfa" },
};

const CONDITION_COLORS: Record<string, { bg: string; text: string }> = {
    NEW: { bg: "rgba(16,185,129,0.15)", text: "#34d399" },
    GOOD: { bg: "rgba(59,130,246,0.15)", text: "#60a5fa" },
    FAIR: { bg: "rgba(245,158,11,0.15)", text: "#fbbf24" },
    POOR: { bg: "rgba(249,115,22,0.15)", text: "#fb923c" },
    DAMAGED: { bg: "rgba(239,68,68,0.15)", text: "#f87171" },
    FOR_REPAIR: { bg: "rgba(239,68,68,0.15)", text: "#f87171" },
};

function formatCurrency(v: number | null) {
    if (!v) return "—";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(v);
}

interface Asset {
    id: string;
    name: string;
    assetTag: string;
    serialNumber: string | null;
    category: string;
    brand: string | null;
    model: string | null;
    status: string;
    condition: string;
    currentValue: number | null;
    purchasePrice: number | null;
    location: string | null;
    branch: { name: string; code: string } | null;
    department: { name: string } | null;
    createdAt: string;
}

export default function AssetsPage() {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [showCreate, setShowCreate] = useState(false);

    const canManage = ["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(session?.user?.role || "");

    const { data, isLoading } = useQuery({
        queryKey: ["assets", search, category, status, page],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (search) params.set("search", search);
            if (category) params.set("category", category);
            if (status) params.set("status", status);
            params.set("page", page.toString());
            const res = await fetch(`/api/assets?${params}`);
            return res.json();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/assets/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete");
        },
        onSuccess: () => {
            toast.success("Asset deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["assets"] });
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data: Record<string, unknown>) => {
            const res = await fetch("/api/assets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
            return res.json();
        },
        onSuccess: () => {
            toast.success("Asset created successfully");
            setShowCreate(false);
            queryClient.invalidateQueries({ queryKey: ["assets"] });
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const d: Record<string, unknown> = {};
        fd.forEach((v, k) => { if (v) d[k] = v; });
        if (d.purchasePrice) d.purchasePrice = parseFloat(d.purchasePrice as string);
        if (d.currentValue) d.currentValue = parseFloat(d.currentValue as string);
        if (d.purchaseDate) d.purchaseDate = new Date(d.purchaseDate as string).toISOString();
        if (d.warrantyUntil) d.warrantyUntil = new Date(d.warrantyUntil as string).toISOString();
        createMutation.mutate(d);
    };

    return (
        <div>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                    <h1 style={{ fontSize: "24px", fontWeight: 700 }}>Assets</h1>
                    <p style={{ fontSize: "14px", color: "var(--text-tertiary)" }}>
                        Manage all organizational assets
                    </p>
                </div>
                {canManage && (
                    <button
                        onClick={() => setShowCreate(true)}
                        style={{
                            padding: "10px 20px",
                            background: "linear-gradient(135deg, var(--gold-500), var(--gold-600))",
                            border: "none",
                            borderRadius: "var(--radius-md)",
                            color: "var(--navy-950)",
                            fontSize: "13px",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontFamily: "inherit",
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        Add Asset
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="glass" style={{
                borderRadius: "var(--radius-lg)",
                padding: "16px 20px",
                marginBottom: "16px",
                display: "flex",
                gap: "12px",
                alignItems: "center",
                flexWrap: "wrap",
            }}>
                <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}>
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search assets..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        style={{
                            width: "100%", padding: "10px 12px 10px 38px", background: "var(--bg-input)",
                            border: "1px solid var(--border-secondary)", borderRadius: "var(--radius-md)",
                            color: "var(--text-primary)", fontSize: "13px", outline: "none", fontFamily: "inherit",
                        }}
                    />
                </div>
                <select
                    value={category}
                    onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                    style={{
                        padding: "10px 12px", background: "var(--bg-input)", border: "1px solid var(--border-secondary)",
                        borderRadius: "var(--radius-md)", color: "var(--text-primary)", fontSize: "13px", fontFamily: "inherit", outline: "none",
                    }}
                >
                    <option value="">All Categories</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select
                    value={status}
                    onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                    style={{
                        padding: "10px 12px", background: "var(--bg-input)", border: "1px solid var(--border-secondary)",
                        borderRadius: "var(--radius-md)", color: "var(--text-primary)", fontSize: "13px", fontFamily: "inherit", outline: "none",
                    }}
                >
                    <option value="">All Statuses</option>
                    {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                </select>
            </div>

            {/* Table */}
            <div className="glass" style={{ borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid var(--border-secondary)" }}>
                                {["Asset", "Tag / Serial", "Category", "Status", "Condition", "Value", "Location", ""].map((h) => (
                                    <th key={h} style={{
                                        padding: "12px 16px", fontSize: "11px", fontWeight: 600, color: "var(--text-muted)",
                                        textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left",
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}><td colSpan={8} style={{ padding: "16px" }}>
                                        <div className="skeleton" style={{ height: "20px", borderRadius: "4px" }} />
                                    </td></tr>
                                ))
                            ) : data?.assets?.length === 0 ? (
                                <tr><td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                                    No assets found
                                </td></tr>
                            ) : (
                                data?.assets?.map((asset: Asset) => (
                                    <tr key={asset.id} style={{ borderBottom: "1px solid var(--border-secondary)", transition: "background var(--transition-fast)" }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-card-hover)"}
                                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                    >
                                        <td style={{ padding: "14px 16px" }}>
                                            <Link href={`/assets/${asset.id}`} style={{ textDecoration: "none", color: "var(--text-primary)", fontWeight: 500, fontSize: "13px" }}>
                                                {asset.name}
                                            </Link>
                                            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                                                {asset.brand} {asset.model}
                                            </p>
                                        </td>
                                        <td style={{ padding: "14px 16px" }}>
                                            <span style={{ fontSize: "13px", color: "var(--gold-400)", fontFamily: "monospace" }}>{asset.assetTag}</span>
                                            {asset.serialNumber && <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{asset.serialNumber}</p>}
                                        </td>
                                        <td style={{ padding: "14px 16px", fontSize: "13px", color: "var(--text-secondary)" }}>{asset.category}</td>
                                        <td style={{ padding: "14px 16px" }}>
                                            <span style={{
                                                padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: 600,
                                                background: STATUS_COLORS[asset.status]?.bg, color: STATUS_COLORS[asset.status]?.text,
                                            }}>{asset.status.replace("_", " ")}</span>
                                        </td>
                                        <td style={{ padding: "14px 16px" }}>
                                            <span style={{
                                                padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: 500,
                                                background: CONDITION_COLORS[asset.condition]?.bg, color: CONDITION_COLORS[asset.condition]?.text,
                                            }}>{asset.condition.replace("_", " ")}</span>
                                        </td>
                                        <td style={{ padding: "14px 16px", fontSize: "13px", color: "var(--text-primary)", fontWeight: 500 }}>
                                            {formatCurrency(asset.currentValue)}
                                        </td>
                                        <td style={{ padding: "14px 16px", fontSize: "12px", color: "var(--text-secondary)" }}>
                                            {asset.location || "—"}
                                            {asset.department && <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>{asset.department.name}</p>}
                                        </td>
                                        <td style={{ padding: "14px 16px" }}>
                                            <div style={{ display: "flex", gap: "4px" }}>
                                                <Link href={`/assets/${asset.id}`} style={{
                                                    padding: "6px", borderRadius: "var(--radius-sm)", color: "var(--text-tertiary)",
                                                    display: "flex", textDecoration: "none", transition: "all var(--transition-fast)",
                                                }}>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                                </Link>
                                                {canManage && (
                                                    <button onClick={() => { if (confirm("Delete this asset?")) deleteMutation.mutate(asset.id); }}
                                                        style={{
                                                            padding: "6px", borderRadius: "var(--radius-sm)", background: "transparent",
                                                            border: "none", color: "var(--text-tertiary)", cursor: "pointer", display: "flex",
                                                        }}>
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {data?.pagination && data.pagination.totalPages > 1 && (
                    <div style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "12px 16px", borderTop: "1px solid var(--border-secondary)",
                    }}>
                        <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                            Showing {((page - 1) * 20) + 1}–{Math.min(page * 20, data.pagination.total)} of {data.pagination.total}
                        </span>
                        <div style={{ display: "flex", gap: "8px" }}>
                            <button disabled={page <= 1} onClick={() => setPage(page - 1)}
                                style={{ padding: "6px 12px", background: "var(--bg-input)", border: "1px solid var(--border-secondary)", borderRadius: "var(--radius-sm)", color: "var(--text-secondary)", cursor: page <= 1 ? "not-allowed" : "pointer", fontSize: "12px", fontFamily: "inherit", opacity: page <= 1 ? 0.5 : 1 }}>
                                Previous
                            </button>
                            <button disabled={page >= data.pagination.totalPages} onClick={() => setPage(page + 1)}
                                style={{ padding: "6px 12px", background: "var(--bg-input)", border: "1px solid var(--border-secondary)", borderRadius: "var(--radius-sm)", color: "var(--text-secondary)", cursor: page >= data.pagination.totalPages ? "not-allowed" : "pointer", fontSize: "12px", fontFamily: "inherit", opacity: page >= data.pagination.totalPages ? 0.5 : 1 }}>
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showCreate && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
                    onClick={(e) => { if (e.target === e.currentTarget) setShowCreate(false); }}>
                    <div className="animate-scale-in" style={{ width: "100%", maxWidth: "600px", maxHeight: "85vh", background: "var(--navy-800)", border: "1px solid var(--border-primary)", borderRadius: "var(--radius-xl)", overflow: "auto" }}>
                        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-secondary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h2 style={{ fontSize: "18px", fontWeight: 600 }}>Add New Asset</h2>
                            <button onClick={() => setShowCreate(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "20px" }}>×</button>
                        </div>
                        <form onSubmit={handleCreate} style={{ padding: "24px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                {[
                                    { name: "name", label: "Asset Name", required: true, span: 2 },
                                    { name: "assetTag", label: "Asset Tag", required: true, placeholder: "AST-XX-00000" },
                                    { name: "serialNumber", label: "Serial Number" },
                                    { name: "brand", label: "Brand" },
                                    { name: "model", label: "Model" },
                                    { name: "vendor", label: "Vendor" },
                                    { name: "invoiceNumber", label: "Invoice Number" },
                                    { name: "purchasePrice", label: "Purchase Price", type: "number" },
                                    { name: "currentValue", label: "Current Value", type: "number" },
                                    { name: "purchaseDate", label: "Purchase Date", type: "date" },
                                    { name: "warrantyUntil", label: "Warranty Until", type: "date" },
                                    { name: "location", label: "Location" },
                                    { name: "floor", label: "Floor" },
                                    { name: "room", label: "Room" },
                                    { name: "subCategory", label: "Sub Category" },
                                ].map((f) => (
                                    <div key={f.name} style={{ gridColumn: f.span === 2 ? "1 / -1" : undefined }}>
                                        <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "6px" }}>
                                            {f.label} {f.required && <span style={{ color: "var(--red-400)" }}>*</span>}
                                        </label>
                                        <input name={f.name} type={f.type || "text"} required={f.required} placeholder={f.placeholder || ""}
                                            style={{
                                                width: "100%", padding: "10px 12px", background: "var(--bg-input)", border: "1px solid var(--border-secondary)",
                                                borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: "13px", outline: "none", fontFamily: "inherit",
                                            }} />
                                    </div>
                                ))}
                                {/* Category Select */}
                                <div>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "6px" }}>
                                        Category <span style={{ color: "var(--red-400)" }}>*</span>
                                    </label>
                                    <select name="category" required style={{
                                        width: "100%", padding: "10px 12px", background: "var(--bg-input)", border: "1px solid var(--border-secondary)",
                                        borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: "13px", fontFamily: "inherit", outline: "none",
                                    }}>
                                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                {/* Description */}
                                <div style={{ gridColumn: "1 / -1" }}>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "6px" }}>Description</label>
                                    <textarea name="description" rows={3} style={{
                                        width: "100%", padding: "10px 12px", background: "var(--bg-input)", border: "1px solid var(--border-secondary)",
                                        borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: "13px", outline: "none", fontFamily: "inherit", resize: "vertical",
                                    }} />
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px" }}>
                                <button type="button" onClick={() => setShowCreate(false)}
                                    style={{ padding: "10px 20px", background: "transparent", border: "1px solid var(--border-secondary)", borderRadius: "var(--radius-md)", color: "var(--text-secondary)", cursor: "pointer", fontSize: "13px", fontFamily: "inherit" }}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={createMutation.isPending}
                                    style={{
                                        padding: "10px 20px", background: "linear-gradient(135deg, var(--gold-500), var(--gold-600))",
                                        border: "none", borderRadius: "var(--radius-md)", color: "var(--navy-950)", fontWeight: 600, cursor: "pointer", fontSize: "13px", fontFamily: "inherit",
                                    }}>
                                    {createMutation.isPending ? "Creating..." : "Create Asset"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
