export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, var(--navy-950) 0%, var(--navy-900) 50%, var(--navy-800) 100%)",
            position: "relative",
            overflow: "hidden",
        }}>
            {/* Background decorative elements */}
            <div style={{
                position: "absolute",
                top: "-20%",
                right: "-10%",
                width: "600px",
                height: "600px",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(212,160,23,0.06) 0%, transparent 70%)",
                pointerEvents: "none",
            }} />
            <div style={{
                position: "absolute",
                bottom: "-15%",
                left: "-5%",
                width: "500px",
                height: "500px",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)",
                pointerEvents: "none",
            }} />
            {children}
        </div>
    );
}
