"use client";

import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { useState } from "react";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
    const [sidebarCollapsed] = useState(false);

    return (
        <div style={{ display: "flex", minHeight: "100vh" }}>
            <Sidebar />
            <div style={{
                flex: 1,
                marginLeft: sidebarCollapsed ? "var(--sidebar-collapsed)" : "var(--sidebar-width)",
                transition: "margin-left var(--transition-base)",
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
            }}>
                <Header />
                <main style={{
                    flex: 1,
                    padding: "24px",
                    overflowY: "auto",
                }}>
                    {children}
                </main>
            </div>
        </div>
    );
}
