import { useState, useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Filter } from 'lucide-react';
import Navigation from '@/components/Navigation';

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
  profiles: {
    display_name: string;
    avatar_url: string;
  };
}

const MapPage = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeMap();
    fetchCategories();
    fetchRequests();
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && requests.length > 0) {
      addMarkersToMap();
    }
  }, [requests, selectedCategory]);

  const initializeMap = async () => {
    const loader = new Loader({
      apiKey: '', // We'll need to add this as a secret
      version: 'weekly',
      libraries: ['maps', 'places']
    });

    try {
      await loader.load();
      
      if (mapRef.current) {
        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
          center: { lat: 37.7749, lng: -122.4194 }, // Default to San Francisco
          zoom: 12,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        // Try to get user's location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };
              mapInstanceRef.current?.setCenter(pos);
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

    const filteredRequests = selectedCategory
      ? requests.filter(req => req.categories.id === selectedCategory)
      : requests;

    filteredRequests.forEach(request => {
      const marker = new google.maps.Marker({
        position: {
          lat: Number(request.location_lat),
          lng: Number(request.location_lng)
        },
        map: mapInstanceRef.current,
        title: request.title,
        icon: {
          url: `data:image/svg+xml,${encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" fill="${request.categories.color}" stroke="white" stroke-width="2"/>
              <text x="16" y="20" text-anchor="middle" fill="white" font-size="16">${request.categories.icon}</text>
            </svg>
          `)}`,
          scaledSize: new google.maps.Size(32, 32)
        }
      });

      marker.addListener('click', () => {
        setSelectedRequest(request);
      });
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6">
        {/* Categories Filter */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-semibold">Categories</h2>
          </div>
          
          <div className="flex flex-wrap gap-2">
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
            <Card className="overflow-hidden">
              <div ref={mapRef} className="w-full h-[600px] bg-muted" />
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

                    <Button className="w-full" disabled>
                      Join Request (Coming Soon)
                    </Button>
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