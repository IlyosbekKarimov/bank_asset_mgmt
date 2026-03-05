import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/providers";

export const metadata: Metadata = {
  title: "Capital Trust Bank — Asset Management",
  description: "Enterprise-grade asset management system for Capital Trust Bank. Track, assign, and manage all organizational assets with real-time analytics and audit compliance.",
  keywords: ["asset management", "banking", "enterprise", "inventory", "compliance"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
