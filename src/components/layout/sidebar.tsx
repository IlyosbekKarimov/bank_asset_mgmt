"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";

const menuSections = [
    {
        label: "Overview",
        items: [
            { name: "Dashboard", href: "/", icon: "dashboard", roles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "EMPLOYEE", "AUDITOR"] },
        ],
    },
    {
        label: "Asset Management",
        items: [
            { name: "Assets", href: "/assets", icon: "assets", roles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "EMPLOYEE", "AUDITOR"] },
            { name: "Assignments", href: "/assignments", icon: "assignments", roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"] },
            { name: "Maintenance", href: "/maintenance", icon: "maintenance", roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"] },
        ],
    },
    {
        label: "Organization",
        items: [
            { name: "Users", href: "/users", icon: "users", roles: ["SUPER_ADMIN", "ADMIN"] },
            { name: "Departments", href: "/departments", icon: "departments", roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"] },
            { name: "Branches", href: "/branches", icon: "branches", roles: ["SUPER_ADMIN", "ADMIN"] },
        ],
    },
    {
        label: "Reports & Audit",
        items: [
            { name: "Reports", href: "/reports", icon: "reports", roles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "AUDITOR"] },
            { name: "Audit Log", href: "/audit", icon: "audit", roles: ["SUPER_ADMIN", "ADMIN", "AUDITOR"] },
        ],
    },
    {
        label: "System",
        items: [
            { name: "Settings", href: "/settings", icon: "settings", roles: ["SUPER_ADMIN", "ADMIN"] },
        ],
    },
];

function getIcon(name: string) {
    const icons: Record<string, React.ReactNode> = {
        dashboard: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="9" rx="1" />
                <rect x="14" y="3" width="7" height="5" rx="1" />
                <rect x="14" y="12" width="7" height="9" rx="1" />
                <rect x="3" y="16" width="7" height="5" rx="1" />
            </svg>
        ),
        assets: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 7h-9" /><path d="M14 17H5" />
                <circle cx="17" cy="17" r="3" /><circle cx="7" cy="7" r="3" />
            </svg>
        ),
        assignments: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
        maintenance: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
        ),
        users: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </svg>
        ),
        departments: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18" /><path d="M5 21V7l7-4 7 4v14" />
                <path d="M9 21v-4h6v4" />
            </svg>
        ),
        branches: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
        ),
        reports: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <line x1="10" y1="9" x2="8" y2="9" />
            </svg>
        ),
        audit: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
        ),
        settings: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
        ),
    };
    return icons[name] || icons.dashboard;
}

export default function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [collapsed, setCollapsed] = useState(false);
    const userRole = session?.user?.role || "EMPLOYEE";

    return (
        <aside style={{
            width: collapsed ? "var(--sidebar-collapsed)" : "var(--sidebar-width)",
            height: "100vh",
            position: "fixed",
            left: 0,
            top: 0,
            background: "var(--bg-secondary)",
            borderRight: "1px solid var(--border-secondary)",
            display: "flex",
            flexDirection: "column",
            transition: "width var(--transition-base)",
            zIndex: 40,
            overflow: "hidden",
        }}>
            {/* Logo */}
            <div style={{
                padding: collapsed ? "20px 12px" : "20px 20px",
                borderBottom: "1px solid var(--border-secondary)",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                minHeight: "var(--header-height)",
            }}>
                <div style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, var(--gold-500), var(--gold-600))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--navy-950)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 21h18" /><path d="M5 21V7l7-4 7 4v14" />
                    </svg>
                </div>
                {!collapsed && (
                    <div style={{ overflow: "hidden" }}>
                        <h2 style={{
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "var(--text-primary)",
                            whiteSpace: "nowrap",
                            letterSpacing: "-0.01em",
                        }}>
                            Capital Trust
                        </h2>
                        <p style={{
                            fontSize: "11px",
                            color: "var(--text-muted)",
                            whiteSpace: "nowrap",
                        }}>
                            Asset Manager
                        </p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav style={{
                flex: 1,
                overflowY: "auto",
                padding: "12px 8px",
            }}>
                {menuSections.map((section) => {
                    const visibleItems = section.items.filter((item) =>
                        item.roles.includes(userRole)
                    );
                    if (visibleItems.length === 0) return null;

                    return (
                        <div key={section.label} style={{ marginBottom: "16px" }}>
                            {!collapsed && (
                                <p style={{
                                    fontSize: "11px",
                                    fontWeight: 600,
                                    color: "var(--text-muted)",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    padding: "0 12px",
                                    marginBottom: "6px",
                                }}>
                                    {section.label}
                                </p>
                            )}
                            {visibleItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "12px",
                                            padding: collapsed ? "10px 14px" : "10px 12px",
                                            borderRadius: "var(--radius-md)",
                                            color: isActive ? "var(--gold-400)" : "var(--text-secondary)",
                                            background: isActive ? "var(--accent-subtle)" : "transparent",
                                            textDecoration: "none",
                                            fontSize: "13px",
                                            fontWeight: isActive ? 600 : 400,
                                            transition: "all var(--transition-fast)",
                                            position: "relative",
                                            whiteSpace: "nowrap",
                                            justifyContent: collapsed ? "center" : "flex-start",
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isActive) {
                                                e.currentTarget.style.background = "var(--bg-card-hover)";
                                                e.currentTarget.style.color = "var(--text-primary)";
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isActive) {
                                                e.currentTarget.style.background = "transparent";
                                                e.currentTarget.style.color = "var(--text-secondary)";
                                            }
                                        }}
                                    >
                                        {isActive && (
                                            <div style={{
                                                position: "absolute",
                                                left: 0,
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                width: "3px",
                                                height: "20px",
                                                borderRadius: "0 3px 3px 0",
                                                background: "var(--gold-500)",
                                            }} />
                                        )}
                                        {getIcon(item.icon)}
                                        {!collapsed && <span>{item.name}</span>}
                                    </Link>
                                );
                            })}
                        </div>
                    );
                })}
            </nav>

            {/* Collapse Toggle */}
            <div style={{
                padding: "12px 8px",
                borderTop: "1px solid var(--border-secondary)",
            }}>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    style={{
                        width: "100%",
                        padding: "10px",
                        background: "transparent",
                        border: "1px solid var(--border-secondary)",
                        borderRadius: "var(--radius-md)",
                        color: "var(--text-tertiary)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        fontSize: "12px",
                        transition: "all var(--transition-fast)",
                        fontFamily: "inherit",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--bg-card-hover)";
                        e.currentTarget.style.color = "var(--text-primary)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "var(--text-tertiary)";
                    }}
                >
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                            transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform var(--transition-base)",
                        }}
                    >
                        <path d="M11 17l-5-5 5-5" />
                        <path d="M18 17l-5-5 5-5" />
                    </svg>
                    {!collapsed && <span>Collapse</span>}
                </button>
            </div>
        </aside>
    );
}
