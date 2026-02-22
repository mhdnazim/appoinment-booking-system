"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, CreditCard, LayoutDashboard, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";

export function Navbar() {
    const pathname = usePathname();
    const { user, role, logout } = useAuth();

    const isProvider = pathname?.includes("/provider");

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-white/80 backdrop-blur">
            <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white">
                        <CreditCard className="h-5 w-5" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-foreground">Nearpay</span>
                </Link>

                {/* Navigation Links */}
                <nav className="flex items-center gap-4 sm:gap-6">
                    <Link
                        href="/"
                        className={`text-sm font-medium transition-colors hover:text-primary-600 ${pathname === '/' ? 'text-primary-600' : 'text-muted-foreground'}`}
                    >
                        Services
                    </Link>

                    {role === "user" && (
                        <Link
                            href="/appointments"
                            className={`text-sm font-medium transition-colors hover:text-primary-600 ${pathname?.includes('/appointments') ? 'text-primary-600' : 'text-muted-foreground'}`}
                        >
                            My Appointments
                        </Link>
                    )}

                    {role === "provider" && (
                        <Link
                            href="/provider"
                            className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary-600 ${isProvider ? 'text-primary-600' : 'text-muted-foreground'}`}
                        >
                            <Briefcase className="h-4 w-4" />
                            <span className="hidden sm:inline">Provider Dashboard</span>
                        </Link>
                    )}

                    <div className="h-6 w-px bg-border mx-2"></div>

                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-foreground hidden sm:block">
                                Hi, {user.name.split(" ")[0]}
                            </span>
                            <Button variant="ghost" size="sm" onClick={logout} className="gap-2 text-muted-foreground hover:text-foreground">
                                <LogOut className="h-4 w-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link href="/login">
                                <Button variant="ghost" size="sm">Login</Button>
                            </Link>
                            <Link href="/login?role=provider" className="hidden sm:block">
                                <Button variant="outline" size="sm">Provider Login</Button>
                            </Link>
                        </div>
                    )}
                </nav>

            </div>
        </header>
    );
}
