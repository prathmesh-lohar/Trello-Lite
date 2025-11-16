"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/src/context/AuthContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { user, token, loading } = useAuth();

    useEffect(() => {
        if (!loading && (!user || !token)) {
            router.replace("/login");
        }
    }, [loading, user, token]);

    if (loading) return null;
    if (!user || !token) return null; // while redirecting

    return <>{children}</>;
}
