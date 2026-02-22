"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Calendar, CheckCircle, IndianRupee, Clock, ArrowUpRight, PlusCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import { getCookie } from "@/utils/cookies";
import { Search, Edit, Trash2, CalendarClock } from "lucide-react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

const formatTimeAMPM = (timeStr: string) => {
    if (!timeStr) return "";
    const [hoursStr, minutesStr] = timeStr.split(":");
    let hours = parseInt(hoursStr, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutesStr} ${ampm}`;
};

export default function ProviderDashboard() {
    const { user, role, isLoading } = useAuth();
    const router = useRouter();
    const [services, setServices] = useState<any[]>([]);
    const [isFetchingServices, setIsFetchingServices] = useState(false);
    const [availability, setAvailability] = useState<any>(null);
    const [isFetchingAvailability, setIsFetchingAvailability] = useState(false);
    const [bookings, setBookings] = useState<any[]>([]);
    const [isFetchingBookings, setIsFetchingBookings] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (!isLoading && role !== "provider") {
            router.push("/login?role=provider");
        }
    }, [role, isLoading, router]);

    const fetchServices = async () => {
        if (!user?.id) return;
        setIsFetchingServices(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4200/api/v1";
            const res = await axios.get(`${apiUrl}/services/provider/${user.id}`);
            if (res.data?.success) {
                setServices(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch services:", error);
        } finally {
            setIsFetchingServices(false);
        }
    };

    const fetchAvailability = async () => {
        if (!user?.id) return;
        setIsFetchingAvailability(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4200/api/v1";
            const res = await axios.get(`${apiUrl}/availability/${user.id}`);
            if (res.data?.success) {
                setAvailability(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch availability:", error);
        } finally {
            setIsFetchingAvailability(false);
        }
    };

    const fetchBookings = async () => {
        if (!user?.id) return;
        setIsFetchingBookings(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4200/api/v1";
            const res = await axios.get(`${apiUrl}/bookings/provider/${user.id}`);
            if (res.data?.success) {
                setBookings(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch bookings:", error);
        } finally {
            setIsFetchingBookings(false);
        }
    };

    useEffect(() => {
        if (user?.id && role === "provider") {
            fetchServices();
            fetchAvailability();
            fetchBookings();
        }
    }, [user, role]);

    const handleDeleteClick = (id: string) => {
        setServiceToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!serviceToDelete) return;
        setIsDeleting(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4200/api/v1";
            const token = getCookie("adminToken");
            await axios.delete(`${apiUrl}/services/${serviceToDelete}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsDeleteModalOpen(false);
            setServiceToDelete(null);
            fetchServices();
        } catch (error) {
            console.error("Failed to delete service:", error);
            alert("Failed to delete service.");
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredServices = services.filter(service =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalAppointments = bookings.length;
    const completedAppointments = bookings.filter(b => b.status === 'completed').length;
    const cancelledAppointments = bookings.filter(b => b.status === 'cancelled').length;

    const getBusiestTime = () => {
        if (bookings.length === 0) return "N/A";
        let morning = 0;
        let afternoon = 0;
        let evening = 0;

        bookings.forEach(b => {
            const hour = parseInt(b.startTime.split(":")[0], 10);
            if (hour < 12) morning++;
            else if (hour < 17) afternoon++;
            else evening++;
        });

        const max = Math.max(morning, afternoon, evening);
        if (max === 0) return "N/A";
        if (max === morning) return "Morning";
        if (max === afternoon) return "Afternoon";
        return "Evening";
    };

    const busiestTimeOfDay = getBusiestTime();

    if (isLoading || role !== "provider") {
        return <div className="flex flex-1 items-center justify-center p-12">Loading Provider Portal...</div>;
    }

    return (
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <Avatar initials={user?.name?.charAt(0) || "P"} size="lg" />
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Welcome back, {user?.name || "Provider"}
                        </h1>
                        <p className="text-muted-foreground">{user?.email || ""}</p>
                    </div>
                </div>
                <Link href="/provider/add-service">
                    <Button className="gap-2">
                        <PlusCircle className="w-4 h-4" />
                        Add New Service
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{totalAppointments}</div>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                            <ArrowUpRight className="w-3 h-3 mr-1" /> All time appointments
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Status Overview</CardTitle>
                        <CheckCircle className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4 mt-1">
                            <div>
                                <div className="text-2xl font-bold text-green-600">{completedAppointments}</div>
                                <div className="text-xs text-muted-foreground font-medium">Completed</div>
                            </div>
                            <div className="w-px h-8 bg-border"></div>
                            <div>
                                <div className="text-2xl font-bold text-red-600">{cancelledAppointments}</div>
                                <div className="text-xs text-muted-foreground font-medium">Cancelled</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Busiest Time</CardTitle>
                        <Clock className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{busiestTimeOfDay}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {busiestTimeOfDay !== "N/A" ? "Peak booking period" : "Not enough data"}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Availability</CardTitle>
                        <CalendarClock className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="flex flex-col h-[calc(100%-3rem)]">
                        {isFetchingAvailability ? (
                            <div className="text-sm text-muted-foreground animate-pulse">Loading...</div>
                        ) : availability ? (
                            <>
                                <div className="text-lg font-bold truncate">
                                    {availability.workingDays?.join(", ") || "No Days Set"}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 mb-2">
                                    {formatTimeAMPM(availability.startTime)} - {formatTimeAMPM(availability.endTime)}
                                </p>
                                {availability.blockedDates?.length > 0 && (
                                    <p className="text-xs text-red-500 font-medium mb-4">
                                        {availability.blockedDates.length} Blocked Date{availability.blockedDates.length !== 1 ? 's' : ''}
                                    </p>
                                )}
                            </>
                        ) : (
                            <div className="text-sm text-muted-foreground mb-4">
                                No availability set
                            </div>
                        )}
                        <Link href="/provider/manage-availability" className="mt-auto pointer-events-auto">
                            <Button variant="outline" size="sm" className="w-full text-xs">
                                Manage Schedule
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold tracking-tight">Recent Bookings</h2>
                        <Link href="/provider/bookings">
                            <Button variant="ghost" size="sm">View All</Button>
                        </Link>
                    </div>

                    <Card>
                        {isFetchingBookings ? (
                            <div className="p-8 text-center text-sm text-muted-foreground">Loading recent bookings...</div>
                        ) : bookings.length === 0 ? (
                            <div className="p-8 text-center text-sm text-muted-foreground">No bookings found.</div>
                        ) : (
                            <div className="divide-y divide-border">
                                {bookings.map((booking) => (
                                    <div key={booking._id} className="p-4 sm:px-6 py-5 flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            <Avatar initials={booking.userId?.name?.charAt(0) || "U"} />
                                            <div>
                                                <h4 className="font-medium">{booking.userId?.name || "Customer"}</h4>
                                                <p className="text-sm text-foreground/80 mt-1">{booking.serviceId?.name || "Service"}</p>
                                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" /> {new Date(booking.date).toLocaleDateString()}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> {formatTimeAMPM(booking.startTime)} - {formatTimeAMPM(booking.endTime)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="font-semibold text-sm">₹{booking.serviceId?.price || 0}</span>
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${booking.status === 'completed'
                                                ? 'bg-green-100 text-green-700'
                                                : booking.status === 'cancelled'
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>

                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h2 className="text-xl font-bold tracking-tight">My Services</h2>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search services..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        {isFetchingServices ? (
                            <div className="text-center p-8 text-sm text-muted-foreground flex flex-col items-center">
                                <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-2"></span>
                                Loading services...
                            </div>
                        ) : filteredServices.length > 0 ? (
                            filteredServices.map(service => (
                                <Card key={service._id} className="overflow-hidden">
                                    <div className="flex gap-4 p-4">
                                        <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-primary-50 flex items-center justify-center text-primary-600 font-bold text-xl">
                                            {service.name.charAt(0)}
                                        </div>
                                        <div className="flex flex-col justify-center flex-1">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-medium text-sm leading-tight mb-1">{service.name}</h4>
                                                <div className="flex gap-2">
                                                    <Link href={`/provider/edit-service/${service._id}`} className="text-muted-foreground hover:text-blue-600 transition-colors p-1">
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                    <button onClick={() => handleDeleteClick(service._id)} className="text-muted-foreground hover:text-red-600 transition-colors p-1">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between mt-auto pt-2">
                                                <span className="text-xs font-semibold">Price: ₹{service.price}</span>
                                                <span className="text-xs text-muted-foreground">Duration: {service.duration} mins</span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <div className="text-center p-8 text-sm text-muted-foreground border border-dashed rounded-lg bg-slate-50">
                                {searchQuery ? "No services match your search." : "You haven't added any services yet."}
                            </div>
                        )}

                        <Link href="/provider/add-service" className="w-full">
                            <Button variant="outline" className="w-full border-dashed">
                                + Add Service
                            </Button>
                        </Link>
                    </div>
                </div>

                <ConfirmModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                    title="Delete Service"
                    description="Are you sure you want to delete this service? This action cannot be undone."
                    confirmText="Delete"
                    isDestructive={true}
                    isLoading={isDeleting}
                />

            </div>
        </div>
    );
}
