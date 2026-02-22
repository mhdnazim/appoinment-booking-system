"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Calendar, Clock, XCircle, IndianRupee } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import axios from "axios";
import { getCookie } from "@/utils/cookies";

import { ConfirmModal } from "@/components/ui/ConfirmModal";

export default function AppointmentsPage() {
    const { user, role, isLoading } = useAuth();
    const router = useRouter();
    const [bookings, setBookings] = useState<any[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [cancelModal, setCancelModal] = useState<{ isOpen: boolean, bookingId: string | null, isCancelling: boolean }>({
        isOpen: false,
        bookingId: null,
        isCancelling: false
    });
    const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "past" | "cancelled">("upcoming");

    const isFutureBooking = (dateStr: string, timeStr: string) => {
        const bookingDate = new Date(dateStr);
        const [hours, minutes] = timeStr.split(':').map(Number);
        bookingDate.setHours(hours, minutes, 0, 0);
        return bookingDate > new Date();
    };

    useEffect(() => {
        if (!isLoading && role !== "user") {
            router.push("/login?role=user");
        }
    }, [role, isLoading, router]);

    const fetchBookings = async () => {
        if (!user?.id) return;
        setIsFetching(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4200/api/v1";
            const res = await axios.get(`${apiUrl}/bookings/user/${user.id}`);
            if (res.data?.success) {
                setBookings(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch bookings:", error);
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        if (user?.id && role === "user") {
            fetchBookings();
        }
    }, [user, role]);

    if (isLoading || role !== "user" || isFetching) {
        return <div className="flex flex-1 items-center justify-center p-12">Loading Appointments...</div>;
    }

    const openCancelModal = (id: string) => {
        setCancelModal({ isOpen: true, bookingId: id, isCancelling: false });
    };

    const handleConfirmCancel = async () => {
        if (!cancelModal.bookingId) return;
        setCancelModal(prev => ({ ...prev, isCancelling: true }));

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4200/api/v1";
            const token = getCookie("adminToken");
            await axios.patch(`${apiUrl}/bookings/${cancelModal.bookingId}/status`, { status: 'cancelled' }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchBookings();
            setCancelModal({ isOpen: false, bookingId: null, isCancelling: false });
        } catch (error) {
            console.error("Failed to cancel booking:", error);
            alert("Failed to cancel booking.");
            setCancelModal(prev => ({ ...prev, isCancelling: false }));
        }
    };

    const filteredBookings = bookings.filter(booking => {
        if (activeTab === "all") return true;
        if (activeTab === "cancelled") return booking.status === "cancelled";

        const isFuture = isFutureBooking(booking.date, booking.startTime);

        if (activeTab === "upcoming") {
            return booking.status === "booked" && isFuture;
        }
        if (activeTab === "past") {
            return booking.status === "completed" || (booking.status === "booked" && !isFuture);
        }

        return true;
    });

    return (
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 flex-1">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">My Appointments</h1>
                <p className="text-muted-foreground mt-2">Manage your upcoming and past service bookings.</p>
            </div>

            {bookings.length === 0 ? (
                <Card className="text-center py-12">
                    <CardContent>
                        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium">No appointments yet</h3>
                        <p className="text-muted-foreground mt-1 mb-6">Looks like you haven't booked any services.</p>
                        <Button onClick={() => router.push("/")}>Explore Services</Button>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="flex space-x-2 mb-6 border-b border-border pb-2 overflow-x-auto">
                        {(["upcoming", "past", "cancelled", "all"] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                    }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    {filteredBookings.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No {activeTab} appointments found.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredBookings.map((booking) => (
                                <Card key={booking._id} className="overflow-hidden">
                                    <div className="flex flex-col sm:flex-row gap-4 p-4 sm:p-6">

                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                                                <Avatar initials={booking.serviceId?.name?.charAt(0) || "S"} size="md" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg leading-tight">{booking.serviceId?.name || "Service"}</h3>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" /> {new Date(booking.date).toLocaleDateString()}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" /> {booking.startTime} - {booking.endTime}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 border-t sm:border-t-0 sm:border-l border-border pt-4 sm:pt-0 sm:pl-6 min-w-[140px]">
                                            <div className="flex flex-col items-start sm:items-end">
                                                <span className="font-bold text-lg flex items-center">
                                                    <IndianRupee className="w-4 h-4 mr-0.5" />{booking.serviceId?.price || 0}
                                                </span>
                                                <span className={`text-xs px-2 py-0.5 mt-1 rounded-full font-medium ${booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                    booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                        'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {booking.status.toUpperCase()}
                                                </span>
                                            </div>

                                            {booking.status === 'booked' && isFutureBooking(booking.date, booking.startTime) && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openCancelModal(booking._id)}
                                                    className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                                >
                                                    <XCircle className="w-4 h-4 mr-1" />
                                                    Cancel
                                                </Button>
                                            )}
                                        </div>

                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </>
            )}
            <ConfirmModal
                isOpen={cancelModal.isOpen}
                onClose={() => setCancelModal({ isOpen: false, bookingId: null, isCancelling: false })}
                onConfirm={handleConfirmCancel}
                title="Cancel Appointment"
                description="Are you sure you want to cancel this appointment? This action cannot be undone."
                confirmText="Yes, Cancel"
                isDestructive={true}
                isLoading={cancelModal.isCancelling}
            />
        </div>
    );
}
