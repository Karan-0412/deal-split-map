# DealSplit Marketplace

A responsive marketplace landing page for splitting multi-item deals (BOGO offers). Connect buyers to share savings on bulk purchases, food deals, and more.

## 🎯 Features

- **Responsive Hero Section** with 3D model placeholder
- **Live Map Integration** showing nearby deal requests  
- **Real-time Matching** system interface
- **Trust & Security** indicators with escrow protection
- **Mobile-first Design** with teal/amber color scheme

## 🛠 Tech Integration Points

### 3D Model Hero (`3D_MODEL_HERO`)
**Location**: `src/components/HeroSection.tsx`

**Expected Integration**:
```tsx
// Recommended: react-three-fiber or <model-viewer>
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'

// Props expected:
{
  modelPath: string,          // glTF/glb file path
  autoRotate: boolean,        // true by default
  allowExpand: boolean,       // click to expand functionality
  fallbackImage: string      // static image for low-perf devices
}
```

**Features to implement**:
- Slow auto-rotation animation
- Click-to-expand modal
- Draco compression support
- Static fallback for `prefers-reduced-motion`
- Lazy loading to prevent blocking

### Live Map (`LIVE_MAP_SECTION`) 
**Location**: `src/components/LiveMapSection.tsx`

**Expected Integration**:
```tsx
// Recommended: Mapbox GL JS or Google Maps
import Map, { Marker, Popup } from 'react-map-gl'

// Props expected:
{
  userLocation: { lat: number, lng: number },
  requests: Array<{
    id: string,
    location: { lat: number, lng: number },
    product: { title: string, image: string, price: string },
    user: { name: string, rating: number },
    distance: string,
    eta: string
  }>,
  onMarkerClick: (requestId: string) => void,
  onJoinRequest: (requestId: string) => void
}
```

**Features to implement**:
- User location with distinctive marker (pulse animation)
- Product markers with thumbnail + price badge
- Real-time updates via WebSocket/Socket.IO
- Marker clustering for performance
- Side panel/bottom sheet for mobile details
- Filter controls integration

## 🎨 Design System

### Colors (HSL format)
- **Primary**: `hsl(180, 85%, 34%)` - Teal brand color
- **Accent**: `hsl(31, 100%, 70%)` - Amber highlights  
- **Foreground**: `hsl(220, 30%, 10%)` - Dark text

### Typography
- **Font**: Inter (system fallback: system-ui, sans-serif)
- **Weights**: 400 (regular), 600 (semibold), 800 (bold)

### Components
- **Button variants**: `hero`, `accent`, `outline` with hover animations
- **Cards**: 8px border-radius with soft shadows
- **Animations**: Smooth transitions with cubic-bezier easing

## 🔒 Security Features

- Escrow payment protection
- User rating system
- Digital receipt tracking
- Safe meeting location suggestions

## 🚀 Development

```bash
npm install
npm run dev
```

## 📱 Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px  
- Desktop: > 1024px

## 🌐 Real-time Requirements

**Suggested Stack**:
- WebSocket/Socket.IO for live position updates
- Stripe Payment Intents for escrow
- Geolocation API with permission prompts
- Push notifications for match alerts

---

Built with React, TypeScript, Tailwind CSS, and shadcn/ui components.