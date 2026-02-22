"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Calendar as CalendarIcon, Clock, IndianRupee, ArrowLeft } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { getCookie } from "@/utils/cookies";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, getDay, isBefore, startOfDay } from "date-fns";

const DAYS_OF_WEEK_MAP: { [key: number]: string } = {
    0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat'
};

const formatTimeAMPM = (timeStr: string) => {
    const [hoursStr, minutesStr] = timeStr.split(":");
    let hours = parseInt(hoursStr, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutesStr} ${ampm}`;
};

export default function BookServicePage({ params }: { params: Promise<{ serviceId: string }> }) {
    const resolvedParams = use(params);
    const serviceId = resolvedParams.serviceId;

    const { user, role, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [service, setService] = useState<any>(null);
    const [availability, setAvailability] = useState<any>(null);
    const [availableSlots, setAvailableSlots] = useState<{ startTime: string, endTime: string }[]>([]);
    const [isFetchingSlots, setIsFetchingSlots] = useState(false);


    const [isFetching, setIsFetching] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        if (!authLoading && role === "provider") {
            router.push("/");
            return;
        }
        if (!authLoading && !user) {
            router.push("/login?role=user");
            return;
        }
    }, [user, role, authLoading, router]);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4200/api/v1";


                const serviceRes = await axios.get(`${apiUrl}/services/${serviceId}`);
                if (!serviceRes.data?.success) {
                    setError("Failed to load service details.");
                    setIsFetching(false);
                    return;
                }
                const serviceData = serviceRes.data.data;
                setService(serviceData);


                if (serviceData.providerId?._id) {
                    const availRes = await axios.get(`${apiUrl}/availability/${serviceData.providerId._id}`);
                    if (availRes.data?.success) {
                        setAvailability(availRes.data.data);
                    }
                }
            } catch (err) {
                console.error("Fetch Error:", err);
                setError("An error occurred while loading booking details.");
            } finally {
                setIsFetching(false);
            }
        };

        if (user && role === "user") {
            fetchDetails();
        }
    }, [serviceId, user, role]);

    useEffect(() => {
        const fetchSlots = async () => {
            if (!selectedDate || !service || !service.providerId?._id) return;

            setIsFetchingSlots(true);
            setAvailableSlots([]);
            setSelectedTime("");

            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4200/api/v1";
                const dateStr = format(selectedDate, "yyyy-MM-dd");
                const res = await axios.get(`${apiUrl}/bookings/available-slots?providerId=${service.providerId._id}&serviceId=${serviceId}&date=${dateStr}`);

                if (res.data?.success) {
                    setAvailableSlots(res.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch slots:", err);
            } finally {
                setIsFetchingSlots(false);
            }
        };

        fetchSlots();
    }, [selectedDate, service, serviceId]);

    if (authLoading || isFetching) {
        return <div className="flex flex-1 items-center justify-center p-12">Loading details...</div>;
    }

    if (error || !service) {
        return (
            <div className="flex flex-1 items-center justify-center p-12 flex-col">
                <p className="text-red-500 mb-4">{error || "Service unavailable"}</p>
                <Link href="/"><Button variant="outline">Back to Services</Button></Link>
            </div>
        );
    }


    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));


    const firstDayOfMonth = startOfMonth(currentMonth);
    const lastDayOfMonth = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth });


    const startingDayIndex = getDay(firstDayOfMonth);
    const emptyDaysBefore = Array(startingDayIndex).fill(null);


    const isDateBookable = (date: Date) => {

        if (isBefore(date, startOfDay(new Date()))) return false;


        if (!availability || !availability.workingDays || availability.workingDays.length === 0) return false;


        const dayOfWeekStr = DAYS_OF_WEEK_MAP[getDay(date)];
        if (!availability.workingDays.includes(dayOfWeekStr)) return false;


        if (availability.blockedDates && availability.blockedDates.length > 0) {
            const isBlocked = availability.blockedDates.some((bDateStr: string) => {
                const bDate = startOfDay(new Date(bDateStr));
                return isSameDay(date, bDate);
            });
            if (isBlocked) return false;
        }

        return true;
    };

    const handleDateSelect = (date: Date) => {
        if (isDateBookable(date)) {
            setSelectedDate(date);
            setError("");
        }
    };

    const handleBooking = async () => {
        if (!selectedDate) {
            setError("Please select a date.");
            return;
        }
        if (!selectedTime) {
            setError("Please select a time.");
            return;
        }


        if (availability?.startTime && availability?.endTime) {
            if (selectedTime < availability.startTime || selectedTime > availability.endTime) {
                setError(`Please select a time between ${availability.startTime} and ${availability.endTime}`);
                return;
            }
        }

        setIsSubmitting(true);
        setError("");
        setSuccessMessage("");

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4200/api/v1";
            const token = getCookie("adminToken");


            const startHour = parseInt(selectedTime.split(":")[0]);
            const startMin = parseInt(selectedTime.split(":")[1]);
            const totalStartMins = startHour * 60 + startMin;
            const totalEndMins = totalStartMins + (Number(service.duration) || 60);

            const endHour = Math.floor(totalEndMins / 60).toString().padStart(2, '0');
            const endMin = (totalEndMins % 60).toString().padStart(2, '0');
            const calculatedEndTime = `${endHour}:${endMin}`;

            const payload = {
                userId: user?.id,
                providerId: service.providerId._id,
                serviceId: service._id,
                date: format(selectedDate, "yyyy-MM-dd"),
                startTime: selectedTime,
                endTime: calculatedEndTime
            };

            await axios.post(`${apiUrl}/bookings`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuccessMessage("Booking successful! Redirecting to your appointments...");
            setTimeout(() => {
                router.push("/appointments");
            }, 2000);

        } catch (err: any) {
            console.error("Booking failed:", err);
            setError(err.response?.data?.message || "Failed to create booking.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto max-w-4xl px-4 py-8 flex-1 pb-16">
            <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Services
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                <div className="md:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">{service.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm text-muted-foreground">
                            <div className="flex justify-between items-center py-2 border-b border-border">
                                <span className="flex items-center gap-2"><IndianRupee className="w-4 h-4" /> Price</span>
                                <span className="font-medium text-foreground">{service.price}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-border">
                                <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> Duration</span>
                                <span className="font-medium text-foreground">{service.duration} mins</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="flex items-center gap-2">Provider</span>
                                <span className="font-medium text-foreground truncate pl-4">{service.providerId?.name}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {availability ? (
                        <Card className="bg-primary-50 border-primary-100 shadow-none">
                            <CardContent className="p-4 pt-4 text-sm text-primary-900">
                                <h4 className="font-semibold mb-2">Provider Working Hours</h4>
                                <p className="mb-1">{availability.workingDays.join(", ")}</p>
                                <p>{availability.startTime} - {availability.endTime}</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="bg-amber-50 border-amber-100 shadow-none">
                            <CardContent className="p-4 pt-4 text-sm text-amber-900">
                                <h4 className="font-semibold mb-2">Notice</h4>
                                <p>This provider has not set their availability yet. Bookings are currently disabled.</p>
                            </CardContent>
                        </Card>
                    )}
                </div>


                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="pb-4 border-b border-border">
                            <CardTitle>Select Date & Time</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">


                            <div className="flex justify-between items-center mb-4">
                                <button onClick={prevMonth} className="p-2 hover:bg-muted rounded-full transition-colors">
                                    &larr;
                                </button>
                                <h3 className="text-lg font-semibold">{format(currentMonth, "MMMM yyyy")}</h3>
                                <button onClick={nextMonth} className="p-2 hover:bg-muted rounded-full transition-colors">
                                    &rarr;
                                </button>
                            </div>


                            <div className="grid grid-cols-7 gap-1 text-center mb-6">

                                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                                    <div key={day} className="text-xs font-semibold text-muted-foreground py-2">
                                        {day}
                                    </div>
                                ))}


                                {emptyDaysBefore.map((_, i) => (
                                    <div key={`empty-${i}`} className="p-2" />
                                ))}


                                {daysInMonth.map((date) => {
                                    const isBookable = isDateBookable(date);
                                    const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
                                    const isPast = isBefore(date, startOfDay(new Date()));

                                    return (
                                        <button
                                            key={date.toString()}
                                            disabled={!isBookable}
                                            onClick={() => handleDateSelect(date)}
                                            className={`
                                                relative p-2 rounded-lg text-sm transition-all
                                                ${isSelected ? "bg-primary-600 text-white font-bold shadow-md transform scale-105" : ""}
                                                ${!isSelected && isBookable ? "hover:bg-primary-100 hover:text-primary-900 cursor-pointer" : ""}
                                                ${!isBookable && !isPast && !isSelected ? "text-muted-foreground/30 cursor-not-allowed bg-muted/20" : ""}
                                                ${isPast ? "text-muted-foreground/20 cursor-not-allowed" : ""}
                                            `}
                                        >
                                            {format(date, "d")}
                                        </button>
                                    );
                                })}
                            </div>


                            {selectedDate && (
                                <div className="mt-6 pt-6 border-t border-border animate-in fade-in slide-in-from-bottom-2">
                                    <label className="block text-sm font-medium mb-3">
                                        Selected Date: <span className="font-bold text-primary-700">{format(selectedDate, "EEEE, MMMM do, yyyy")}</span>
                                    </label>

                                    <label className="block text-sm font-medium mb-2">Select Time</label>

                                    {isFetchingSlots ? (
                                        <div className="text-sm text-muted-foreground py-4">Loading available slots...</div>
                                    ) : availableSlots.length > 0 ? (
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                            {availableSlots.map((slot, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setSelectedTime(slot.startTime)}
                                                    className={`py-2 px-3 border rounded-md text-sm transition-colors ${selectedTime === slot.startTime
                                                        ? "bg-primary-600 border-primary-600 text-white font-medium"
                                                        : "bg-white border-border hover:border-primary-500 hover:text-primary-700"
                                                        }`}
                                                >
                                                    {formatTimeAMPM(slot.startTime)}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200">
                                            No available slots for this date.
                                        </div>
                                    )}

                                    {error && <p className="text-sm text-red-500 mt-4 font-medium">{error}</p>}
                                    {successMessage && <p className="text-sm text-green-600 mt-4 font-medium bg-green-50 p-3 rounded-md border border-green-200">{successMessage}</p>}

                                    <Button
                                        className="w-full mt-8"
                                        size="lg"
                                        onClick={handleBooking}
                                        disabled={isSubmitting || !selectedTime || !availability?.workingDays || availability?.workingDays.length === 0}
                                    >
                                        {isSubmitting ? "Processing..." : "Confirm Booking"}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
