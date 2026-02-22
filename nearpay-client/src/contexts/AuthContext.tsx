"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCookie, setCookie, removeCookie } from "@/utils/cookies";
import axios from "axios";

export type Role = "user" | "provider" | null;

interface UserData {
    id: string;
    name: string;
    email: string;
    role: Role;
}

interface AuthContextType {
    user: UserData | null;
    role: Role;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const storedUser = getCookie("nearpay_user");
        const token = getCookie("adminToken");

        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        } else {
            removeCookie("nearpay_user");
            removeCookie("adminToken");
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4200/api/v1";
            const response = await axios.post(`${apiUrl}/auth/login`, { email, password });

            if (response.data.success && response.data.data) {
                const { user: userData, token } = response.data.data;
                const formattedUser: UserData = {
                    id: userData._id || userData.id,
                    name: userData.name,
                    email: userData.email,
                    role: userData.role || "user",
                };

                setUser(formattedUser);
                setCookie("adminToken", token);
                setCookie("nearpay_user", JSON.stringify(formattedUser));

                if (formattedUser.role === "provider") {
                    router.push("/provider");
                } else {
                    router.push("/");
                }
                return true;
            }
            return false;
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        removeCookie("adminToken");
        removeCookie("nearpay_user");
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, role: user?.role || null, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
