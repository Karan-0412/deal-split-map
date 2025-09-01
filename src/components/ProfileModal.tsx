import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin, Edit, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Profile {
  display_name: string;
  bio: string;
  avatar_url: string;
  city: string;
  rating: number;
  total_ratings: number;
}

const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && user) {
      fetchProfile();
    }
  }, [isOpen, user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setProfile(data);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4 py-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="text-lg">
              {profile?.display_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="text-center space-y-2">
            <h3 className="font-semibold text-lg">
              {profile?.display_name || user.email}
            </h3>
            
            {profile?.bio && (
              <p className="text-muted-foreground text-sm">{profile.bio}</p>
            )}

            {profile?.city && (
              <div className="flex items-center justify-center text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mr-1" />
                {profile.city}
              </div>
            )}

            {profile && profile.total_ratings > 0 && (
              <div className="flex items-center justify-center space-x-1">
                <Star className="w-4 h-4 fill-accent text-accent" />
                <span className="font-medium">{profile.rating.toFixed(1)}</span>
                <span className="text-muted-foreground text-sm">
                  ({profile.total_ratings} reviews)
                </span>
              </div>
            )}
          </div>

          <div className="w-full space-y-2">
            <Button variant="outline" className="w-full" disabled>
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile (Coming Soon)
            </Button>
            <Button variant="outline" onClick={handleSignOut} className="w-full">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;