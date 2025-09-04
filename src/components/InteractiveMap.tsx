import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Database } from '@/integrations/supabase/types';
import { generateAvatarColor, getInitials } from '@/lib/avatar-utils';

type Request = Database["public"]["Tables"]["requests"]["Row"] & {
  categories: Database["public"]["Tables"]["categories"]["Row"];
};

interface InteractiveMapProps {
  userLocation: { lat: number; lng: number } | null;
  requests: Request[];
  onMarkerClick?: (request: Request) => void;
  userProfile?: { display_name?: string; avatar_url?: string } | null;
  showLegend?: boolean;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  userLocation,
  requests,
  onMarkerClick,
  userProfile,
  showLegend = true
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

    // Add user location marker with custom pin
    if (userLocation) {
      const userName = userProfile?.display_name || 'You';
      const avatarColor = generateAvatarColor(userName);
      const initials = getInitials(userName);
      
      // Create custom user pin with avatar/initials
      const userPinSvg = `
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="rgba(139, 92, 246, 0.3)"/>
            </filter>
          </defs>
          <circle cx="24" cy="24" r="18" fill="#8b5cf6" stroke="white" stroke-width="3" filter="url(#shadow)"/>
          <circle cx="24" cy="24" r="12" fill="white" opacity="0.9"/>
          <text x="24" y="28" text-anchor="middle" fill="#8b5cf6" font-size="12" font-weight="bold">${initials}</text>
          <circle cx="38" cy="10" r="6" fill="#10b981" stroke="white" stroke-width="2"/>
        </svg>
      `;

      const userMarker = new google.maps.Marker({
        position: userLocation,
        map: mapInstanceRef.current,
        title: 'Your Location',
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(userPinSvg)}`,
          scaledSize: new google.maps.Size(48, 48),
          anchor: new google.maps.Point(24, 42)
        },
        zIndex: 1000
      });

      const userInfoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-3 text-center">
            <div class="font-semibold text-purple-600 text-lg">${userName}</div>
            <div class="text-sm text-gray-600 mt-1">Your current location</div>
            <div class="w-8 h-8 rounded-full mx-auto mt-2" style="background: ${avatarColor}">
              <div class="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-sm">
                ${initials}
              </div>
            </div>
          </div>
        `
      });

      userMarker.addListener('click', () => {
        userInfoWindow.open(mapInstanceRef.current, userMarker);
      });

      markersRef.current.push(userMarker);
    }

    // Add request markers with custom category-colored pins
    requests.forEach((request) => {
      if (request.location_lat && request.location_lng) {
        const categoryColor = request.categories?.color || '#22c55e';
        const categoryIcon = request.categories?.icon || '📦';
        
        // Create custom pin with category color and icon
        const requestPinSvg = `
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="shadow-${request.id}" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0, 0, 0, 0.2)"/>
              </filter>
            </defs>
            <circle cx="18" cy="18" r="14" fill="${categoryColor}" stroke="white" stroke-width="2" filter="url(#shadow-${request.id})"/>
            <text x="18" y="22" text-anchor="middle" font-size="14">${categoryIcon}</text>
          </svg>
        `;

        const marker = new google.maps.Marker({
          position: { lat: Number(request.location_lat), lng: Number(request.location_lng) },
          map: mapInstanceRef.current,
          title: request.title,
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(requestPinSvg)}`,
            scaledSize: new google.maps.Size(36, 36),
            anchor: new google.maps.Point(18, 32)
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
            <div class="p-4 min-w-[250px]">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style="background: ${categoryColor}">
                  <span class="text-lg">${categoryIcon}</span>
                </div>
                <div>
                  <h3 class="font-semibold text-lg">${request.title}</h3>
                  <p class="text-sm text-gray-600">${request.categories?.name || 'General'}</p>
                </div>
              </div>
              
              <div class="space-y-2 mb-4">
                <div class="flex items-center gap-2 text-sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span class="text-gray-600">${distance} miles away</span>
                </div>
                <div class="flex items-center gap-2 text-sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="1" x2="12" y2="23"/>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                  <span class="font-semibold text-green-600">$${request.budget_min} - $${request.budget_max}</span>
                </div>
              </div>
              
              <button 
                onclick="window.handleJoinRequest('${request.id}')"
                class="w-full text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90 active:scale-95"
                style="background: linear-gradient(135deg, ${categoryColor} 0%, ${categoryColor}dd 100%)"
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

        // Add hover effect
        marker.addListener('mouseover', () => {
          marker.setZIndex(999);
        });
        
        marker.addListener('mouseout', () => {
          marker.setZIndex(1);
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

  // Get unique categories for legend
  const uniqueCategories = requests.reduce((acc, request) => {
    if (request.categories && !acc.find(cat => cat.id === request.categories.id)) {
      acc.push(request.categories);
    }
    return acc;
  }, [] as typeof requests[0]['categories'][]);

  return (
    <div className="relative">
      <div
        ref={mapRef}
        className="w-full h-[400px] rounded-xl bg-gray-900"
        style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' }}
      />
      
      {/* Legend */}
      {showLegend && uniqueCategories.length > 0 && (
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg max-w-[200px]">
          <h4 className="font-semibold text-sm mb-2 text-gray-800">Categories</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-6 h-6 rounded-full bg-purple-500 border-2 border-white flex items-center justify-center">
                <span className="text-white text-xs font-bold">•</span>
              </div>
              <span className="text-gray-700">Your Location</span>
            </div>
            {uniqueCategories.map((category) => (
              <div key={category.id} className="flex items-center gap-2 text-xs">
                <div 
                  className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center"
                  style={{ backgroundColor: category.color }}
                >
                  <span className="text-xs">{category.icon}</span>
                </div>
                <span className="text-gray-700 truncate">{category.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-xl">
          <div className="text-white">Loading map...</div>
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;