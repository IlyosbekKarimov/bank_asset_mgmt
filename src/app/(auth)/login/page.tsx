"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error("Please enter both email and password");
            return;
        }

        setIsLoading(true);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                toast.error("Invalid credentials. Please try again.");
            } else {
                toast.success("Welcome back! Redirecting...");
                router.push("/");
                router.refresh();
            }
        } catch {
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="animate-scale-in" style={{
            width: "100%",
            maxWidth: "440px",
            padding: "0 24px",
        }}>
            {/* Logo / Branding */}
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
                <div style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "16px",
                    background: "linear-gradient(135deg, var(--gold-500), var(--gold-600))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                    boxShadow: "0 8px 32px rgba(212, 160, 23, 0.25)",
                }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--navy-950)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 21h18" />
                        <path d="M5 21V7l7-4 7 4v14" />
                        <path d="M9 21v-6h6v6" />
                        <path d="M9 9h1" />
                        <path d="M14 9h1" />
                        <path d="M9 13h1" />
                        <path d="M14 13h1" />
                    </svg>
                </div>
                <h1 style={{
                    fontSize: "24px",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    letterSpacing: "-0.02em",
                    marginBottom: "8px",
                }}>
                    Capital Trust Bank
                </h1>
                <p style={{
                    fontSize: "14px",
                    color: "var(--text-tertiary)",
                }}>
                    Asset Management System
                </p>
            </div>

            {/* Login Card */}
            <div className="glass" style={{
                borderRadius: "var(--radius-xl)",
                padding: "32px",
                boxShadow: "var(--shadow-xl)",
            }}>
                <h2 style={{
                    fontSize: "18px",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    marginBottom: "24px",
                }}>
                    Sign in to your account
                </h2>

                <form onSubmit={handleSubmit}>
                    {/* Email */}
                    <div style={{ marginBottom: "20px" }}>
                        <label style={{
                            display: "block",
                            fontSize: "13px",
                            fontWeight: 500,
                            color: "var(--text-secondary)",
                            marginBottom: "8px",
                        }}>
                            Email Address
                        </label>
                        <div style={{ position: "relative" }}>
                            <span style={{
                                position: "absolute",
                                left: "14px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                color: "var(--text-muted)",
                            }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect width="20" height="16" x="2" y="4" rx="2" />
                                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                </svg>
                            </span>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@capitaltrust.bank"
                                required
                                className="focus-ring"
                                style={{
                                    width: "100%",
                                    padding: "12px 14px 12px 44px",
                                    background: "var(--bg-input)",
                                    border: "1px solid var(--border-primary)",
                                    borderRadius: "var(--radius-md)",
                                    color: "var(--text-primary)",
                                    fontSize: "14px",
                                    transition: "border-color var(--transition-fast)",
                                    outline: "none",
                                    fontFamily: "inherit",
                                }}
                                onFocus={(e) => e.target.style.borderColor = "var(--gold-500)"}
                                onBlur={(e) => e.target.style.borderColor = "var(--border-primary)"}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div style={{ marginBottom: "28px" }}>
                        <label style={{
                            display: "block",
                            fontSize: "13px",
                            fontWeight: 500,
                            color: "var(--text-secondary)",
                            marginBottom: "8px",
                        }}>
                            Password
                        </label>
                        <div style={{ position: "relative" }}>
                            <span style={{
                                position: "absolute",
                                left: "14px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                color: "var(--text-muted)",
                            }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                            </span>
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="focus-ring"
                                style={{
                                    width: "100%",
                                    padding: "12px 48px 12px 44px",
                                    background: "var(--bg-input)",
                                    border: "1px solid var(--border-primary)",
                                    borderRadius: "var(--radius-md)",
                                    color: "var(--text-primary)",
                                    fontSize: "14px",
                                    transition: "border-color var(--transition-fast)",
                                    outline: "none",
                                    fontFamily: "inherit",
                                }}
                                onFocus={(e) => e.target.style.borderColor = "var(--gold-500)"}
                                onBlur={(e) => e.target.style.borderColor = "var(--border-primary)"}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: "absolute",
                                    right: "14px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    background: "none",
                                    border: "none",
                                    color: "var(--text-muted)",
                                    cursor: "pointer",
                                    padding: "0",
                                    display: "flex",
                                }}
                            >
                                {showPassword ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        id="login-submit"
                        style={{
                            width: "100%",
                            padding: "12px",
                            background: isLoading
                                ? "var(--navy-600)"
                                : "linear-gradient(135deg, var(--gold-500), var(--gold-600))",
                            border: "none",
                            borderRadius: "var(--radius-md)",
                            color: isLoading ? "var(--text-secondary)" : "var(--navy-950)",
                            fontSize: "14px",
                            fontWeight: 600,
                            cursor: isLoading ? "not-allowed" : "pointer",
                            transition: "all var(--transition-fast)",
                            fontFamily: "inherit",
                            letterSpacing: "0.01em",
                            boxShadow: isLoading ? "none" : "0 4px 14px rgba(212, 160, 23, 0.3)",
                        }}
                    >
                        {isLoading ? (
                            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" style={{ animation: "spin 1s linear infinite" }}>
                                    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round" />
                                </svg>
                                Signing in...
                            </span>
                        ) : (
                            "Sign In"
                        )}
                    </button>
                </form>
            </div>

            {/* Footer */}
            <p style={{
                textAlign: "center",
                fontSize: "12px",
                color: "var(--text-muted)",
                marginTop: "24px",
            }}>
                © 2026 Capital Trust Bank. Secure Asset Management.
            </p>

            <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}
