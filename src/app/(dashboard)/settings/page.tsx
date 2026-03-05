"use client";

import { useSession } from "next-auth/react";

export default function SettingsPage() {
    const { data: session } = useSession();

    const sections = [
        {
            title: "Organization",
            desc: "General organization settings and branding",
            fields: [
                { label: "Organization Name", value: "Capital Trust Bank", type: "text" },
                { label: "Tax ID", value: "12-3456789", type: "text" },
                { label: "Primary Email", value: "admin@capitaltrust.bank", type: "email" },
                { label: "Primary Phone", value: "+1 (212) 555-0100", type: "tel" },
                { label: "Address", value: "100 Financial District, Suite 2000, New York, NY 10005", type: "text" },
            ],
        },
        {
            title: "Security",
            desc: "Authentication and security policies",
            fields: [
                { label: "Session Timeout", value: "8 hours", type: "text" },
                { label: "Max Login Attempts", value: "5", type: "number" },
                { label: "Lockout Duration", value: "15 minutes", type: "text" },
                { label: "Password Policy", value: "Minimum 8 chars, 1 uppercase, 1 number, 1 special", type: "text" },
            ],
        },
        {
            title: "Notifications",
            desc: "Email and system notification preferences",
            fields: [
                { label: "Warranty Expiry Alert", value: "90 days before", type: "text" },
                { label: "Maintenance Reminder", value: "7 days before", type: "text" },
                { label: "Audit Email Reports", value: "Weekly", type: "text" },
            ],
        },
    ];

    return (
        <div>
            <div style={{ marginBottom: "24px" }}>
                <h1 style={{ fontSize: "24px", fontWeight: 700 }}>Settings</h1>
                <p style={{ fontSize: "14px", color: "var(--text-tertiary)" }}>Manage system configuration</p>
            </div>

            {/* Profile Card */}
            <div className="glass" style={{ borderRadius: "var(--radius-lg)", padding: "24px", marginBottom: "20px" }}>
                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                    <div style={{ width: "56px", height: "56px", borderRadius: "var(--radius-lg)", background: "linear-gradient(135deg, var(--gold-500), var(--gold-700))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 700, color: "var(--navy-950)" }}>
                        {session?.user?.firstName?.[0]}{session?.user?.lastName?.[0]}
                    </div>
                    <div>
                        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)" }}>{session?.user?.firstName} {session?.user?.lastName}</h3>
                        <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{session?.user?.email}</p>
                        <p style={{ fontSize: "12px", color: "var(--gold-400)", marginTop: "2px" }}>{session?.user?.role?.replace("_", " ")} · {session?.user?.position}</p>
                    </div>
                </div>
            </div>

            {/* Setting Sections */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {sections.map((section) => (
                    <div key={section.title} className="glass" style={{ borderRadius: "var(--radius-lg)", padding: "24px" }}>
                        <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "4px", color: "var(--text-primary)" }}>{section.title}</h3>
                        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>{section.desc}</p>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                            {section.fields.map((field) => (
                                <div key={field.label}>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "6px" }}>{field.label}</label>
                                    <input type={field.type} defaultValue={field.value} readOnly
                                        style={{ width: "100%", padding: "10px 12px", background: "var(--bg-input)", border: "1px solid var(--border-secondary)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: "13px", outline: "none", fontFamily: "inherit" }} />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
