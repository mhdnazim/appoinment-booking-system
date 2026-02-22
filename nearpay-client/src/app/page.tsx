"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Clock, IndianRupee, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const { user, role } = useAuth();
  const router = useRouter();
  const [services, setServices] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4200/api/v1";
        const url = debouncedSearchTerm
          ? `${apiUrl}/services?search=${encodeURIComponent(debouncedSearchTerm)}`
          : `${apiUrl}/services`;

        const res = await axios.get(url);
        if (res.data?.success) {
          setServices(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch services:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchServices();
  }, [debouncedSearchTerm]);

  const handleBookClick = (serviceId: string) => {
    if (!user) {
      router.push("/login?role=user");
    } else if (role === "user") {
      router.push(`/book/${serviceId}`);
    }
  };

  return (
    <div className="flex flex-col flex-1 pb-12">
      {/* Hero Section */}
      <section className="bg-primary-900 text-white py-20 px-6 sm:px-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Professional Services at Your Fingertips
        </h1>
        <p className="text-primary-100 text-lg md:text-xl max-w-2xl mx-auto mb-8">
          Book trusted professionals for your home maintenance, cleaning, and repair needs.
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg" variant="secondary" className="hover:bg-primary-100">
            Explore Services
          </Button>
        </div>
      </section>

      {/* Services Section */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 flex-1">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Featured Services</h2>
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-muted-foreground" />
            </div>
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow"
            />
          </div>
        </div>

        {isFetching ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-muted-foreground">Loading Services...</div>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-xl border border-border">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No services found</h3>
            <p className="text-muted-foreground mt-1 max-w-sm mx-auto">
              {searchTerm ? `We couldn't find any services matching "${searchTerm}". Try a different term or browse categories.` : "There are currently no active services available."}
            </p>
            {searchTerm && (
              <Button variant="outline" className="mt-6" onClick={() => setSearchTerm("")}>Clear Search</Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {services.map((service) => (
              <Card key={service._id} className="flex flex-col overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-2 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                      {service.category || 'General'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold leading-tight line-clamp-2">{service.name}</h3>
                </CardHeader>

                <CardContent className="pb-4 flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <Avatar initials={service.providerId?.name?.charAt(0) || "P"} size="sm" />
                    <span className="text-sm font-medium text-muted-foreground">{service.providerId?.name || "Provider"}</span>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{service.duration} min</span>
                    </div>
                    <div className="flex items-center gap-1 font-semibold text-foreground">
                      <IndianRupee className="w-4 h-4" />
                      <span>{service.price}</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-0 bg-transparent gap-2">
                  {role === "provider" ? (
                    <Button className="w-full" variant="outline" disabled>
                      Providers Cannot Book
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant={user ? "primary" : "secondary"}
                      onClick={() => handleBookClick(service._id)}
                    >
                      {user ? "Book Now" : "Login to Book"}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
