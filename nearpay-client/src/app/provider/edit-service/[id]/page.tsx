"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import * as v from "valibot";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { Edit, ArrowLeft } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { getCookie } from "@/utils/cookies";

const serviceSchema = v.object({
    name: v.pipe(v.string(), v.minLength(1, "Service name is required")),
    duration: v.pipe(v.number(), v.minValue(1, "Duration must be at least 1 minute")),
    price: v.pipe(v.number(), v.minValue(0, "Price cannot be negative")),
});

type ServiceFormData = v.InferOutput<typeof serviceSchema>;

export default function EditServicePage() {
    const router = useRouter();
    const params = useParams();
    const serviceId = params?.id as string;
    const { role, isLoading: authLoading } = useAuth();
    const [submitError, setSubmitError] = useState("");
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ServiceFormData>({
        resolver: valibotResolver(serviceSchema),
        defaultValues: {
            name: "",
            duration: 30,
            price: 0,
        },
    });

    useEffect(() => {
        if (!authLoading && role !== "provider") {
            router.push("/login?role=provider");
        }
    }, [role, authLoading, router]);

    useEffect(() => {
        const fetchServiceData = async () => {
            if (!serviceId) return;
            try {
                setIsFetching(true);
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4200/api/v1";
                const res = await axios.get(`${apiUrl}/services/${serviceId}`);
                if (res.data?.success && res.data?.data) {
                    const service = res.data.data;
                    reset({
                        name: service.name,
                        duration: service.duration,
                        price: service.price,
                    });
                }
            } catch (error) {
                console.error("Failed to fetch service details:", error);
                setSubmitError("Failed to load service details.");
            } finally {
                setIsFetching(false);
            }
        };

        fetchServiceData();
    }, [serviceId, reset]);

    if (authLoading || role !== "provider" || isFetching) {
        return <div className="flex flex-1 items-center justify-center p-12">Loading Edit Service Portal...</div>;
    }

    const onSubmit = async (data: ServiceFormData) => {
        setSubmitError("");
        setSubmitSuccess(false);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4200/api/v1";
            const token = getCookie("adminToken");

            await axios.put(`${apiUrl}/services/${serviceId}`, data, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setSubmitSuccess(true);
            setTimeout(() => {
                router.push("/provider");
            }, 1500);
        } catch (error: any) {
            if (error.response?.data?.message) {
                setSubmitError(error.response.data.message);
            } else {
                setSubmitError("Failed to update service. Please try again.");
            }
        }
    };

    return (
        <div className="flex flex-1 items-center justify-center p-6 bg-muted mt-8 mb-8">
            <Card className="w-full max-w-md shadow-lg border-none relative">
                <Link href="/provider" className="absolute top-6 left-6 text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <CardHeader className="text-center pb-8 pt-10">
                    <div className="mx-auto w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-4 transition-colors">
                        <Edit className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-2xl font-bold">
                        Edit Service
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">
                        Update the details of your service offering.
                    </p>
                </CardHeader>

                <CardContent className="space-y-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium block text-left">Service Name</label>
                            <Controller
                                name="name"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="text"
                                        placeholder="e.g. Haircut, Consultation"
                                        className={`w-full px-3 py-2 border rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 border-border ${errors.name ? "border-red-500" : ""
                                            }`}
                                    />
                                )}
                            />
                            {errors.name && <p className="text-xs text-red-500 text-left">{errors.name.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium block text-left">Duration (mins)</label>
                                <Controller
                                    name="duration"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            type="number"
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            className={`w-full px-3 py-2 border rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 border-border ${errors.duration ? "border-red-500" : ""
                                                }`}
                                        />
                                    )}
                                />
                                {errors.duration && <p className="text-xs text-red-500 text-left">{errors.duration.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium block text-left">Price (₹)</label>
                                <Controller
                                    name="price"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            type="number"
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            className={`w-full px-3 py-2 border rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 border-border ${errors.price ? "border-red-500" : ""
                                                }`}
                                        />
                                    )}
                                />
                                {errors.price && <p className="text-xs text-red-500 text-left">{errors.price.message}</p>}
                            </div>
                        </div>

                        {submitError && (
                            <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-md text-sm text-center">
                                {submitError}
                            </div>
                        )}

                        {submitSuccess && (
                            <div className="p-3 bg-green-50 text-green-600 border border-green-200 rounded-md text-sm text-center">
                                Service updated successfully! Redirecting...
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full font-semibold mt-4"
                            size="lg"
                            disabled={isSubmitting || submitSuccess}
                        >
                            {isSubmitting ? "Updating Service..." : "Update Service"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
