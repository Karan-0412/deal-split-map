import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Database } from '@/integrations/supabase/types';

type Request = Database["public"]["Tables"]["requests"]["Row"] & {
  categories: Database["public"]["Tables"]["categories"]["Row"];
};

interface InteractiveMapProps {
  userLocation: { lat: number; lng: number } | null;
  requests: Request[];
  onMarkerClick?: (request: Request) => void;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  userLocation,
  requests,
  onMarkerClick
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Add global handler for map join request buttons
    (window as any).handleJoinRequest = (requestId: string) => {
      console.log('Joining request from map:', requestId);
      // This would typically trigger the same join logic
    };

    const initMap = async () => {
      try {
        // For now using a placeholder key - in production this would come from Supabase secrets
        const loader = new Loader({
          apiKey: 'AIzaSyBPlaceholderKey123456789', // This needs to be replaced with actual key
          version: 'weekly',
          libraries: ['places']
        });

        await loader.load();
        
        if (!mapRef.current) return;

        const map = new google.maps.Map(mapRef.current, {
          center: userLocation || { lat: 40.7128, lng: -74.006 },
          zoom: 13,
          styles: [
            {
              "featureType": "all",
              "elementType": "geometry.fill",
              "stylers": [{ "color": "#1a1a1a" }]
            },
            {
              "featureType": "all",
              "elementType": "labels.text.fill",
              "stylers": [{ "color": "#ffffff" }]
            },
            {
              "featureType": "all",
              "elementType": "labels.text.stroke",
              "stylers": [{ "color": "#000000" }, { "lightness": 13 }]
            },
            {
              "featureType": "administrative",
              "elementType": "geometry.fill",
              "stylers": [{ "color": "#000000" }]
            },
            {
              "featureType": "administrative",
              "elementType": "geometry.stroke",
              "stylers": [{ "color": "#144b53" }, { "lightness": 14 }, { "weight": 1.4 }]
            },
            {
              "featureType": "landscape",
              "elementType": "all",
              "stylers": [{ "color": "#08304b" }]
            },
            {
              "featureType": "poi",
              "elementType": "geometry",
              "stylers": [{ "color": "#0c4152" }, { "lightness": 5 }]
            },
            {
              "featureType": "road.highway",
              "elementType": "geometry.fill",
              "stylers": [{ "color": "#000000" }]
            },
            {
              "featureType": "road.highway",
              "elementType": "geometry.stroke",
              "stylers": [{ "color": "#0b434f" }, { "lightness": 25 }]
            },
            {
              "featureType": "road.arterial",
              "elementType": "geometry.fill",
              "stylers": [{ "color": "#000000" }]
            },
            {
              "featureType": "road.arterial",
              "elementType": "geometry.stroke",
              "stylers": [{ "color": "#0b3d51" }, { "lightness": 16 }]
            },
            {
              "featureType": "road.local",
              "elementType": "geometry",
              "stylers": [{ "color": "#000000" }]
            },
            {
              "featureType": "transit",
              "elementType": "all",
              "stylers": [{ "color": "#146474" }]
            },
            {
              "featureType": "water",
              "elementType": "all",
              "stylers": [{ "color": "#021019" }]
            }
          ],
          disableDefaultUI: true,
          zoomControl: true,
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM
          }
        });

        mapInstanceRef.current = map;
        setIsLoaded(true);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    initMap();
  }, [userLocation]);

  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add user location marker
    if (userLocation) {
      const userMarker = new google.maps.Marker({
        position: userLocation,
        map: mapInstanceRef.current,
        title: 'You',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#8b5cf6',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3
        },
        zIndex: 1000
      });

      const userInfoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-2 text-center">
            <div class="font-semibold text-purple-600">You</div>
            <div class="text-sm text-gray-600">Your current location</div>
          </div>
        `
      });

      userMarker.addListener('click', () => {
        userInfoWindow.open(mapInstanceRef.current, userMarker);
      });

      markersRef.current.push(userMarker);
    }

    // Add request markers
    requests.forEach((request) => {
      if (request.location_lat && request.location_lng) {
        const marker = new google.maps.Marker({
          position: { lat: Number(request.location_lat), lng: Number(request.location_lng) },
          map: mapInstanceRef.current,
          title: request.title,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: request.categories?.color || '#22c55e',
            fillOpacity: 0.9,
            strokeColor: '#ffffff',
            strokeWeight: 2
          }
        });

        const distance = userLocation ? 
          calculateDistance(
            userLocation.lat, 
            userLocation.lng, 
            Number(request.location_lat), 
            Number(request.location_lng)
          ).toFixed(1) : 'Unknown';

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div class="p-3 min-w-[200px]">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-lg">${request.categories?.icon || '📦'}</span>
                <h3 class="font-semibold">${request.title}</h3>
              </div>
              <p class="text-sm text-gray-600 mb-2">${distance} miles away</p>
              <p class="text-sm mb-3">$${request.budget_min} - $${request.budget_max}</p>
              <button 
                onclick="window.handleJoinRequest('${request.id}')"
                class="w-full bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600 transition-colors"
              >
                Join Request
              </button>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(mapInstanceRef.current, marker);
          onMarkerClick?.(request);
        });

        markersRef.current.push(marker);
      }
    });
  }, [isLoaded, userLocation, requests, onMarkerClick]);

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

  return (
    <div className="relative">
      <div
        ref={mapRef}
        className="w-full h-[400px] rounded-xl bg-gray-900"
        style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' }}
      />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-xl">
          <div className="text-white">Loading map...</div>
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;