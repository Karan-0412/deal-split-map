import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Menu, X, Bell, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import ProfileModal from "./ProfileModal";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchUnreadNotifications();
      subscribeToNotifications();
    }
  }, [user]);

  const fetchUnreadNotifications = async () => {
    if (!user) return;

    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    setUnreadNotifications(count || 0);
  };

  const subscribeToNotifications = () => {
    if (!user) return;

    const subscription = supabase
      .channel(`notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchUnreadNotifications();
        }
      )
      .subscribe();

    return () => subscription.unsubscribe();
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">DS</span>
            </div>
            <span className="font-bold text-lg text-foreground">DealSplit</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link to="/map" className="text-muted-foreground hover:text-foreground transition-colors">
              Map
            </Link>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
              How it works
            </a>
            {user && (
              <Link to="/chat" className="text-muted-foreground hover:text-foreground transition-colors flex items-center">
                <MessageCircle className="w-4 h-4 mr-1" />
                Chat
              </Link>
            )}
          </div>

          {/* Desktop Auth/User Section */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
            ) : user ? (
              <>
                {/* Notifications */}
                <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
                  <Bell className="w-5 h-5" />
                  {unreadNotifications > 0 && (
                    <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 text-xs bg-destructive text-destructive-foreground">
                      {unreadNotifications}
                    </Badge>
                  )}
                </button>
                
                {/* Profile Avatar */}
                <button 
                  onClick={() => setIsProfileOpen(true)}
                  className="flex items-center space-x-2 p-1 rounded-lg hover:bg-muted transition-colors"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-sm">
                      {user.email?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
                  Sign In
                </Button>
                <Button size="sm" onClick={() => navigate('/auth')}>
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link to="/map" className="text-muted-foreground hover:text-foreground transition-colors">
                Map
              </Link>
              <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                How it works
              </a>
              {user && (
                <Link to="/chat" className="text-muted-foreground hover:text-foreground transition-colors flex items-center">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Chat
                </Link>
              )}
              
              <div className="flex flex-col space-y-2 pt-4">
                {user ? (
                  <>
                    <div className="flex items-center justify-between">
                      <Button variant="ghost" size="sm" onClick={() => setIsProfileOpen(true)} className="justify-start">
                        <Avatar className="w-6 h-6 mr-2">
                          <AvatarFallback className="text-xs">
                            {user.email?.charAt(0)?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        Profile
                      </Button>
                      <button className="relative p-2 text-muted-foreground">
                        <Bell className="w-5 h-5" />
                        {unreadNotifications > 0 && (
                          <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 text-xs bg-destructive">
                            {unreadNotifications}
                          </Badge>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
                      Sign In
                    </Button>
                    <Button size="sm" onClick={() => navigate('/auth')}>
                      Sign Up
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
      />
    </nav>
  );
};

export default Navigation;