"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, Legend
} from "recharts";

const CATEGORY_COLORS: Record<string, string> = {
    IT: "#3b82f6",
    OFFICE: "#8b5cf6",
    SECURITY: "#ef4444",
    FURNITURE: "#f59e0b",
    VEHICLE: "#10b981",
    NETWORK: "#06b6d4",
    SERVER: "#6366f1",
    PRINTER: "#ec4899",
    TERMINAL: "#14b8a6",
    OTHER: "#64748b",
};

const STATUS_COLORS: Record<string, string> = {
    REGISTERED: "#3b82f6",
    ASSIGNED: "#10b981",
    IN_REPAIR: "#f59e0b",
    LOST: "#ef4444",
    WRITTEN_OFF: "#64748b",
    IN_TRANSIT: "#06b6d4",
    PENDING_APPROVAL: "#8b5cf6",
};

const ACTION_ICONS: Record<string, string> = {
    CREATE: "🆕",
    UPDATE: "✏️",
    DELETE: "🗑️",
    ASSIGN: "👤",
    RETURN: "↩️",
    STATUS_CHANGE: "🔄",
    MAINTENANCE_ADD: "🔧",
    LOGIN: "🔑",
    LOGOUT: "🚪",
    FAILED_LOGIN: "🚫",
    EXPORT_DATA: "📤",
};

function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

function timeAgo(date: string) {
    const now = new Date();
    const d = new Date(date);
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

interface DashboardData {
    kpi: {
        totalAssets: number;
        assignedAssets: number;
        inRepairAssets: number;
        totalValue: number;
        totalPurchaseValue: number;
        departmentCount: number;
        branchCount: number;
        userCount: number;
        warrantyExpiring: number;
    };
    charts: {
        assetsByCategory: { name: string; value: number }[];
        assetsByStatus: { name: string; value: number }[];
        assetsByCondition: { name: string; value: number }[];
    };
    recentActivity: {
        id: string;
        action: string;
        entityType: string;
        changes: string | null;
        createdAt: string;
        user: string;
        userRole: string;
    }[];
}

export default function DashboardPage() {
    const { data: session } = useSession();
    const { data, isLoading } = useQuery<DashboardData>({
        queryKey: ["dashboard"],
        queryFn: async () => {
            const res = await fetch("/api/dashboard");
            if (!res.ok) throw new Error("Failed to fetch dashboard data");
            return res.json();
        },
    });

    if (isLoading || !data) {
        return (
            <div>
                <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "24px" }}>Dashboard</h1>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="skeleton" style={{ height: "120px", borderRadius: "var(--radius-lg)" }} />
                    ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div className="skeleton" style={{ height: "320px", borderRadius: "var(--radius-lg)" }} />
                    <div className="skeleton" style={{ height: "320px", borderRadius: "var(--radius-lg)" }} />
                </div>
            </div>
        );
    }

    const kpiCards = [
        {
            title: "Total Assets",
            value: data.kpi.totalAssets.toString(),
            subtitle: `${data.kpi.branchCount} branches`,
            icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 7h-9" /><path d="M14 17H5" />
                    <circle cx="17" cy="17" r="3" /><circle cx="7" cy="7" r="3" />
                </svg>
            ),
            color: "#3b82f6",
            bgColor: "rgba(59, 130, 246, 0.1)",
        },
        {
            title: "Total Value",
            value: formatCurrency(data.kpi.totalValue),
            subtitle: `Purchase: ${formatCurrency(data.kpi.totalPurchaseValue)}`,
            icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
            ),
            color: "#10b981",
            bgColor: "rgba(16, 185, 129, 0.1)",
        },
        {
            title: "Assigned",
            value: data.kpi.assignedAssets.toString(),
            subtitle: `${data.kpi.userCount} employees`,
            icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            ),
            color: "#f59e0b",
            bgColor: "rgba(245, 158, 11, 0.1)",
        },
        {
            title: "Alerts",
            value: (data.kpi.inRepairAssets + data.kpi.warrantyExpiring).toString(),
            subtitle: `${data.kpi.inRepairAssets} repairs · ${data.kpi.warrantyExpiring} warranty`,
            icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
            ),
            color: "#ef4444",
            bgColor: "rgba(239, 68, 68, 0.1)",
        },
    ];

    const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload?: { name: string } }> }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: "var(--navy-800)",
                    border: "1px solid var(--border-primary)",
                    borderRadius: "var(--radius-sm)",
                    padding: "8px 12px",
                    fontSize: "12px",
                }}>
                    <p style={{ color: "var(--text-primary)", fontWeight: 500 }}>{payload[0].payload?.name}</p>
                    <p style={{ color: "var(--text-secondary)" }}>{payload[0].value} assets</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div>
            {/* Page Header */}
            <div style={{ marginBottom: "28px" }}>
                <h1 style={{
                    fontSize: "24px",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    marginBottom: "4px",
                }}>
                    Welcome back, {session?.user?.firstName}
                </h1>
                <p style={{ fontSize: "14px", color: "var(--text-tertiary)" }}>
                    Here&apos;s what&apos;s happening with your assets today.
                </p>
            </div>

            {/* KPI Cards */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "16px",
                marginBottom: "24px",
            }}>
                {kpiCards.map((card, i) => (
                    <div
                        key={card.title}
                        className={`glass animate-fade-in delay-${i + 1}`}
                        style={{
                            borderRadius: "var(--radius-lg)",
                            padding: "20px",
                            position: "relative",
                            overflow: "hidden",
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                            <p style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500 }}>{card.title}</p>
                            <div style={{
                                width: "38px",
                                height: "38px",
                                borderRadius: "var(--radius-md)",
                                background: card.bgColor,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: card.color,
                            }}>
                                {card.icon}
                            </div>
                        </div>
                        <p style={{ fontSize: "28px", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.1, marginBottom: "4px" }}>
                            {card.value}
                        </p>
                        <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{card.subtitle}</p>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "24px",
            }}>
                {/* Assets by Category — Pie Chart */}
                <div className="glass animate-fade-in delay-5" style={{
                    borderRadius: "var(--radius-lg)",
                    padding: "20px",
                }}>
                    <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "16px" }}>
                        Assets by Category
                    </h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={data.charts.assetsByCategory}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={3}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.charts.assetsByCategory.map((entry) => (
                                    <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || "#64748b"} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                wrapperStyle={{ fontSize: "11px", color: "var(--text-secondary)" }}
                                formatter={(value) => <span style={{ color: "var(--text-secondary)", fontSize: "11px" }}>{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Assets by Status — Bar Chart */}
                <div className="glass animate-fade-in delay-6" style={{
                    borderRadius: "var(--radius-lg)",
                    padding: "20px",
                }}>
                    <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "16px" }}>
                        Assets by Status
                    </h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={data.charts.assetsByStatus} barCategoryGap="20%">
                            <XAxis
                                dataKey="name"
                                tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                                axisLine={{ stroke: "var(--border-secondary)" }}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {data.charts.assetsByStatus.map((entry) => (
                                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "#64748b"} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="glass animate-fade-in" style={{
                borderRadius: "var(--radius-lg)",
                padding: "20px",
            }}>
                <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "16px" }}>
                    Recent Activity
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    {data.recentActivity.map((activity) => (
                        <div
                            key={activity.id}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "10px 12px",
                                borderRadius: "var(--radius-sm)",
                                transition: "background var(--transition-fast)",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-card-hover)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                        >
                            <span style={{ fontSize: "18px", width: "28px", textAlign: "center" }}>
                                {ACTION_ICONS[activity.action] || "📋"}
                            </span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: "13px", color: "var(--text-primary)" }}>
                                    <span style={{ fontWeight: 500 }}>{activity.user}</span>
                                    {" "}
                                    <span style={{ color: "var(--text-secondary)" }}>
                                        {activity.changes || `${activity.action.toLowerCase()} ${activity.entityType.toLowerCase()}`}
                                    </span>
                                </p>
                            </div>
                            <span style={{ fontSize: "12px", color: "var(--text-muted)", flexShrink: 0 }}>
                                {timeAgo(activity.createdAt)}
                            </span>
                        </div>
                    ))}
                    {data.recentActivity.length === 0 && (
                        <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px", fontSize: "13px" }}>
                            No recent activity
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
