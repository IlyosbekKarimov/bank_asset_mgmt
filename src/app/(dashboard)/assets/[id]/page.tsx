"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { format } from "date-fns";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
    REGISTERED: { bg: "rgba(59,130,246,0.15)", text: "#60a5fa" },
    ASSIGNED: { bg: "rgba(16,185,129,0.15)", text: "#34d399" },
    IN_REPAIR: { bg: "rgba(245,158,11,0.15)", text: "#fbbf24" },
    LOST: { bg: "rgba(239,68,68,0.15)", text: "#f87171" },
    WRITTEN_OFF: { bg: "rgba(100,116,139,0.15)", text: "#94a3b8" },
    IN_TRANSIT: { bg: "rgba(6,182,212,0.15)", text: "#22d3ee" },
    PENDING_APPROVAL: { bg: "rgba(139,92,246,0.15)", text: "#a78bfa" },
};

function formatCurrency(v: number | null) {
    if (!v) return "—";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(v);
}

function formatDate(d: string | null) {
    if (!d) return "—";
    return format(new Date(d), "MMM dd, yyyy");
}

interface AssetDetail {
    id: string; name: string; description: string | null; assetTag: string; serialNumber: string | null;
    category: string; subCategory: string | null; brand: string | null; model: string | null;
    purchaseDate: string | null; purchasePrice: number | null; currentValue: number | null;
    warrantyUntil: string | null; vendor: string | null; invoiceNumber: string | null;
    status: string; condition: string; location: string | null; floor: string | null; room: string | null;
    createdAt: string;
    branch: { name: string; code: string } | null;
    department: { name: string } | null;
    createdBy: { firstName: string; lastName: string; email: string };
    assignments: Array<{
        id: string; status: string; assignedAt: string; returnedAt: string | null;
        assignedToUser: { firstName: string; lastName: string; employeeId: string } | null;
        assignedByUser: { firstName: string; lastName: string };
    }>;
    maintenance: Array<{
        id: string; maintenanceType: string; description: string; status: string;
        performedAt: string; completedAt: string | null; cost: number | null;
    }>;
    auditLogs: Array<{
        id: string; action: string; changes: string | null; createdAt: string;
        user: { firstName: string; lastName: string };
    }>;
}

export default function AssetDetailPage() {
    const { id } = useParams<{ id: string }>();

    const { data: asset, isLoading } = useQuery<AssetDetail>({
        queryKey: ["asset", id],
        queryFn: async () => {
            const res = await fetch(`/api/assets/${id}`);
            if (!res.ok) throw new Error("Not found");
            return res.json();
        },
    });

    if (isLoading) {
        return (
            <div>
                <div className="skeleton" style={{ height: "32px", width: "300px", marginBottom: "24px", borderRadius: "6px" }} />
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>
                    <div className="skeleton" style={{ height: "400px", borderRadius: "var(--radius-lg)" }} />
                    <div className="skeleton" style={{ height: "400px", borderRadius: "var(--radius-lg)" }} />
                </div>
            </div>
        );
    }

    if (!asset) {
        return <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>Asset not found</div>;
    }

    const infoRows = [
        ["Asset Tag", asset.assetTag],
        ["Serial Number", asset.serialNumber || "—"],
        ["Category", `${asset.category}${asset.subCategory ? ` / ${asset.subCategory}` : ""}`],
        ["Brand", asset.brand || "—"],
        ["Model", asset.model || "—"],
        ["Vendor", asset.vendor || "—"],
        ["Invoice", asset.invoiceNumber || "—"],
        ["Purchase Date", formatDate(asset.purchaseDate)],
        ["Purchase Price", formatCurrency(asset.purchasePrice)],
        ["Current Value", formatCurrency(asset.currentValue)],
        ["Warranty Until", formatDate(asset.warrantyUntil)],
        ["Location", asset.location || "—"],
        ["Floor / Room", `${asset.floor || "—"} / ${asset.room || "—"}`],
        ["Branch", asset.branch?.name || "—"],
        ["Department", asset.department?.name || "—"],
        ["Created By", `${asset.createdBy.firstName} ${asset.createdBy.lastName}`],
        ["Created At", formatDate(asset.createdAt)],
    ];

    return (
        <div>
            {/* Breadcrumb */}
            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "20px", fontSize: "13px" }}>
                <Link href="/assets" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Assets</Link>
                <span style={{ color: "var(--text-muted)" }}>/</span>
                <span style={{ color: "var(--text-primary)" }}>{asset.name}</span>
            </div>

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                <div>
                    <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "6px" }}>{asset.name}</h1>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <span style={{ padding: "4px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: 600, background: STATUS_COLORS[asset.status]?.bg, color: STATUS_COLORS[asset.status]?.text }}>
                            {asset.status.replace("_", " ")}
                        </span>
                        <span style={{ fontSize: "13px", color: "var(--gold-400)", fontFamily: "monospace" }}>{asset.assetTag}</span>
                    </div>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>
                {/* Details Card */}
                <div className="glass" style={{ borderRadius: "var(--radius-lg)", padding: "24px" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "16px" }}>Asset Details</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0" }}>
                        {infoRows.map(([label, value]) => (
                            <div key={label} style={{ padding: "10px 0", borderBottom: "1px solid var(--border-secondary)" }}>
                                <p style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "2px" }}>{label}</p>
                                <p style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: 500 }}>{value}</p>
                            </div>
                        ))}
                    </div>
                    {asset.description && (
                        <div style={{ marginTop: "16px" }}>
                            <p style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "4px" }}>Description</p>
                            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>{asset.description}</p>
                        </div>
                    )}
                </div>

                {/* QR Code & Financial */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {/* QR Code */}
                    <div className="glass" style={{ borderRadius: "var(--radius-lg)", padding: "24px", textAlign: "center" }}>
                        <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "16px" }}>QR Code</h3>
                        <div style={{ background: "white", display: "inline-block", padding: "16px", borderRadius: "var(--radius-md)" }}>
                            <QRCodeSVG
                                value={JSON.stringify({ id: asset.id, tag: asset.assetTag, name: asset.name })}
                                size={180}
                                level="H"
                                marginSize={0}
                            />
                        </div>
                        <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "12px" }}>Scan to view asset details</p>
                    </div>

                    {/* Financial Summary */}
                    <div className="glass" style={{ borderRadius: "var(--radius-lg)", padding: "24px" }}>
                        <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "16px" }}>Financial Summary</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Purchase Price</span>
                                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{formatCurrency(asset.purchasePrice)}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Current Value</span>
                                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--emerald-400)" }}>{formatCurrency(asset.currentValue)}</span>
                            </div>
                            {asset.purchasePrice && asset.currentValue && (
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Depreciation</span>
                                    <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--red-400)" }}>
                                        {formatCurrency(asset.purchasePrice - asset.currentValue)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Assignment History */}
            <div className="glass" style={{ borderRadius: "var(--radius-lg)", padding: "24px", marginTop: "16px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "16px" }}>Assignment History</h3>
                {asset.assignments.length === 0 ? (
                    <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>No assignments yet</p>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {asset.assignments.map((a) => (
                            <div key={a.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: "var(--radius-sm)", background: "var(--bg-card)" }}>
                                <div>
                                    <p style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: 500 }}>
                                        {a.assignedToUser ? `${a.assignedToUser.firstName} ${a.assignedToUser.lastName} (${a.assignedToUser.employeeId})` : "Unassigned"}
                                    </p>
                                    <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                        Assigned by {a.assignedByUser.firstName} {a.assignedByUser.lastName}
                                    </p>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <span style={{
                                        padding: "3px 8px", borderRadius: "8px", fontSize: "11px", fontWeight: 600,
                                        background: a.status === "ACTIVE" ? "rgba(16,185,129,0.15)" : "rgba(100,116,139,0.15)",
                                        color: a.status === "ACTIVE" ? "#34d399" : "#94a3b8",
                                    }}>{a.status}</span>
                                    <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>{formatDate(a.assignedAt)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Audit Trail */}
            <div className="glass" style={{ borderRadius: "var(--radius-lg)", padding: "24px", marginTop: "16px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "16px" }}>Audit Trail</h3>
                {asset.auditLogs.length === 0 ? (
                    <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>No audit logs</p>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        {asset.auditLogs.map((log) => (
                            <div key={log.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 12px", fontSize: "13px" }}>
                                <span style={{ color: "var(--text-muted)", fontSize: "12px", width: "120px", flexShrink: 0 }}>{formatDate(log.createdAt)}</span>
                                <span style={{ fontWeight: 500, color: "var(--text-primary)" }}>{log.user.firstName} {log.user.lastName}</span>
                                <span style={{ color: "var(--text-secondary)" }}>{log.changes || log.action}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
