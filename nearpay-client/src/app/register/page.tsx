"use client";

import { useState, Suspense } from "react";
import { useForm, Controller } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import * as v from "valibot";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth, Role } from "@/contexts/AuthContext";
import { ShieldCheck, User } from "lucide-react";
import Link from "next/link";

const registerSchema = v.object({
    name: v.pipe(v.string(), v.minLength(1, "Name is required")),
    email: v.pipe(v.string(), v.email("Please provide a valid email address")),
    password: v.pipe(v.string(), v.minLength(6, "Password must be at least 6 characters long")),
    role: v.picklist(["user", "provider"]),
});

type RegisterFormData = v.InferOutput<typeof registerSchema>;

function RegisterContent() {
    const router = useRouter();
    const { login } = useAuth();
    const [submitError, setSubmitError] = useState("");

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormData>({
        resolver: valibotResolver(registerSchema),
        defaultValues: {
            role: "user",
            name: "",
            email: "",
            password: "",
        },
    });

    const currentRole = watch("role");

    const onSubmit = async (data: RegisterFormData) => {
        setSubmitError("");
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4200/api/v1";
        try {
            const response = await axios.post(`${apiUrl}/auth/register`, data);

            if (response.data.success) {
                try {
                    await login(data.email, data.password);
                } catch (loginError) {
                    setSubmitError("Registration successful, but auto-login failed. Please manually log in.");
                }
            }
        } catch (error: any) {
            if (error.response?.data?.errors) {
                const msgs = error.response.data.errors.map((err: any) => err.message).join(", ");
                setSubmitError(msgs);
            } else if (error.response?.data?.message) {
                setSubmitError(error.response.data.message);
            } else {
                setSubmitError("An unexpected error occurred. Please try again.");
            }
        }
    };

    return (
        <div className="flex flex-1 items-center justify-center p-6 bg-muted">
            <Card className="w-full max-w-md shadow-lg border-none">
                <CardHeader className="text-center pb-6 pt-8">
                    <div className="mx-auto w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-4 transition-colors">
                        {currentRole === "provider" ? <ShieldCheck className="w-6 h-6" /> : <User className="w-6 h-6" />}
                    </div>
                    <CardTitle className="text-2xl font-bold">
                        Create an Account
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">
                        Get started as a {currentRole === "provider" ? "service provider" : "user"}.
                    </p>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="flex p-1 bg-muted rounded-lg">
                        <button
                            type="button"
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${currentRole === 'user' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                                }`}
                            onClick={() => setValue("role", "user")}
                        >
                            User
                        </button>
                        <button
                            type="button"
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${currentRole === 'provider' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                                }`}
                            onClick={() => setValue("role", "provider")}
                        >
                            Provider
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-left block">
                                {currentRole === "provider" ? "Business Name" : "Full Name"}
                            </label>
                            <Controller
                                name="name"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="text"
                                        placeholder={currentRole === "provider" ? "Business or Provider Name" : "John Doe"}
                                        className={`w-full px-3 py-2 border rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.name ? "border-red-500" : "border-border"
                                            }`}
                                    />
                                )}
                            />
                            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-left block">Email Address</label>
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
                            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-left block">Password</label>
                            <Controller
                                name="password"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="password"
                                        placeholder="Create a password"
                                        className={`w-full px-3 py-2 border rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.password ? "border-red-500" : "border-border"
                                            }`}
                                    />
                                )}
                            />
                            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
                        </div>

                        {submitError && (
                            <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-md text-sm text-center">
                                {submitError}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full font-semibold mt-6"
                            size="lg"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Registering..." : `Register as ${currentRole === "provider" ? "Provider" : "User"}`}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="flex flex-col gap-4 pb-8 border-t pt-6 bg-slate-50/50 rounded-b-xl border-x-0 border-b-0 border-border">
                    <div className="text-center text-sm">
                        Already have an account?{" "}
                        <Link href="/login" className="text-primary-600 font-medium hover:underline">
                            Log in instead
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="flex flex-1 items-center justify-center p-6 bg-muted">Loading...</div>}>
            <RegisterContent />
        </Suspense>
    );
}
