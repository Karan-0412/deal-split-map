import { useState, useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Filter, MessageCircle, Search, DollarSign, Map, X } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useNavigate } from 'react-router-dom';

// Global type declaration for Google Maps markers
declare global {
  interface Window {
    googleMapMarkers: google.maps.Marker[];
  }
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface Request {
  id: string;
  title: string;
  description: string;
  location_lat: number;
  location_lng: number;
  address: string;
  budget_min: number;
  budget_max: number;
  categories: Category;
  user_id: string; // 👈 add this line
  profiles: {
    display_name: string;
    avatar_url: string;
  };
}

const MapPage = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [budgetRange, setBudgetRange] = useState<[number, number]>([0, 10000]);
  const [locationFilter, setLocationFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'budget-high' | 'budget-low'>('recent');

  useEffect(() => {
    initializeMap();
    fetchCategories();
    fetchRequests();
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && filteredRequests.length > 0) {
      addMarkersToMap();
    }
  }, [filteredRequests]);

  useEffect(() => {
    applyFilters();
  }, [requests, selectedCategory, searchQuery, budgetRange, locationFilter, sortBy]);

  const applyFilters = () => {
    let filtered = [...requests];

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(req => req.categories.id === selectedCategory);
    }

    // Search query filter
    if (searchQuery) {
      filtered = filtered.filter(req => 
        req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Budget filter
    filtered = filtered.filter(req => 
      req.budget_min >= budgetRange[0] && req.budget_max <= budgetRange[1]
    );

    // Location filter
    if (locationFilter) {
      filtered = filtered.filter(req => 
        req.address.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    // Sorting
    switch (sortBy) {
      case 'budget-high':
        filtered.sort((a, b) => b.budget_max - a.budget_max);
        break;
      case 'budget-low':
        filtered.sort((a, b) => a.budget_min - b.budget_min);
        break;
      case 'recent':
      default:
        // Assuming there's a created_at field, otherwise keep original order
        break;
    }

    setFilteredRequests(filtered);
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSearchQuery('');
    setBudgetRange([0, 10000]);
    setLocationFilter('');
    setSortBy('recent');
  };

  const initializeMap = async () => {
    const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyA27ZFwShXNiCI3Hso1tFvGI6Hp3dLsMAc';
    const libraries = ['maps', 'places'];

    try {
      // Only load the script if google maps isn't already present
      if (!(window as any).google || !(window as any).google.maps) {
        const loader = new Loader({ apiKey, version: 'weekly', libraries });
        await loader.load();
      }

      if (mapRef.current) {
        const initialCenter = { lat: 37.7749, lng: -122.4194 };
        const map = new google.maps.Map(mapRef.current, {
          center: initialCenter, // Default to San Francisco
          zoom: 12,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        mapInstanceRef.current = map;

        // Helper to trigger resize and re-center (useful when navigating via client router)
        const ensureRender = () => {
          try {
            google.maps.event.trigger(map, 'resize');
            const c = map.getCenter();
            if (c) map.setCenter(c);
          } catch (e) {
            // ignore
          }
        };

        // Run once after a short delay in case container was hidden during navigation
        setTimeout(ensureRender, 200);
        setTimeout(ensureRender, 600);
        setTimeout(ensureRender, 1200);

        // Also ensure after tiles load
        map.addListener('idle', ensureRender);

        // Use ResizeObserver to call ensureRender when the map container changes size
        try {
          const ro = new ResizeObserver(() => {
            ensureRender();
          });
          ro.observe(mapRef.current!);
        } catch (e) {
          // ResizeObserver may not be available in some envs - ignore
        }

        // Try to get user's location and recenter
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };
              map.setCenter(pos);
              setTimeout(ensureRender, 150);
            }
          );
        }
      }
    } catch (error) {
      console.error('Error loading Google Maps:', error);
    }
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (data) {
      setCategories(data);
    }
  };

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from('requests')
      .select(`
        *,
        categories (id, name, icon, color)
      `)
      .eq('status', 'active');

    if (data) {
      // Fetch profiles separately
      const requestsWithProfiles = await Promise.all(
        data.map(async (request) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('user_id', request.user_id)
            .single();

          return {
            ...request,
            profiles: profile || { display_name: '', avatar_url: '' }
          };
        })
      );

      setRequests(requestsWithProfiles as Request[]);
    }
    setLoading(false);
  };

  const addMarkersToMap = () => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    if (window.googleMapMarkers) {
      window.googleMapMarkers.forEach(marker => marker.setMap(null));
    }
    window.googleMapMarkers = [];

    filteredRequests.forEach(request => {
      // Create custom pin with category color and icon  
      const categoryColor = request.categories.color;
      const categoryIcon = request.categories.icon;
      
      const requestPinSvg = `
        <svg width="44" height="60" viewBox="0 0 44 60" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="shadow-${request.id}" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="rgba(0,0,0,0.25)"/>
            </filter>
          </defs>

          <!-- Teardrop body -->
          <path d="M22 6
                    A16 16 0 1 1 21.99 6
                    L22 46 Z"
                fill="${categoryColor}" stroke="#ffffff" stroke-width="3" filter="url(#shadow-${request.id})"/>

          <!-- Head circle for icon/text -->
          <circle cx="22" cy="22" r="14" fill="#ffffff" />
          <text x="22" y="26" text-anchor="middle" font-size="14" font-weight="600" fill="${categoryColor}">${categoryIcon}</text>
        </svg>
      `;

      const marker = new google.maps.Marker({
        position: {
          lat: Number(request.location_lat),
          lng: Number(request.location_lng)
        },
        map: mapInstanceRef.current,
        title: request.title,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(requestPinSvg)}`,
          scaledSize: new google.maps.Size(44, 60),
          anchor: new google.maps.Point(22, 56)
        }
      });

      marker.addListener('click', () => {
        setSelectedRequest(request);
      });

      if (!window.googleMapMarkers) window.googleMapMarkers = [];
      window.googleMapMarkers.push(marker);
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6">
        {/* Enhanced Header with Search */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Live Map</h1>
              <p className="text-muted-foreground">Find and join requests in your area</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                {showFilters ? 'Hide' : 'Show'} Filters
              </Button>
              <Button
                variant="outline"
                onClick={clearFilters}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear All
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search requests by title, description, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3"
            />
          </div>

          {/* Enhanced Filters Panel */}
          {showFilters && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Categories Filter */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Map className="w-4 h-4" />
                      Categories
                    </Label>
                    <div className="space-y-2">
                      <Badge
                        variant={selectedCategory === null ? "default" : "secondary"}
                        className="cursor-pointer w-full justify-center"
                        onClick={() => setSelectedCategory(null)}
                      >
                        All Categories
                      </Badge>
                      {categories.map((category) => (
                        <Badge
                          key={category.id}
                          variant={selectedCategory === category.id ? "default" : "secondary"}
                          className="cursor-pointer w-full justify-center"
                          onClick={() => setSelectedCategory(category.id)}
                        >
                          {category.icon} {category.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Budget Range Filter */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Budget Range
                    </Label>
                    <div className="space-y-2">
                      <Slider
                        value={budgetRange}
                        onValueChange={(value) => setBudgetRange(value as [number, number])}
                        max={10000}
                        min={0}
                        step={100}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>${budgetRange[0]}</span>
                        <span>${budgetRange[1]}</span>
                      </div>
                    </div>
                  </div>

                  {/* Location Filter */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Location
                    </Label>
                    <Input
                      placeholder="Enter city or area..."
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                    />
                  </div>

                  {/* Sort By */}
                  <div className="space-y-3">
                    <Label>Sort By</Label>
                    <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recent">Most Recent</SelectItem>
                        <SelectItem value="budget-high">Highest Budget</SelectItem>
                        <SelectItem value="budget-low">Lowest Budget</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Results Count */}
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredRequests.length} of {requests.length} requests
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Category Pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge
              variant={selectedCategory === null ? "default" : "secondary"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(null)}
            >
              All Categories
            </Badge>
            {categories.map((category) => (
              <Badge
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.icon} {category.name}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden p-4">
              <div ref={mapRef} className="w-full h-[600px] bg-muted rounded-xl" />
            </Card>
          </div>

          {/* Selected Request Details */}
          <div className="space-y-4">
            {selectedRequest ? (
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">{selectedRequest.title}</h3>
                      <p className="text-muted-foreground text-sm mt-1">
                        {selectedRequest.description}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{selectedRequest.categories.icon}</span>
                      <Badge variant="secondary">{selectedRequest.categories.name}</Badge>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedRequest.address}</span>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Budget Range</p>
                      <p className="text-lg font-semibold text-primary">
                        ${selectedRequest.budget_min} - ${selectedRequest.budget_max}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Requested by</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedRequest.profiles?.display_name || 'Anonymous User'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button className="flex-1" disabled>
                        Join Request (Coming Soon)
                      </Button>
                      <Button
  variant="outline"
  size="icon"
  aria-label="Chat about this request"
  onClick={() =>
    navigate(`/chat?requestId=${selectedRequest.id}&sellerId=${selectedRequest.user_id}`)
  }
>
  <MessageCircle className="w-4 h-4" />
</Button>

                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>Click on a map marker to view request details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
