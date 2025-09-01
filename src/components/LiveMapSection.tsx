import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Filter, Zap, Star, Clock, DollarSign } from "lucide-react";
import { useState } from "react";

const LiveMapSection = () => {
  const [selectedMarker, setSelectedMarker] = useState<any>(null);

  // Mock data for demo
  const mockRequest = {
    id: 1,
    product: "Premium Coffee Bundle",
    price: "$24.99",
    savings: "$12.50",
    distance: "0.3 miles",
    eta: "8 min walk",
    rating: 4.8,
    user: "Sarah K.",
    thumbnail: "/api/placeholder/80/80"
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
          {/* Filter Controls */}
          <div className="lg:col-span-1">
            <Card className="shadow-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-primary" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Radius: 2 miles
                  </label>
                  <div className="w-full h-2 bg-secondary rounded-full">
                    <div className="w-1/3 h-2 bg-primary rounded-full"></div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Category
                  </label>
                  <select className="w-full p-2 border border-border rounded-lg bg-background text-foreground">
                    <option>All Categories</option>
                    <option>Food & Beverage</option>
                    <option>Electronics</option>
                    <option>Home & Garden</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Price Range
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      placeholder="Min" 
                      className="w-1/2 p-2 border border-border rounded-lg bg-background text-foreground"
                    />
                    <input 
                      type="number" 
                      placeholder="Max" 
                      className="w-1/2 p-2 border border-border rounded-lg bg-background text-foreground"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-accent-light rounded-lg">
                  <Zap className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium text-accent-foreground">
                    High match likelihood
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map Area */}
          <div className="lg:col-span-3">
            <div className="relative">
              {/* Map Placeholder */}
              <div className="aspect-[16/10] rounded-2xl overflow-hidden shadow-card bg-gradient-to-br from-primary/5 to-accent/5 border border-border">
                <div className="w-full h-full flex items-center justify-center bg-muted/20">
                  <div className="text-center p-8">
                    <h3 className="text-2xl font-semibold text-foreground mb-4">
                      {/* LIVE_MAP_SECTION: insert Mapbox/GoogleMap component here */}
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                      Interactive map with real-time markers showing user location and nearby share requests. 
                      Click markers to view details and join requests.
                    </p>
                    
                    {/* Mock Map Interface */}
                    <div className="bg-background rounded-lg p-6 shadow-soft border border-border max-w-md mx-auto">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-foreground">You</span>
                      </div>
                      
                      <div className="flex items-center gap-3 mb-4 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors"
                           onClick={() => setSelectedMarker(mockRequest)}>
                        <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-accent-foreground" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-foreground">Coffee Bundle</p>
                          <p className="text-xs text-muted-foreground">0.3 miles away</p>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        + 12 more requests nearby
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Request Detail Card - Appears when marker is clicked */}
              {selectedMarker && (
                <Card className="absolute top-4 right-4 w-80 shadow-card border-border bg-background">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                        <DollarSign className="w-8 h-8 text-primary" />
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">
                          {selectedMarker.product}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          by {selectedMarker.user}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            <span className="text-muted-foreground">{selectedMarker.distance}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span className="text-muted-foreground">{selectedMarker.eta}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-accent" />
                            <span className="text-muted-foreground">{selectedMarker.rating}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-primary font-semibold">Save {selectedMarker.savings}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" variant="hero" className="flex-1">
                            Join Request
                          </Button>
                          <Button size="sm" variant="outline">
                            Message
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setSelectedMarker(null)}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-muted hover:bg-secondary flex items-center justify-center"
                    >
                      ×
                    </button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveMapSection;