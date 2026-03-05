"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

export default function Header() {
    const { data: session } = useSession();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const user = session?.user;
    const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : "??";

    const handleLogout = async () => {
        toast.success("Logged out successfully");
        await signOut({ callbackUrl: "/login" });
    };

    const roleBadgeColor: Record<string, string> = {
        SUPER_ADMIN: "var(--red-400)",
        ADMIN: "var(--amber-400)",
        MANAGER: "var(--blue-400)",
        EMPLOYEE: "var(--emerald-400)",
        AUDITOR: "var(--purple-400)",
    };

    return (
        <header style={{
            height: "var(--header-height)",
            background: "var(--bg-secondary)",
            borderBottom: "1px solid var(--border-secondary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            position: "sticky",
            top: 0,
            zIndex: 30,
        }}>
            {/* Left — Search */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flex: 1,
                maxWidth: "480px",
            }}>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-secondary)",
                    borderRadius: "var(--radius-md)",
                    padding: "8px 14px",
                    width: "100%",
                    transition: "border-color var(--transition-fast)",
                }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search assets, users, departments..."
                        style={{
                            background: "transparent",
                            border: "none",
                            outline: "none",
                            color: "var(--text-primary)",
                            fontSize: "13px",
                            width: "100%",
                            fontFamily: "inherit",
                        }}
                    />
                    <kbd style={{
                        fontSize: "11px",
                        color: "var(--text-muted)",
                        background: "var(--navy-700)",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        border: "1px solid var(--border-primary)",
                        fontFamily: "inherit",
                    }}>
                        ⌘K
                    </kbd>
                </div>
            </div>

            {/* Right — Notifications & Profile */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
            }}>
                {/* Notification Bell */}
                <button
                    style={{
                        position: "relative",
                        background: "transparent",
                        border: "none",
                        color: "var(--text-tertiary)",
                        cursor: "pointer",
                        padding: "8px",
                        borderRadius: "var(--radius-md)",
                        transition: "all var(--transition-fast)",
                        display: "flex",
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
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    <span style={{
                        position: "absolute",
                        top: "6px",
                        right: "6px",
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "var(--red-400)",
                        border: "2px solid var(--bg-secondary)",
                    }} />
                </button>

                {/* Separator */}
                <div style={{
                    width: "1px",
                    height: "24px",
                    background: "var(--border-secondary)",
                }} />

                {/* User Profile */}
                <div ref={dropdownRef} style={{ position: "relative" }}>
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: "6px 8px",
                            borderRadius: "var(--radius-md)",
                            transition: "all var(--transition-fast)",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "var(--bg-card-hover)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                        }}
                    >
                        <div style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "var(--radius-md)",
                            background: "linear-gradient(135deg, var(--gold-500), var(--gold-700))",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            fontWeight: 700,
                            color: "var(--navy-950)",
                        }}>
                            {initials}
                        </div>
                        <div style={{ textAlign: "left" }}>
                            <p style={{
                                fontSize: "13px",
                                fontWeight: 500,
                                color: "var(--text-primary)",
                                lineHeight: 1.2,
                            }}>
                                {user?.firstName} {user?.lastName}
                            </p>
                            <p style={{
                                fontSize: "11px",
                                color: roleBadgeColor[user?.role || "EMPLOYEE"],
                                lineHeight: 1.2,
                            }}>
                                {user?.role?.replace("_", " ")}
                            </p>
                        </div>
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="var(--text-muted)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{
                                transform: showDropdown ? "rotate(180deg)" : "rotate(0deg)",
                                transition: "transform var(--transition-fast)",
                            }}
                        >
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </button>

                    {/* Dropdown */}
                    {showDropdown && (
                        <div
                            className="animate-scale-in"
                            style={{
                                position: "absolute",
                                right: 0,
                                top: "calc(100% + 8px)",
                                width: "220px",
                                background: "var(--navy-800)",
                                border: "1px solid var(--border-primary)",
                                borderRadius: "var(--radius-lg)",
                                boxShadow: "var(--shadow-xl)",
                                overflow: "hidden",
                                zIndex: 50,
                            }}
                        >
                            <div style={{
                                padding: "12px 16px",
                                borderBottom: "1px solid var(--border-secondary)",
                            }}>
                                <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>
                                    {user?.firstName} {user?.lastName}
                                </p>
                                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                                    {user?.email}
                                </p>
                            </div>
                            <div style={{ padding: "4px" }}>
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        width: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                        padding: "10px 12px",
                                        background: "transparent",
                                        border: "none",
                                        borderRadius: "var(--radius-sm)",
                                        color: "var(--red-400)",
                                        fontSize: "13px",
                                        cursor: "pointer",
                                        transition: "background var(--transition-fast)",
                                        fontFamily: "inherit",
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                        <polyline points="16 17 21 12 16 7" />
                                        <line x1="21" y1="12" x2="9" y2="12" />
                                    </svg>
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
