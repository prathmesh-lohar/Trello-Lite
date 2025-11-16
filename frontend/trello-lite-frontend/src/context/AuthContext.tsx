"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Load user and token when app starts
    useEffect(() => {
        const savedUser = localStorage.getItem("auth-user");
        const savedToken = localStorage.getItem("auth-token");
        console.log("Loading auth data:", { savedUser: !!savedUser, savedToken: !!savedToken });
        if (savedUser) setUser(JSON.parse(savedUser));
        if (savedToken) setToken(savedToken);
        setLoading(false);
    }, []);

    // Save user and token to localStorage
    useEffect(() => {
        if (user) {
            localStorage.setItem("auth-user", JSON.stringify(user));
        } else {
            localStorage.removeItem("auth-user");
        }
    }, [user]);

    useEffect(() => {
        if (token) {
            localStorage.setItem("auth-token", token);
        } else {
            localStorage.removeItem("auth-token");
        }
    }, [token]);

    return (
        <AuthContext.Provider value={{ user, setUser, token, setToken, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
