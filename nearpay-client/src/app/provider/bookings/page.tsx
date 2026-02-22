"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { getCookie } from "@/utils/cookies";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Calendar, Clock, ArrowLeft, Check, X } from "lucide-react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

export default function ProviderBookingsPage() {
    const { user, role, isLoading } = useAuth();
    const router = useRouter();

    const [bookings, setBookings] = useState<any[]>([]);
    const [isFetchingBookings, setIsFetchingBookings] = useState(true);
    const [actionModal, setActionModal] = useState<{ isOpen: boolean; bookingId: string; newStatus: "completed" | "cancelled" | null }>({
        isOpen: false,
        bookingId: "",
        newStatus: null
    });
    const [isUpdating, setIsUpdating] = useState(false);
    const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "past" | "cancelled">("upcoming");

    const isFutureBooking = (dateStr: string, timeStr: string) => {
        const bookingDate = new Date(dateStr);
        const [hours, minutes] = timeStr.split(':').map(Number);
        bookingDate.setHours(hours, minutes, 0, 0);
        return bookingDate > new Date();
    };

    useEffect(() => {
        if (!isLoading && role !== "provider") {
            router.push("/login?role=provider");
        }
    }, [role, isLoading, router]);

    const fetchBookings = async () => {
        if (!user?.id) return;
        setIsFetchingBookings(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4200/api/v1";
            const res = await axios.get(`${apiUrl}/bookings/provider/${user.id}`);
            if (res.data?.success) {
                const sorted = res.data.data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setBookings(sorted);
            }
        } catch (error) {
            console.error("Failed to fetch bookings:", error);
        } finally {
            setIsFetchingBookings(false);
        }
    };

    useEffect(() => {
        if (user?.id && role === "provider") {
            fetchBookings();
        }
    }, [user, role]);

    const handleActionClick = (id: string, status: "completed" | "cancelled") => {
        setActionModal({ isOpen: true, bookingId: id, newStatus: status });
    };

    const confirmAction = async () => {
        if (!actionModal.bookingId || !actionModal.newStatus) return;

        setIsUpdating(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4200/api/v1";
            const token = getCookie("adminToken");
            await axios.patch(
                `${apiUrl}/bookings/${actionModal.bookingId}/status`,
                { status: actionModal.newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            fetchBookings();
            setActionModal({ isOpen: false, bookingId: "", newStatus: null });
        } catch (error) {
            console.error(`Failed to mark booking as ${actionModal.newStatus}:`, error);
            alert(`Failed to update booking status.`);
        } finally {
            setIsUpdating(false);
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

    if (isLoading || role !== "provider") {
        return <div className="flex flex-1 items-center justify-center p-12">Loading...</div>;
    }

    return (
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 flex-1">
            <Link href="/provider" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </Link>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Manage Bookings</h1>
                    <p className="text-muted-foreground mt-1">View and manage all your customer appointments.</p>
                </div>
            </div>

            <Card className="shadow-sm">
                <CardHeader className="bg-muted/30 border-b border-border">
                    <CardTitle className="text-lg">All Bookings</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {isFetchingBookings ? (
                        <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                            <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></span>
                            Loading bookings...
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="p-16 text-center text-muted-foreground">
                            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                            <h3 className="text-lg font-medium text-foreground">No bookings found</h3>
                            <p className="mt-1">You don't have any customer bookings right now.</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex space-x-2 px-6 pt-6 pb-2 border-b border-border overflow-x-auto">
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
                                <div className="p-16 text-center text-muted-foreground">
                                    No {activeTab} bookings found.
                                </div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {filteredBookings.map((booking) => (
                                        <div key={booking._id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-muted/10 transition-colors">
                                            <div className="flex items-start gap-4 flex-1">
                                                <Avatar initials={booking.userId?.name?.charAt(0) || "U"} size="md" />
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-lg">{booking.userId?.name || "Customer"}</h4>
                                                    <p className="text-sm font-medium text-primary-700 mt-1">{booking.serviceId?.name || "Service"}</p>

                                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 text-sm text-muted-foreground">
                                                        <span className="flex items-center gap-1.5 font-medium">
                                                            <Calendar className="w-4 h-4" /> {new Date(booking.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                                        </span>
                                                        <span className="flex items-center gap-1.5 font-medium">
                                                            <Clock className="w-4 h-4" /> {booking.startTime} - {booking.endTime}
                                                        </span>
                                                        <span className="font-semibold text-foreground">
                                                            ₹{booking.serviceId?.price || 0}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
                                                <div className="w-full sm:w-auto text-left sm:text-right">
                                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${booking.status === 'completed'
                                                        ? 'bg-green-100 text-green-700'
                                                        : booking.status === 'cancelled'
                                                            ? 'bg-red-100 text-red-700'
                                                            : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {booking.status}
                                                    </span>
                                                </div>

                                                {booking.status === 'booked' && (
                                                    <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="w-full sm:w-auto text-green-700 hover:text-green-800 hover:bg-green-50 border-green-200"
                                                            onClick={() => handleActionClick(booking._id, "completed")}
                                                        >
                                                            <Check className="w-4 h-4 mr-1" /> Complete
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                                            onClick={() => handleActionClick(booking._id, "cancelled")}
                                                        >
                                                            <X className="w-4 h-4 mr-1" /> Cancel
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            <ConfirmModal
                isOpen={actionModal.isOpen}
                onClose={() => setActionModal({ isOpen: false, bookingId: "", newStatus: null })}
                onConfirm={confirmAction}
                title={actionModal.newStatus === "completed" ? "Complete Booking" : "Cancel Booking"}
                description={`Are you sure you want to mark this booking as ${actionModal.newStatus}? This action will update the booking status for both you and the customer.`}
                confirmText={actionModal.newStatus === "completed" ? "Mark as Completed" : "Cancel Booking"}
                isDestructive={actionModal.newStatus === "cancelled"}
                isLoading={isUpdating}
            />
        </div>
    );
}
