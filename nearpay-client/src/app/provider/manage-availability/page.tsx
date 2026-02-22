"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import * as v from "valibot";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { CalendarClock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { getCookie } from "@/utils/cookies";

const availabilitySchema = v.object({
    workingDays: v.pipe(
        v.array(v.string()),
        v.minLength(1, "Please select at least one working day")
    ),
    startTime: v.string("Start time is required"),
    endTime: v.string("End time is required"),
    blockedDates: v.optional(v.array(v.string())),
});

type AvailabilityFormData = v.InferOutput<typeof availabilitySchema>;

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ManageAvailabilityPage() {
    const router = useRouter();
    const { user, role, isLoading: authLoading } = useAuth();
    const [submitError, setSubmitError] = useState("");
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [isExistingRecord, setIsExistingRecord] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<AvailabilityFormData>({
        resolver: valibotResolver(availabilitySchema),
        defaultValues: {
            workingDays: [],
            startTime: "09:00",
            endTime: "17:00",
            blockedDates: [],
        },
    });

    const selectedDays = watch("workingDays");

    useEffect(() => {
        if (!authLoading && role !== "provider") {
            router.push("/login?role=provider");
        }
    }, [role, authLoading, router]);

    useEffect(() => {
        const fetchAvailabilityData = async () => {
            if (!user?.id) return;
            try {
                setIsFetching(true);
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4200/api/v1";
                const res = await axios.get(`${apiUrl}/availability/${user.id}`);

                if (res.data?.success && res.data?.data) {
                    setIsExistingRecord(true);
                    const availability = res.data.data;
                    reset({
                        workingDays: availability.workingDays || [],
                        startTime: availability.startTime || "09:00",
                        endTime: availability.endTime || "17:00",
                        blockedDates: availability.blockedDates ? availability.blockedDates.map((d: string) => new Date(d).toISOString().split('T')[0]) : [],
                    });
                } else {
                    setIsExistingRecord(false);
                }
            } catch (error) {
                setIsExistingRecord(false);
            } finally {
                setIsFetching(false);
            }
        };

        if (user?.id) {
            fetchAvailabilityData();
        }
    }, [user, reset]);

    if (authLoading || role !== "provider" || isFetching) {
        return <div className="flex flex-1 items-center justify-center p-12">Loading Availability Settings...</div>;
    }

    const toggleDay = (day: string) => {
        const currentDays = [...selectedDays];
        if (currentDays.includes(day)) {
            setValue("workingDays", currentDays.filter(d => d !== day), { shouldValidate: true });
        } else {
            setValue("workingDays", [...currentDays, day], { shouldValidate: true });
        }
    };

    const blockedDatesList = watch("blockedDates") || [];

    const addBlockedDate = (dateStr: string) => {
        if (!dateStr || blockedDatesList.includes(dateStr)) return;
        setValue("blockedDates", [...blockedDatesList, dateStr]);
    };

    const removeBlockedDate = (dateToRemove: string) => {
        setValue("blockedDates", blockedDatesList.filter(d => d !== dateToRemove));
    };

    const onSubmit = async (data: AvailabilityFormData) => {
        setSubmitError("");
        setSubmitSuccess(false);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4200/api/v1";
            const token = getCookie("adminToken");

            const payload = {
                ...data,
                providerId: user?.id
            };

            if (isExistingRecord) {
                await axios.put(`${apiUrl}/availability/${user?.id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(`${apiUrl}/availability`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            setSubmitSuccess(true);
            setTimeout(() => {
                router.push("/provider");
            }, 1500);
        } catch (error: any) {
            if (error.response?.data?.message) {
                setSubmitError(error.response.data.message);
            } else {
                setSubmitError("Failed to save availability. Please try again.");
            }
        }
    };

    return (
        <div className="flex flex-1 items-center justify-center p-6 bg-muted mt-8 mb-8">
            <Card className="w-full max-w-lg shadow-lg border-none relative">
                <Link href="/provider" className="absolute top-6 left-6 text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <CardHeader className="text-center pb-6 pt-10">
                    <div className="mx-auto w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-4 transition-colors">
                        <CalendarClock className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-2xl font-bold">
                        Manage Availability
                    </CardTitle>
                    <CardDescription className="mt-2 text-sm text-muted-foreground">
                        Set the days and hours you are available for bookings.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        <div className="space-y-3">
                            <label className="text-sm font-medium block text-left">Working Days</label>
                            <div className="flex flex-wrap gap-2">
                                {DAYS_OF_WEEK.map(day => {
                                    const isSelected = selectedDays.includes(day);
                                    return (
                                        <button
                                            key={day}
                                            type="button"
                                            onClick={() => toggleDay(day)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${isSelected
                                                ? "bg-primary-600 border-primary-600 text-white shadow-sm"
                                                : "bg-white border-border text-foreground hover:bg-muted"
                                                }`}
                                        >
                                            {day}
                                        </button>
                                    );
                                })}
                            </div>
                            {errors.workingDays && (
                                <p className="text-xs text-red-500 text-left mt-1">{errors.workingDays.message}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium block text-left">Start Time</label>
                                <Controller
                                    name="startTime"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            type="time"
                                            className={`w-full px-3 py-2 border rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 border-border ${errors.startTime ? "border-red-500" : ""
                                                }`}
                                        />
                                    )}
                                />
                                {errors.startTime && <p className="text-xs text-red-500 text-left">{errors.startTime.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium block text-left">End Time</label>
                                <Controller
                                    name="endTime"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            type="time"
                                            className={`w-full px-3 py-2 border rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 border-border ${errors.endTime ? "border-red-500" : ""
                                                }`}
                                        />
                                    )}
                                />
                                {errors.endTime && <p className="text-xs text-red-500 text-left">{errors.endTime.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <label className="text-sm font-medium block text-left">Blocked Dates (Holidays, Time Off)</label>
                            <div className="flex gap-2">
                                <input
                                    type="date"
                                    id="blockedDateInput"
                                    className="px-3 py-2 border border-border rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => {
                                        const input = document.getElementById("blockedDateInput") as HTMLInputElement;
                                        if (input.value) {
                                            addBlockedDate(input.value);
                                            input.value = "";
                                        }
                                    }}
                                >
                                    Add Date
                                </Button>
                            </div>

                            {blockedDatesList.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {blockedDatesList.map(dateStr => (
                                        <div key={dateStr} className="flex items-center gap-1 bg-muted px-3 py-1.5 rounded-md border border-border text-sm">
                                            <span>{new Date(dateStr).toLocaleDateString()}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeBlockedDate(dateStr)}
                                                className="text-muted-foreground hover:text-red-500 ml-1 font-bold"
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {submitError && (
                            <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-md text-sm text-center">
                                {submitError}
                            </div>
                        )}

                        {submitSuccess && (
                            <div className="p-3 bg-green-50 text-green-600 border border-green-200 rounded-md text-sm text-center">
                                Availability saved successfully! Redirecting...
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full font-semibold mt-6"
                            size="lg"
                            disabled={isSubmitting || submitSuccess}
                        >
                            {isSubmitting ? "Saving..." : "Save Availability"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
