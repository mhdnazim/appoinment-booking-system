"use client";

import { useState, Suspense } from "react";
import { useForm, Controller } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import * as v from "valibot";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth, Role } from "@/contexts/AuthContext";
import { ShieldCheck, User } from "lucide-react";
import Link from "next/link";

const loginSchema = v.object({
    email: v.pipe(v.string(), v.email("Please provide a valid email address")),
    password: v.pipe(v.string(), v.minLength(1, "Password is required")),
});

type LoginFormData = v.InferOutput<typeof loginSchema>;

function LoginContent() {
    const searchParams = useSearchParams();
    const requestedRole = searchParams?.get("role") as Role || "user";
    const { login } = useAuth();
    const [submitError, setSubmitError] = useState("");

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: valibotResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (data: LoginFormData) => {
        setSubmitError("");
        try {
            await login(data.email, data.password);
        } catch (error: any) {
            if (error.response?.data?.message) {
                setSubmitError(error.response.data.message);
            } else {
                setSubmitError("Invalid email or password. Please try again.");
            }
        }
    };

    return (
        <div className="flex flex-1 items-center justify-center p-6 bg-muted">
            <Card className="w-full max-w-md shadow-lg border-none">
                <CardHeader className="text-center pb-8 pt-8">
                    <div className="mx-auto w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-4 transition-colors">
                        {requestedRole === "provider" ? <ShieldCheck className="w-6 h-6" /> : <User className="w-6 h-6" />}
                    </div>
                    <CardTitle className="text-2xl font-bold">
                        {requestedRole === "provider" ? "Provider Portal" : "Welcome Back"}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">
                        Sign in to start managing your {requestedRole === "provider" ? "services" : "bookings"}.
                    </p>
                </CardHeader>

                <CardContent className="space-y-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium block text-left">Email Address</label>
                            <Controller
                                name="email"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="email"
                                        placeholder="name@example.com"
                                        className={`w-full px-3 py-2 border rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.email ? "border-red-500" : "border-border"
                                            }`}
                                    />
                                )}
                            />
                            {errors.email && <p className="text-xs text-red-500 text-left">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium block text-left">Password</label>
                            <Controller
                                name="password"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="password"
                                        placeholder="••••••••"
                                        className={`w-full px-3 py-2 border rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.password ? "border-red-500" : "border-border"
                                            }`}
                                    />
                                )}
                            />
                            {errors.password && <p className="text-xs text-red-500 text-left">{errors.password.message}</p>}
                        </div>

                        {submitError && (
                            <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-md text-sm text-center">
                                {submitError}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full font-semibold mt-4"
                            size="lg"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Signing in..." : `Sign In as ${requestedRole === "provider" ? "Provider" : "User"}`}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="flex flex-col gap-4 pb-8 border-t pt-6 bg-slate-50/50 rounded-b-xl border-x-0 border-b-0 border-border">
                    <div className="text-center text-sm">
                        Don't have an account?{" "}
                        <Link href="/register" className="text-primary-600 font-medium hover:underline">
                            Register here
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="flex flex-1 items-center justify-center p-6 bg-muted">Loading...</div>}>
            <LoginContent />
        </Suspense>
    );
}
