import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, DollarSign, Package, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Loader } from '@googlemaps/js-api-loader';
import { supabase } from "@/integrations/supabase/client";

const offerTypes = [
  "Buy 1 Get 1 Free",
  "Buy 2 Get 1 Free", 
  "Bulk Discount",
  "Group Purchase",
  "Percentage Discount",
  "Combo Deal",
  "Other"
];

const PostPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number} | null>(null);
  const [formData, setFormData] = useState({
    productName: "",
    offerType: "",
    price: "",
    categoryId: "",
    description: "",
    address: "",
    productLink: ""
  });

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  useEffect(() => {
    fetchCategories();
    initializeMap();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase.from("categories").select("*");
    if (error) {
      console.error("Error fetching categories:", error.message);
      return;
    }
    setCategories(data || []);
  };

  const initializeMap = async () => {
    const loader = new Loader({
      apiKey: '', // Add your API key here - same as MapPage
      version: 'weekly',
      libraries: ['maps', 'places'] // Added 'maps' library like in MapPage
    });

    try {
      await loader.load();
      
      if (mapRef.current) {
        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
          center: { lat: 37.7749, lng: -122.4194 }, // Default to San Francisco
          zoom: 12, // Changed from 13 to 12 to match MapPage
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
              setSelectedLocation(pos);
              addMarker(pos);
            }
          );
        }

        // Add click listener to map
        mapInstanceRef.current.addListener('click', (event: google.maps.MapMouseEvent) => {
          const clickedLocation = {
            lat: event.latLng!.lat(),
            lng: event.latLng!.lng()
          };
          setSelectedLocation(clickedLocation);
          addMarker(clickedLocation);

          // Reverse geocode to get address
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location: clickedLocation }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              setFormData(prev => ({
                ...prev,
                address: results[0].formatted_address
              }));
            }
          });
        });
      }
    } catch (error) {
      console.error('Error loading Google Maps:', error);
      toast({
        title: "Map Loading Error",
        description: "Unable to load the map. Please check your API key configuration.",
        variant: "destructive"
      });
    }
  };

  const addMarker = (location: {lat: number, lng: number}) => {
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    markerRef.current = new google.maps.Marker({
      position: location,
      map: mapInstanceRef.current,
      title: 'Pickup Location',
      icon: {
        url: `data:image/svg+xml,${encodeURIComponent(`
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="12" fill="#ef4444" stroke="white" stroke-width="2"/>
            <circle cx="16" cy="16" r="4" fill="white"/>
          </svg>
        `)}`,
        scaledSize: new google.maps.Size(32, 32)
      }
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedLocation) {
      toast({
        title: "Location Required",
        description: "Please select a pickup location on the map",
        variant: "destructive"
      });
      return;
    }

    if (!formData.productName || !formData.offerType || !formData.categoryId || !formData.productLink) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields including product link",
        variant: "destructive"
      });
      return;
    }

    if (!isValidUrl(formData.productLink)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid product link",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Get current user from Supabase auth
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to post a request",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      const requestData = {
        title: formData.productName,
        description: formData.description || null,
        category_id: formData.categoryId,
        location_lat: parseFloat(selectedLocation.lat.toString()),
        location_lng: parseFloat(selectedLocation.lng.toString()),
        address: formData.address || null,
        budget_min: parseFloat(formData.price) || 0,
        budget_max: parseFloat(formData.price) || 0,
        product_link: formData.productLink,
        user_id: user.id,
        status: 'active'
      };

      console.log('Submitting request data:', requestData); // Debug log

      const { data, error } = await supabase
        .from("requests")
        .insert(requestData)
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message);
      }

      console.log('Successfully inserted:', data); // Debug log

      toast({
        title: "Request Posted!",
        description: "Your deal request has been posted successfully"
      });

      navigate('/map');
    } catch (error: any) {
      console.error('Submit error:', error);
      toast({
        title: "Error",
        description: `Failed to post request: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/50 to-primary/5">
      <Navigation />
      
      <main className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="mb-4 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Post a Deal Request
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Share a great deal opportunity with the community and find someone to split the cost!
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Deal Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label htmlFor="productName">Product Name *</Label>
                      <Input
                        id="productName"
                        placeholder="e.g., iPhone 15 Pro, Nike Air Max..."
                        value={formData.productName}
                        onChange={(e) => handleInputChange('productName', e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="offerType">Offer Type *</Label>
                      <Select onValueChange={(value) => handleInputChange('offerType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select offer type" />
                        </SelectTrigger>
                        <SelectContent>
                          {offerTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select onValueChange={(value) => handleInputChange('categoryId', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.icon} {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="price">Price (per person)</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="price"
                          type="number"
                          placeholder="0.00"
                          className="pl-10"
                          value={formData.price}
                          onChange={(e) => handleInputChange('price', e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="productLink">Product Link *</Label>
                      <Input
                        id="productLink"
                        type="url"
                        placeholder="https://example.com/product"
                        value={formData.productLink || ''}
                        onChange={(e) => handleInputChange('productLink', e.target.value)}
                        required
                      />
                      {formData.productLink && !isValidUrl(formData.productLink) && (
                        <p className="text-sm text-red-500 mt-1">Please enter a valid URL</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Tell others about this deal, any specific requirements, timing, etc."
                        rows={4}
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="address">Pickup Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="address"
                          placeholder="Click on the map to set location"
                          className="pl-10"
                          value={formData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? "Posting..." : "Post Deal Request"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Map Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Pickup Location
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Click on the map to set where others can meet you to collect the item
                  </p>
                </CardHeader>
                <CardContent>
                  <div 
                    ref={mapRef} 
                    className="w-full h-96 rounded-lg border border-border bg-muted"
                  />
                  {selectedLocation && (
                    <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                      <p className="text-sm font-medium text-foreground">Selected Location:</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PostPage;