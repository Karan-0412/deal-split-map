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

// Build a DOM element containing an inline SVG teardrop pin with the product photo clipped inside the main circle
function createPhotoPinElement(options: {
  color: string;
  photoUrl: string;
  size?: number; // diameter of the circular head
}): HTMLDivElement {
  const { color, photoUrl, size = 44 } = options;
  const headR = size / 2;
  const svgWidth = size + 8;
  const svgHeight = size + 28; // extra for the tail
  const cx = svgWidth / 2;
  const cy = headR + 4; // head center

  const pointerHeight = 20;
  const tailY = cy + headR + pointerHeight;

  const container = document.createElement('div');
  container.style.position = 'relative';
  container.style.width = `${svgWidth}px`;
  container.style.height = `${svgHeight}px`;
  container.style.transform = 'translateY(-6px)';

  container.innerHTML = `
    <svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.22)"/>
        </filter>
        <clipPath id="photoClip">
          <circle cx="${cx}" cy="${cy}" r="${headR - 6}" />
        </clipPath>
      </defs>

      <!-- Teardrop body: circular head + smooth pointed tail -->
      <path d="M ${cx} ${cy - headR}
               A ${headR} ${headR} 0 1 1 ${cx - 0.01} ${cy - headR}
               L ${cx} ${tailY} Z"
            fill="${color}" stroke="#ffffff" stroke-width="3" filter="url(#dropShadow)" />

      <!-- Photo clipped inside head -->
      <circle cx="${cx}" cy="${cy}" r="${headR - 6}" fill="#ffffff" />
      <image href="${photoUrl}" x="${cx - (headR - 6)}" y="${cy - (headR - 6)}" width="${(headR - 6) * 2}" height="${(headR - 6) * 2}" preserveAspectRatio="xMidYMid slice" clip-path="url(#photoClip)" />

      <!-- White ring around photo -->
      <circle cx="${cx}" cy="${cy}" r="${headR - 3}" fill="none" stroke="#ffffff" stroke-width="3" />
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
  const markersRef = useRef<google.maps.Marker[]>([]);
  const currentInfoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (window as any).handleJoinRequest = (requestId: string) => {
      // Hook for external join logic
      console.log('Joining request from map:', requestId);
    };

    const initMap = async () => {
      try {
        const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';
        const libraries = ['maps', 'places'];

        // If Google Maps already loaded, don't call Loader again with different options
        if (!(window as any).google || !(window as any).google.maps) {
          const loader = new Loader({ apiKey, version: 'weekly', libraries });
          await loader.load();
        }

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
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    // Add user marker
    if (userLocation) {
      const userImg = userProfile?.avatar_url || DEFAULT_PLACEHOLDER;
      const userPinEl = createPhotoPinElement({ color: '#8b5cf6', photoUrl: userImg, size: 44, smallCircleSize: 18 });
      const userSvg = userPinEl.innerHTML;
      const userMarker = new google.maps.Marker({
        map: mapInstanceRef.current!,
        position: userLocation,
        title: userProfile?.display_name || 'You',
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(userSvg)}`,
          scaledSize: new google.maps.Size(44, 66),
          anchor: new google.maps.Point(22, 60),
        },
        zIndex: 1000,
      });

      const userInfo = new google.maps.InfoWindow({
        content: `
          <div style="padding:12px;min-width:180px;text-align:center;font-family:Inter, system-ui, sans-serif;">
            <div style="font-weight:600;color:#7c3aed;font-size:16px;">${userProfile?.display_name || 'You'}</div>
            <div style="font-size:13px;color:#6b7280;margin-top:6px;">Your current location</div>
          </div>
        `,
      });

      userMarker.addListener('click', () => {
        if (currentInfoWindowRef.current) currentInfoWindowRef.current.close();
        currentInfoWindowRef.current = userInfo;
        userInfo.open(mapInstanceRef.current!, userMarker);
      });
      userMarker.addListener('mouseover', () => userMarker.setZIndex(1001));
      userMarker.addListener('mouseout', () => userMarker.setZIndex(1000));
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
      const svg = pinEl.innerHTML;
      const marker = new google.maps.Marker({
        map: mapInstanceRef.current!,
        position: { lat, lng },
        title: request.title,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
          scaledSize: new google.maps.Size(40, 60),
          anchor: new google.maps.Point(20, 56),
        },
      });

      const distance = userLocation
        ? calculateDistance(userLocation.lat, userLocation.lng, lat, lng).toFixed(1)
        : 'Unknown';

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding:14px;min-width:230px;font-family:Inter, system-ui, sans-serif;">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
              <div style="width:44px;height:44px;border-radius:50%;overflow:hidden;background:#f3f4f6;border:2px solid #fff;flex-shrink:0">
                <img src="${photoUrl}" alt="Product" style="width:100%;height:100%;object-fit:cover;display:block" onerror="this.src='${DEFAULT_PLACEHOLDER}'" />
              </div>
              <div style="flex:1;min-width:0">
                <div style="font-weight:600;font-size:15px;color:#111827;line-height:1.1;">${request.title}</div>
                <div style="font-size:13px;color:#6b7280;margin-top:4px;">${request.categories?.name || 'General'}</div>
              </div>
            </div>
            <div style="margin-bottom:10px;font-size:13px;color:#374151">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0"/><circle cx="12" cy="10" r="3"/></svg>
                <span>${distance} miles away</span>
              </div>
              ${ (request.budget_min || request.budget_max) ? `<div style="display:flex;align-items:center;gap:8px;color:${categoryColor};font-weight:600">$${request.budget_min ?? ''}${request.budget_max ? ` - $${request.budget_max}` : ''}</div>` : ''}
            </div>
            <button onclick="window.handleJoinRequest('${request.id}')" style="width:100%;background:${categoryColor};color:#fff;border-radius:8px;padding:10px 12px;border:none;font-weight:600;cursor:pointer">Join Request</button>
          </div>
        `,
      });

      marker.addListener('click', () => {
        // Close previous InfoWindow first
        if (currentInfoWindowRef.current) {
          currentInfoWindowRef.current.close();
        }
        currentInfoWindowRef.current = infoWindow;
        infoWindow.open(mapInstanceRef.current!, marker);
        onMarkerClick?.(request);
      });

      marker.addListener('mouseover', () => marker.setZIndex(999));
      marker.addListener('mouseout', () => marker.setZIndex(undefined));

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


      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/60 rounded-xl">
          <div className="text-white">Loading map...</div>
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;
