"use client";

import React, { useState } from "react";
import { useAuth } from "@/src/context/AuthContext";
import {loginUser, signupUser} from "@/src/api/authService";
// Import this once you provide the signup API
// import { signupUser } from "@/src/api/authService";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const { setUser, setToken } = useAuth();

    // Auth toggle: "login" or "signup"
    const [authTab, setAuthTab] = useState<"login" | "signup">("login");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    // For signup only
    const [name, setName] = useState("");
    const [signupError, setSignupError] = useState("");
    const [loginError, setLoginError] = useState("");
    const [showPass, setShowPass] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError("");

        try {
            const res = await loginUser(email, password);
            console.log("Login response:", res);

            if (!res || !res.token || !res._id || !res.name || !res.email) {
                throw new Error("Invalid server response");
            }

            const user = {
                _id: res._id,
                name: res.name,
                email: res.email,
            };

            localStorage.setItem("auth-user", JSON.stringify(user));
            localStorage.setItem("auth-token", res.token);
            setUser(user);
            setToken(res.token);

            // router.replace("/dashboard");
            window.location.href = "/dashboard"
        } catch (err: any) {
            console.error("Login error:", err);
            setLoginError(err.message || "Invalid email or password");
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setSignupError("");
        try {
            const res = await signupUser(name, email, password);

            if (!res || !res.token || !res._id || !res.name || !res.email) {
                throw new Error("Invalid server response");
            }

            const user = { _id: res._id, name: res.name, email: res.email };
            localStorage.setItem("auth-user", JSON.stringify(user));
            localStorage.setItem("auth-token", res.token);
            setUser(user);
            setToken(res.token);
            router.replace("/dashboard");
        } catch (err: any) {
            // Set and display the actual server message, such as 'User already exists'
            setSignupError(err.message || "Signup failed");
        }
    };



    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-200 min-h-screen flex items-center justify-center">
            <div className="flex w-full max-w-6xl shadow-lg rounded-xl overflow-hidden">

                {/* Left Side */}
                <div className="hidden lg:flex w-1/2 flex-col bg-slate-100 dark:bg-slate-900/50 p-12 justify-center">
                    <div className="mx-auto max-w-md flex flex-col gap-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
                                <span className="material-symbols-outlined text-white text-3xl">
                                    task_alt
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                TaskFlow
                            </p>
                        </div>
                        <h1 className="text-4xl font-black leading-tight text-[#0d141b] dark:text-gray-100 md:text-5xl">
                            Organize Your Team's Work, All in One Place.
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400">
                            Streamline tasks, boost productivity, and achieve your goals faster.
                        </p>
                    </div>
                </div>

                {/* Right Side Form */}
                <div className="flex w-full lg:w-1/2 flex-col p-12 items-center justify-center">
                    <div className="w-full max-w-md flex flex-col gap-6">

                        {/* Segmented Buttons */}
                        <div className="flex px-0 py-3">
                            <div className="flex h-12 flex-1 items-center justify-center rounded-xl bg-slate-200 p-1.5 dark:bg-slate-800">
                                <label
                                    className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 text-slate-500 dark:text-slate-400 text-sm font-medium transition-all duration-200 
                                        ${authTab === "login" ? "bg-white dark:bg-slate-900 shadow-sm text-[#0d141b] dark:text-white" : ""}`
                                    }
                                >
                                    <span className="truncate">Log In</span>
                                    <input
                                        type="radio"
                                        name="auth-toggle"
                                        value="Log In"
                                        checked={authTab === "login"}
                                        onChange={() => setAuthTab("login")}
                                        className="invisible w-0"
                                    />
                                </label>
                                <label
                                    className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 text-slate-500 dark:text-slate-400 text-sm font-medium transition-all duration-200
                                        ${authTab === "signup" ? "bg-white dark:bg-slate-900 shadow-sm text-[#0d141b] dark:text-white" : ""}`
                                    }
                                >
                                    <span className="truncate">Sign Up</span>
                                    <input
                                        type="radio"
                                        name="auth-toggle"
                                        value="Sign Up"
                                        checked={authTab === "signup"}
                                        onChange={() => setAuthTab("signup")}
                                        className="invisible w-0"
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Heading */}
                        <p className="text-[#0d141b] dark:text-white text-4xl font-black leading-tight">
                            {authTab === "login" ? "Welcome Back!" : "Create your Account"}
                        </p>

                        {/* Login Form */}
                        {authTab === "login" && (
                            <form className="flex flex-col gap-4" onSubmit={handleLogin}>
                                {loginError && <p className="text-red-500">{loginError}</p>}
                                {/* Email */}
                                <label className="flex flex-col">
                                    <p className="text-[#0d141b] dark:text-gray-200 text-base font-medium pb-2">
                                        Email Address
                                    </p>
                                    <input
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="form-input flex w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-background-light dark:bg-background-dark h-14 p-[15px] text-base text-[#0d141b] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                    />
                                </label>
                                {/* Password */}
                                <label className="flex flex-col">
                                    <p className="text-[#0d141b] dark:text-gray-200 text-base font-medium pb-2">
                                        Password
                                    </p>
                                    <div className="relative flex w-full items-stretch">
                                        <input
                                            type={showPass ? "text" : "password"}
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="form-input flex w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-background-light dark:bg-background-dark h-14 p-[15px] pr-12 text-base text-[#0d141b] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPass(!showPass)}
                                            className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 dark:text-slate-500 hover:text-primary"
                                        >
                                            <span className="material-symbols-outlined">
                                                {showPass ? "visibility_off" : "visibility"}
                                            </span>
                                        </button>
                                    </div>
                                </label>
                                <button
                                    type="submit"
                                    className="flex h-14 w-full items-center justify-center rounded-lg bg-primary text-white text-base font-semibold shadow-sm hover:bg-primary/90"
                                >
                                    Log In
                                </button>
                            </form>
                        )}

                        {/* Sign Up Form */}
                        {authTab === "signup" && (
                            <form className="flex flex-col gap-4" onSubmit={handleSignup}>
                                {signupError && <p className="text-red-500">{signupError}</p>}
                                {/* Name */}
                                <label className="flex flex-col">
                                    <p className="text-[#0d141b] dark:text-gray-200 text-base font-medium pb-2">
                                        Name
                                    </p>
                                    <input
                                        type="text"
                                        placeholder="Your Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        className="form-input flex w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-background-light dark:bg-background-dark h-14 p-[15px] text-base text-[#0d141b] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                    />
                                </label>
                                {/* Email */}
                                <label className="flex flex-col">
                                    <p className="text-[#0d141b] dark:text-gray-200 text-base font-medium pb-2">
                                        Email Address
                                    </p>
                                    <input
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="form-input flex w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-background-light dark:bg-background-dark h-14 p-[15px] text-base text-[#0d141b] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                    />
                                </label>
                                {/* Password */}
                                <label className="flex flex-col">
                                    <p className="text-[#0d141b] dark:text-gray-200 text-base font-medium pb-2">
                                        Password
                                    </p>
                                    <div className="relative flex w-full items-stretch">
                                        <input
                                            type={showPass ? "text" : "password"}
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="form-input flex w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-background-light dark:bg-background-dark h-14 p-[15px] pr-12 text-base text-[#0d141b] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPass(!showPass)}
                                            className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 dark:text-slate-500 hover:text-primary"
                                        >
                                            <span className="material-symbols-outlined">
                                                {showPass ? "visibility_off" : "visibility"}
                                            </span>
                                        </button>
                                    </div>
                                </label>
                                <button
                                    type="submit"
                                    className="flex h-14 w-full items-center justify-center rounded-lg bg-primary text-white text-base font-semibold shadow-sm hover:bg-primary/90"
                                >
                                    Sign Up
                                </button>
                            </form>
                        )}

                        {/* OR */}
                        <div className="flex items-center gap-4 py-2">
                            <hr className="flex-1 border-t border-slate-300 dark:border-slate-700" />
                            <p className="text-sm text-slate-500 dark:text-slate-400">OR</p>
                            <hr className="flex-1 border-t border-slate-300 dark:border-slate-700" />
                        </div>

                        {/* Social Buttons */}
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <button className="flex h-12 flex-1 items-center justify-center gap-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-sm font-medium">
                                <img alt="Google" className="h-5 w-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCBWQHxZ1ao6tGjYqJq2ip-nE_TFTN9LBtKysTQ_p0hbsybVmvkQMb7upnILN7AX99xo_N7hDo5yPLdQip-IEVtw7zkeD26D0qabQoS4APriggpv7Dd-b5SEDz4AkIsxaLadg1cNf_B2r9Zs22zBtscFemctdmnLDuP6xD25rG1TiO7GsNA3C6cKeqSB4RdSMtrlptib0t41UlQJMJU8Hj1MVy9oPnF6orR_3pfo6mpiFusHkRXSw2iYsNjT-YZIaF41Q_9FPN_kLA" />
                                Sign in with Google
                            </button>
                            <button className="flex h-12 flex-1 items-center justify-center gap-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-sm font-medium">
                                <img alt="Microsoft" className="h-5 w-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHAN0Bv2FEfAda8avnGe06v1cmj-y_jQo8IxVXjcLqth789_gSVWYdf6xb-Gb0GFj2irGwI58QTehm-k5y8IuAgEv8a2qnQ6x6cSDZFLEIJbaqbVLjWxtnGuw8oLfAjpjp_-t6Fy7bKafMNKZL7ww9pHPi9bdoV20_q3ytByAj4afhvx2nxTdfzrIJ5hx4p7iiOnCLxdCqP6gkVT8zFAWoSTVrEY4VoG_RyYxt5vwqTkZZvaTc40B4gR1c_zzyxig0wJoyzcD7UPM" />
                                Sign in with Microsoft
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
