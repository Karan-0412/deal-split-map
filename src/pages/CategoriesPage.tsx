import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { 
  Smartphone, 
  Shirt, 
  ShoppingCart, 
  Car, 
  Home, 
  Book,
  Gamepad2,
  Heart,
  Music,
  Palette
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  created_at: string;
}

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const iconMap: Record<string, any> = {
    Electronics: Smartphone,
    Fashion: Shirt,
    Groceries: ShoppingCart,
    Automotive: Car,
    Home: Home,
    Books: Book,
    Gaming: Gamepad2,
    Health: Heart,
    Music: Music,
    Art: Palette,
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Browse Categories
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find the perfect deal sharing opportunity in your favorite category
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="glass-card">
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="w-12 h-12 bg-muted rounded-lg mb-4"></div>
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((category) => {
                const IconComponent = iconMap[category.name] || ShoppingCart;
                return (
                  <Card 
                    key={category.id} 
                    className="glass-card hover:glass cursor-pointer transition-all duration-300 group"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
                          style={{ backgroundColor: category.color || 'hsl(var(--primary))' }}
                        >
                          <IconComponent 
                            className="w-6 h-6 text-white" 
                          />
                        </div>
                        <Badge variant="secondary" className="glass">
                          New
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors">
                        {category.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Find deals and share costs with others in {category.name.toLowerCase()}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {!loading && categories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No categories available yet.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CategoriesPage;