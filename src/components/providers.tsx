"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useState, type ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000,
                        refetchOnWindowFocus: false,
                    },
                },
            })
    );

    return (
        <SessionProvider>
            <QueryClientProvider client={queryClient}>
                {children}
                <Toaster
                    position="top-right"
                    toastOptions={{
                        style: {
                            background: "var(--navy-800)",
                            border: "1px solid var(--border-primary)",
                            color: "var(--text-primary)",
                            fontFamily: "'Inter', sans-serif",
                        },
                    }}
                    richColors
                    closeButton
                />
            </QueryClientProvider>
        </SessionProvider>
    );
}
