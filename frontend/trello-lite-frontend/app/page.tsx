"use client";

import React from "react";
import { AuthProvider } from "@/src/context/AuthContext";
import AppRoutes from "@/src/routes/AppRoutes";

export default function Page() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
}
