"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

// Import pages using dynamic import to avoid server/client conflicts
const LoginPage = dynamic(() => import("@/app/login/page"), { ssr: false });
const DashboardPage = dynamic(() => import("@/app/dashboard/page"), { ssr: false });

export default function AppRoutes() {
    const pathname = usePathname();

    switch (pathname) {
        case "/login":
            return <LoginPage />;

        case "/dashboard":
            return <DashboardPage />;

        default:
            return <LoginPage />; // fallback
    }
}
