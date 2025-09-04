import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Menu, X, MessageCircle } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import NotificationPanel from "./NotificationPanel";
import { generateAvatarColor } from "@/lib/avatar-utils";

// Navigation component with simplified auth

interface NavLinkProps {
  to: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const NavLink = ({ to, label, icon: Icon }: NavLinkProps) => {
  return (
    <Link to={to} className="relative group">
      <div className="flex items-center text-muted-foreground hover:text-foreground transition-colors duration-200">
        {Icon && <Icon className="w-4 h-4 mr-1" />}
        <span>{label}</span>
      </div>
      <motion.div
        className="absolute -bottom-1 left-0 h-0.5 bg-primary rounded-full"
        initial={{ width: 0 }}
        whileHover={{ width: "100%" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      />
    </Link>
  );
};

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/5 dark:bg-black/40 border-b border-border/20">
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
            <NavLink to="/" label="Home" />
            <NavLink to="/map" label="Map" />
            <NavLink to="/how-it-works" label="How it works" />
            <NavLink to="/categories" label="Categories" />
            {user && (
              <NavLink to="/chat" label="Chat" icon={MessageCircle} />
            )}
          </div>

          {/* Desktop Auth/User Section */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
            ) : user ? (
              <>
                {/* Notifications */}
                <NotificationPanel />

                {/* Profile Avatar */}
                <Link 
                  to="/profile"
                  className="flex items-center space-x-2 p-1 rounded-lg hover:bg-muted transition-colors"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback 
                      className="text-sm text-white font-semibold"
                      style={{ backgroundColor: generateAvatarColor(user.id) }}
                    >
                      {user.email?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
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
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-border"
          >
            <div className="flex flex-col space-y-4">
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link to="/map" className="text-muted-foreground hover:text-foreground transition-colors">
                Map
              </Link>
              <Link to="/how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                How it works
              </Link>
              <Link to="/categories" className="text-muted-foreground hover:text-foreground transition-colors">
                Categories
              </Link>
              {user && (
                <Link to="/chat" className="text-muted-foreground hover:text-foreground transition-colors flex items-center">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Chat
                </Link>
              )}

              <div className="flex flex-col space-y-2 pt-4 border-t border-border/20">
                {user ? (
                  <>
                    <div className="flex items-center justify-between">
                      <Link to="/profile" className="flex items-center justify-start space-x-2 p-2 text-muted-foreground hover:text-foreground transition-colors">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback 
                            className="text-xs text-white font-semibold"
                            style={{ backgroundColor: generateAvatarColor(user.id) }}
                          >
                            {user.email?.charAt(0)?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>Profile</span>
                      </Link>
                      <NotificationPanel />
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
          </motion.div>
        )}
      </div>

    </nav>
  );
};

export default Navigation;
