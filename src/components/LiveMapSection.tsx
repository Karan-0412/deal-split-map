import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import InteractiveMap from "./InteractiveMap";
import NearbyRequestsList from "./NearbyRequestsList";

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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Interactive Map */}
          <div className="lg:col-span-2">
            <Card className="shadow-card border-border/50 bg-card/90 backdrop-blur-sm overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-foreground">Live Map</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Real-time view of nearby share requests
                </p>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="h-[400px] flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 rounded-b-xl">
                    <div className="text-white text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                      <p>Loading map...</p>
                    </div>
                  </div>
                ) : (
                  <InteractiveMap
                    userLocation={userLocation}
                    requests={filteredDeals}
                    onMarkerClick={(request) => console.log('Marker clicked:', request)}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Filters & Requests List */}
          <div className="lg:col-span-1 space-y-6">
            {/* Filters */}
            <Card className="shadow-card border-border/50 bg-card/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Filter className="w-4 h-4 text-primary" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Radius */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Radius: {radius} miles
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={radius}
                    onChange={handleRadiusChange}
                    className="w-full h-2 bg-gradient-to-r from-primary to-primary/30 rounded-full appearance-none cursor-pointer range-slider"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>1 mi</span>
                    <span>50 mi</span>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    className="w-full p-2 border border-border rounded-lg bg-background/80 backdrop-blur-sm text-foreground focus:ring-2 focus:ring-primary/20 transition-all"
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
                      className="w-1/2 p-2 border border-border rounded-lg bg-background/80 backdrop-blur-sm focus:ring-2 focus:ring-primary/20 transition-all"
                      value={minPrice ?? ""}
                      onChange={(e) => setMinPrice(e.target.value ? parseFloat(e.target.value) : null)}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-1/2 p-2 border border-border rounded-lg bg-background/80 backdrop-blur-sm focus:ring-2 focus:ring-primary/20 transition-all"
                      value={maxPrice ?? ""}
                      onChange={(e) => setMaxPrice(e.target.value ? parseFloat(e.target.value) : null)}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-border/50">
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredDeals.length} of {allDeals.length} requests
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Nearby Requests List */}
            <Card className="shadow-card border-border/50 bg-card/90 backdrop-blur-sm">
              <CardContent className="p-4">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Loading requests...</p>
                  </div>
                ) : (
                  <NearbyRequestsList
                    requests={filteredDeals}
                    userLocation={userLocation}
                    maxVisible={3}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveMapSection;
