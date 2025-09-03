import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Filter, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useNavigate } from "react-router-dom";

type Category = Database["public"]["Tables"]["categories"]["Row"];
type Request = Database["public"]["Tables"]["requests"]["Row"] & {
  categories: Category;
};

const LiveMapSection = () => {
  const [allDeals, setAllDeals] = useState<Request[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<Request[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState<string>("All");
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [radius, setRadius] = useState<number>(2);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    fetchAllDeals();
    getUserLocation();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [allDeals, category, minPrice, maxPrice, radius, userLocation]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          setUserLocation({ lat: 40.7128, lng: -74.006 }); // fallback NYC
        }
      );
    } else {
      setUserLocation({ lat: 40.7128, lng: -74.006 });
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 3959; // miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase.from("categories").select("*").order("name");
    if (!error && data) setCategories(data);
  };

  const fetchAllDeals = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("requests")
        .select("*, categories (id, name, icon, color)")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching deals:", error);
        setAllDeals([]);
      } else {
        setAllDeals(data as Request[]);
      }
    } catch (err) {
      console.error("Error fetching deals:", err);
      setAllDeals([]);
    }
    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...allDeals];

    // Category filter
    if (category !== "All") {
      filtered = filtered.filter((deal) => deal.categories?.id === category);
    }

    // Price filter
    if (minPrice !== null) {
      filtered = filtered.filter((deal) => (deal.budget_min || 0) >= minPrice);
    }
    if (maxPrice !== null) {
      filtered = filtered.filter((deal) => (deal.budget_max || 0) <= maxPrice);
    }

    // Radius filter
    if (userLocation && radius > 0) {
      filtered = filtered.filter((deal) => {
        if (deal.location_lat && deal.location_lng) {
          const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            deal.location_lat,
            deal.location_lng
          );
          return distance <= radius;
        }
        return true;
      });
    }

    setFilteredDeals(filtered);
  };

  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRadius(parseInt(e.target.value));
  };

  return (
    <section id="map" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
            Nearby share requests
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See what deals people are sharing around you in real-time. Join a request or post your own.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filter Panel */}
          <div className="lg:col-span-1">
            <Card className="shadow-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-primary" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Radius */}
                <div>
                  <label className="block text-sm font-medium mb-2">Radius: {radius} miles</label>
                  <input
  type="range"
  min="1"
  max="50"
  value={radius}
  onChange={handleRadiusChange}
  className="w-full h-2 rounded-full appearance-none cursor-pointer"
  style={{
    background: `linear-gradient(to right, #22c55e ${(radius / 50) * 100}%, #e5e7eb ${(radius / 50) * 100}%)`,
  }}
/>

                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>1 mi</span><span>50 mi</span>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="All">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium mb-2">Price Range</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="w-1/2 p-2 border rounded-lg"
                      value={minPrice ?? ""}
                      onChange={(e) => setMinPrice(e.target.value ? parseFloat(e.target.value) : null)}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-1/2 p-2 border rounded-lg"
                      value={maxPrice ?? ""}
                      onChange={(e) => setMaxPrice(e.target.value ? parseFloat(e.target.value) : null)}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredDeals.length} of {allDeals.length} requests
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Deals List Panel */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary inline-block"></div>
                <p className="mt-2 text-muted-foreground">Loading deals...</p>
              </div>
            ) : filteredDeals.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>No deals found matching your filters.</p>
              </div>
            ) : (
              <Card className="shadow-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Available Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
    className="space-y-4 max-h-[600px] overflow-y-auto pr-2"
    style={{
      scrollbarWidth: "none",        // Firefox
      msOverflowStyle: "none",       // IE/Edge
    }}
  >
    <style>
      {`
        /* Hide scrollbar for Chrome, Safari and Opera */
        div::-webkit-scrollbar {
          display: none;
        }
      `}
    </style>
                    {filteredDeals.map((deal) => {
                      const distance =
                        userLocation && deal.location_lat && deal.location_lng
                          ? calculateDistance(
                              userLocation.lat,
                              userLocation.lng,
                              deal.location_lat,
                              deal.location_lng
                            )
                          : null;

                      return (
                        <Card
                          key={deal.id}
                          className="shadow-sm border border-border hover:shadow-md transition-shadow"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <div className="w-14 h-14 bg-muted rounded-lg flex items-center justify-center">
                                <span className="text-xl">{deal.categories?.icon}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold truncate">
                                  {deal.title || "Untitled Request"}
                                </h4>
                                <p className="text-sm text-muted-foreground mb-1">
                                  Budget: ${deal.budget_min} - ${deal.budget_max}
                                </p>
                                {deal.categories && (
                                  <span className="inline-block px-2 py-1 bg-secondary rounded-full text-xs">
                                    {deal.categories.name}
                                  </span>
                                )}
                                {distance && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                    <MapPin className="w-3 h-3" />
                                    <span>{distance.toFixed(1)} miles away</span>
                                  </div>
                                )}
                                {deal.address && (
                                  <p className="text-xs text-muted-foreground truncate">
                                    {deal.address}
                                  </p>
                                )}
                                <div className="flex gap-2 mt-3 justify-end">
                                  <Button size="sm" className="w-60 bg-primary text-white hover:bg-primary/90">
                                    Join Request
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => navigate(`/chat?requestId=${deal.id}`)}
                                  >
                                    <MessageCircle className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveMapSection;
