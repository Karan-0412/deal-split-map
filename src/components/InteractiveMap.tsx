import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Database } from '@/integrations/supabase/types';

// Extend Request with joined category and optional image url if available
// product_image_url is optional and used when present; otherwise we fallback
// to a default placeholder image in /public

type Request = Database["public"]["Tables"]["requests"]["Row"] & {
  categories: Database["public"]["Tables"]["categories"]["Row"];
  product_image_url?: string | null;
};

interface InteractiveMapProps {
  userLocation: { lat: number; lng: number } | null;
  requests: Request[];
  onMarkerClick?: (request: Request) => void;
  userProfile?: { display_name?: string; avatar_url?: string } | null;
  showLegend?: boolean;
}

const DEFAULT_PLACEHOLDER = '/placeholder.svg';

const getCategoryColor = (name?: string | null, fallback?: string | null) => {
  const map: Record<string, string> = {
    Coffee: '#22c55e',
    Grocery: '#0ea5e9',
    Electronics: '#f59e0b',
    Fashion: '#ef4444',
    Food: '#10b981',
  };
  if (name && map[name]) return map[name];
  return fallback || '#22c55e';
};

// Build a DOM element containing an inline SVG pin with a circular clipped image on top
function createPhotoPinElement(options: {
  color: string;
  photoUrl: string;
  size?: number; // base diameter of pin circle
  smallCircleSize?: number; // diameter of the photo circle
}): HTMLDivElement {
  const { color, photoUrl, size = 40, smallCircleSize = 18 } = options;
  const svgWidth = size + 8; // include stroke/shadow space
  const svgHeight = size + 22; // include pointer and top photo circle
  const mainR = size / 2;
  const cx = svgWidth / 2;
  const cy = svgHeight / 2 + 4; // slight shift to look balanced
  const topCircleR = smallCircleSize / 2;
  const topCx = cx + mainR - topCircleR - 6;
  const topCy = cy - mainR + topCircleR - 6;

  const container = document.createElement('div');
  container.style.position = 'relative';
  container.style.width = `${svgWidth}px`;
  container.style.height = `${svgHeight}px`;
  container.style.transform = 'translateY(-6px)';

  container.innerHTML = `
    <svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.25)"/>
        </filter>
        <clipPath id="photoClip">
          <circle cx="${topCx}" cy="${topCy}" r="${topCircleR}" />
        </clipPath>
      </defs>

      <!-- Main colored circle -->
      <circle cx="${cx}" cy="${cy}" r="${mainR}" fill="${color}" stroke="#ffffff" stroke-width="3" filter="url(#dropShadow)" />

      <!-- Pointer triangle -->
      <path d="M ${cx - 8} ${cy + mainR - 2} L ${cx + 8} ${cy + mainR - 2} L ${cx} ${cy + mainR + 12} Z" fill="${color}" stroke="#ffffff" stroke-width="2" filter="url(#dropShadow)" />

      <!-- Top photo circle border -->
      <circle cx="${topCx}" cy="${topCy}" r="${topCircleR + 2}" fill="#ffffff" />

      <!-- Photo clipped to circle -->
      <image href="${photoUrl}" x="${topCx - topCircleR}" y="${topCy - topCircleR}" width="${smallCircleSize}" height="${smallCircleSize}" preserveAspectRatio="xMidYMid slice" clip-path="url(#photoClip)" />
    </svg>
  `;

  return container;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  userLocation,
  requests,
  onMarkerClick,
  userProfile,
  showLegend = true,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Array<google.maps.marker.AdvancedMarkerElement>>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (window as any).handleJoinRequest = (requestId: string) => {
      // Hook for external join logic
      console.log('Joining request from map:', requestId);
    };

    const initMap = async () => {
      try {
        const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';
        const loader = new Loader({
          apiKey,
          version: 'weekly',
          libraries: ['places', 'marker'],
        });
        await loader.load();
        if (!mapRef.current) return;

        const map = new google.maps.Map(mapRef.current, {
          center: userLocation || { lat: 40.7128, lng: -74.006 },
          zoom: 13,
          styles: [
            { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
          ],
          disableDefaultUI: true,
          zoomControl: true,
          zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_BOTTOM },
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
    markersRef.current.forEach((m) => m.map = null);
    markersRef.current = [];

    // Add user marker
    if (userLocation) {
      const userImg = userProfile?.avatar_url || DEFAULT_PLACEHOLDER;
      const userPin = createPhotoPinElement({ color: '#8b5cf6', photoUrl: userImg, size: 44, smallCircleSize: 18 });
      const userMarker = new google.maps.marker.AdvancedMarkerElement({
        map: mapInstanceRef.current,
        position: userLocation,
        content: userPin,
        zIndex: 1000,
      });

      const userInfo = new google.maps.InfoWindow({
        content: `
          <div class="p-3 text-center">
            <div class="font-semibold text-purple-600 text-lg">${userProfile?.display_name || 'You'}</div>
            <div class="text-sm text-gray-600 mt-1">Your current location</div>
          </div>
        `,
      });

      userMarker.addListener('click', () => userInfo.open({ map: mapInstanceRef.current!, anchor: userMarker }));
      markersRef.current.push(userMarker);
    }

    // Add request markers
    requests.forEach((request) => {
      const lat = Number(request.location_lat);
      const lng = Number(request.location_lng);
      if (!lat || !lng) return;

      const categoryColor = getCategoryColor(request.categories?.name, request.categories?.color || undefined);
      const photoUrl = (request as any).product_image_url || DEFAULT_PLACEHOLDER;

      const pinEl = createPhotoPinElement({ color: categoryColor, photoUrl, size: 40, smallCircleSize: 18 });
      const marker = new google.maps.marker.AdvancedMarkerElement({
        map: mapInstanceRef.current!,
        position: { lat, lng },
        content: pinEl,
      });

      const distance = userLocation
        ? calculateDistance(userLocation.lat, userLocation.lng, lat, lng).toFixed(1)
        : 'Unknown';

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-4 min-w-[250px]">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white" style="background:#f3f4f6">
                <img src="${photoUrl}" alt="Product" style="width:100%;height:100%;object-fit:cover" onerror="this.src='${DEFAULT_PLACEHOLDER}'" />
              </div>
              <div>
                <h3 class="font-semibold text-lg">${request.title}</h3>
                <p class="text-sm text-gray-600">${request.categories?.name || 'General'}</p>
              </div>
            </div>
            <div class="space-y-2 mb-4">
              <div class="flex items-center gap-2 text-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span class="text-gray-600">${distance} miles away</span>
              </div>
              ${(request.budget_min || request.budget_max) ? `
              <div class="flex items-center gap-2 text-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                <span class="font-semibold" style="color:${categoryColor}">$${request.budget_min ?? ''}${request.budget_max ? ` - $${request.budget_max}` : ''}</span>
              </div>` : ''}
            </div>
            <button onclick="window.handleJoinRequest('${request.id}')" class="w-full text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90 active:scale-95" style="background:${categoryColor}">
              Join Request
            </button>
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open({ map: mapInstanceRef.current!, anchor: marker });
        onMarkerClick?.(request);
      });

      // Hover scale effect
      marker.addListener('mouseover', () => {
        (pinEl as HTMLElement).style.transform = 'scale(1.06) translateY(-6px)';
      });
      marker.addListener('mouseout', () => {
        (pinEl as HTMLElement).style.transform = 'scale(1) translateY(-6px)';
      });

      markersRef.current.push(marker);
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

  // Legend categories (unique)
  const uniqueCategories = requests.reduce((acc, request) => {
    if (request.categories && !acc.find(cat => cat.id === request.categories.id)) acc.push(request.categories);
    return acc;
  }, [] as typeof requests[0]['categories'][]);

  return (
    <div className="relative">
      <div ref={mapRef} className="w-full h-[400px] rounded-xl bg-gray-900" />

      {showLegend && uniqueCategories.length > 0 && (
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg max-w-[220px]">
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
                  className="w-6 h-6 rounded-full border-2 border-white"
                  style={{ backgroundColor: getCategoryColor(category.name, category.color) }}
                />
                <span className="text-gray-700 truncate">{category.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/60 rounded-xl">
          <div className="text-white">Loading map...</div>
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;
