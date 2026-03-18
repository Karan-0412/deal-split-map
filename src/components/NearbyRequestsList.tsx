import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, MessageCircle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { useNavigate } from 'react-router-dom';
import { useGroupChat } from '@/hooks/useGroupChat';
import { useToast } from '@/hooks/use-toast';
import { navigateToSmartChat } from '@/utils/smartChatNavigation';

type Request = Database["public"]["Tables"]["requests"]["Row"] & {
  categories: Database["public"]["Tables"]["categories"]["Row"];
};

interface NearbyRequestsListProps {
  requests: Request[];
  userLocation: { lat: number; lng: number } | null;
  maxVisible?: number;
}

const NearbyRequestsList: React.FC<NearbyRequestsListProps> = ({
  requests,
  userLocation,
  maxVisible = 3
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [joiningRequest, setJoiningRequest] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const navigate = useNavigate();
  const { joinRequest } = useGroupChat();
  const { toast } = useToast();

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

  const visibleRequests = isExpanded ? requests : requests.slice(0, maxVisible);
  const remainingCount = requests.length - maxVisible;

  const handleJoinRequest = async (requestId: string) => {
    if (joiningRequest) return; // Prevent multiple clicks
    
    setJoiningRequest(requestId);
    
    try {
      const chatRoomId = await joinRequest(requestId);
      
      toast({
        title: "Successfully joined request!",
        description: "You've been added to the group chat for this request."
      });
      
      // Navigate to the group chat
      navigate(`/chat?roomId=${chatRoomId}`);
      
    } catch (error: any) {
      console.error('Error joining request:', error);
      
      toast({
        title: "Failed to join request",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setJoiningRequest(null);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Nearby Requests ({requests.length})
      </h3>
      
      <div className="max-h-[400px] overflow-y-auto scrollbar-hide space-y-3 pr-2">
        {visibleRequests.map((request) => {
          const distance = userLocation && request.location_lat && request.location_lng
            ? calculateDistance(
                userLocation.lat,
                userLocation.lng,
                Number(request.location_lat),
                Number(request.location_lng)
              )
            : null;

          return (
            <Card key={request.id} className="hover:shadow-lg transition-all duration-300 border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold relative overflow-hidden"
                    style={{ 
                      background: `linear-gradient(135deg, ${request.categories?.color || '#22c55e'} 0%, ${request.categories?.color || '#22c55e'}80 100%)`
                    }}
                  >
                    <span className="text-lg relative z-10">{request.categories?.icon || '📦'}</span>
                    <div 
                      className="absolute inset-0 opacity-20"
                      style={{ 
                        background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 50%)`
                      }}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-foreground truncate">
                          {request.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          ${request.budget_min} - ${request.budget_max}
                        </p>
                      </div>
                      
                      {distance && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3 text-primary" />
                          <span className="font-medium">{distance.toFixed(1)} mi</span>
                        </div>
                      )}
                    </div>
                    
                    {request.categories && (
                      <span 
                        className="inline-block px-2 py-1 rounded-full text-xs mt-2 text-white"
                        style={{ backgroundColor: `${request.categories.color || '#22c55e'}30`, color: request.categories.color || '#22c55e' }}
                      >
                        {request.categories.name}
                      </span>
                    )}
                    
                    {request.product_link && (
                      <div className="mt-2 mb-1">
                        <Button 
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => window.open(request.product_link!, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3 mr-2" />
                          View Product
                        </Button>
                      </div>
                    )}
                    
                    <div className="flex gap-2 mt-3">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={() => handleJoinRequest(request.id)}
                        disabled={joiningRequest === request.id}
                      >
                        {joiningRequest === request.id ? 'Joining...' : 'Join Request'}
                        <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded">
                          1/{request.people_required || 2}
                        </span>
                      </Button>
    <Button
      size="sm"
      variant="outline"
      className="border-border/50 hover:bg-accent"
      disabled={isNavigating}
      onClick={async () => {
        if (isNavigating) return;
        setIsNavigating(true);
        try {
          await navigateToSmartChat(request.id, navigate);
        } finally {
          setIsNavigating(false);
        }
      }}
    >
      <MessageCircle className="w-4 h-4" />
    </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {remainingCount > 0 && (
        <Button
          variant="ghost"
          className="w-full mt-4 text-muted-foreground hover:text-foreground"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="flex items-center gap-2">
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                +{remainingCount} more requests nearby
              </>
            )}
          </span>
        </Button>
      )}
    </div>
  );
};

export default NearbyRequestsList;