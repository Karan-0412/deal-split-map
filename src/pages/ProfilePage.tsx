import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Mail, 
  MapPin, 
  Star, 
  Package, 
  MessageCircle, 
  Edit, 
  Eye, 
  Trash2,
  Calendar,
  LogOut
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://khlvxxjjezllxrmfchob.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtobHZ4eGpqZXpsbHhybWZjaG9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NDQ0NzUsImV4cCI6MjA3MjMyMDQ3NX0.7j8pC0TRGoMq7JkgR0gS8wc6yp6i-Bz5mELwyccZwEA";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

interface Profile {
  id: string;
  username: string;
  email: string;
  bio?: string;
  avatar_url?: string;
  rating?: number;
  total_ratings?: number;
  city?: string;
  created_at?: string;
}

interface UserPost {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'matched' | 'completed' | 'cancelled';
  created_at: string;
  budget_min: number;
  budget_max: number;
  address: string;
}

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'all'>('active');

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
      fetchUserPosts();
    }
  }, [user]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });

      navigate('/');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: "Logout Error",
        description: error.message || "Failed to log out",
        variant: "destructive"
      });
    } finally {
      setLoggingOut(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const {
        data: { user: authUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !authUser) {
        console.error("Error fetching user:", userError);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error.message);
        // Fallback to auth user data if profile doesn't exist
        const fallbackProfile: Profile = {
          id: authUser.id,
          username: authUser.user_metadata?.display_name || 'Demo User',
          email: authUser.email || 'demo@example.com',
        };
        setProfile(fallbackProfile);
      } else {
        // Transform the data to match your Profile interface
        const transformedProfile: Profile = {
          id: data.id,
          username: data.display_name || authUser.user_metadata?.display_name || 'Demo User',
          email: authUser.email || 'demo@example.com',
          bio: data.bio,
          avatar_url: data.avatar_url,
          rating: data.rating || 4.8,
          total_ratings: data.total_ratings || 27,
          city: data.city || 'San Francisco, CA',
          created_at: data.created_at,
        };
        setProfile(transformedProfile);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
  if (!user?.id) return;

  try {
    setLoading(true);

    const { data, error } = await supabase
      .from("requests") // or "posts" if your table name is different
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error);
      toast({
        title: "Error",
        description: "Failed to fetch your posts",
        variant: "destructive"
      });
      return;
    }

    if (data) {
      // Map Supabase data to UserPost interface
      const mappedPosts: UserPost[] = data.map((post: any) => ({
        id: post.id,
        title: post.title,
        description: post.description,
        status: post.status,
        created_at: post.created_at,
        budget_min: post.budget_min,
        budget_max: post.budget_max,
        address: post.address,
      }));
      setUserPosts(mappedPosts);
    }
  } catch (error) {
    console.error("Error fetching user posts:", error);
  } finally {
    setLoading(false);
  }
};


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'matched': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'completed': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const filteredPosts = userPosts.filter(post => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return post.status === 'active';
    if (activeTab === 'completed') return post.status === 'completed';
    return true;
  });

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/50 to-primary/5">
        <Navigation />
        <main className="py-20">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded mb-4"></div>
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/50 to-primary/5">
      <Navigation />
      
      <main className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-1"
            >
              <Card className="glass-card">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <Avatar className="w-24 h-24 mx-auto mb-4">
                      <AvatarImage src={profile.avatar_url} />
                      <AvatarFallback className="text-xl">
                        {profile.username.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="text-2xl font-bold text-foreground">{profile.username}</h2>
                    <p className="text-muted-foreground flex items-center justify-center mt-1">
                      <Mail className="w-4 h-4 mr-2" />
                      {profile.email}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Rating</span>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="font-semibold">{profile.rating || 4.8}</span>
                        <span className="text-muted-foreground text-sm ml-1">
                          ({profile.total_ratings || 27} reviews)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Location</span>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{profile.city || 'San Francisco, CA'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Member Since</span>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">
                          {profile.created_at 
                            ? new Date(profile.created_at).toLocaleDateString('en-US', { 
                                month: 'long', 
                                year: 'numeric' 
                              })
                            : 'January 2024'
                          }
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total Posts</span>
                      <Badge variant="secondary">{userPosts.length}</Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Completed Deals</span>
                      <Badge variant="secondary">
                        {userPosts.filter(post => post.status === 'completed').length}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 mt-6">
                    <Button className="w-full">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button variant="outline" className="w-full">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      My Chats
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="w-full"
                      onClick={handleLogout}
                      disabled={loggingOut}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {loggingOut ? 'Logging out...' : 'Logout'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Posts Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    My Posts
                  </CardTitle>
                  
                  {/* Tab Navigation */}
                  <div className="flex space-x-1 bg-muted/30 p-1 rounded-lg w-fit">
                    {[
                      { key: 'active', label: 'Active' },
                      { key: 'completed', label: 'Completed' },
                      { key: 'all', label: 'All' }
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as any)}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                          activeTab === tab.key
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-muted rounded mb-2"></div>
                          <div className="h-3 bg-muted rounded w-2/3"></div>
                        </div>
                      ))}
                    </div>
                  ) : filteredPosts.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No posts found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredPosts.map((post) => (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border border-border rounded-lg p-4 hover:bg-muted/20 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground mb-1">
                                {post.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                {post.description}
                              </p>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <MapPin className="w-3 h-3 mr-1" />
                                {post.address}
                              </div>
                            </div>
                            <Badge className={getStatusColor(post.status)}>
                              {post.status}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span>${post.budget_min} per person</span>
                              <span>•</span>
                              <span>{new Date(post.created_at).toLocaleDateString()}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="ghost">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
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

export default ProfilePage;