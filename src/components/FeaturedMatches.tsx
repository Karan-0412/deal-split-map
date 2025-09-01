import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock, TrendingUp } from "lucide-react";

const FeaturedMatches = () => {
  const featuredDeals = [
    {
      id: 1,
      title: "Apple AirPods Pro",
      originalPrice: "$249",
      splitPrice: "$124.50",
      savings: "$124.50",
      distance: "0.5 miles",
      timeLeft: "2h left",
      rating: 4.9,
      trending: true,
      category: "Electronics"
    },
    {
      id: 2,
      title: "Organic Grocery Bundle",
      originalPrice: "$89",
      splitPrice: "$44.50",
      savings: "$44.50",
      distance: "0.8 miles",
      timeLeft: "45m left",
      rating: 4.7,
      trending: false,
      category: "Groceries"
    },
    {
      id: 3,
      title: "Home Workout Set",
      originalPrice: "$159",
      splitPrice: "$79.50",
      savings: "$79.50",
      distance: "1.2 miles",
      timeLeft: "1h left",
      rating: 4.8,
      trending: true,
      category: "Fitness"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
            Featured matches & trending items
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Popular deals people are sharing right now. Join these high-demand requests quickly.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredDeals.map((deal) => (
            <Card key={deal.id} className="shadow-card hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 border-border overflow-hidden">
              <CardContent className="p-0">
                {/* Deal Image Placeholder */}
                <div className="aspect-[4/3] bg-gradient-to-br from-primary/10 to-accent/10 relative">
                  <div className="absolute inset-0 flex items-center justify-center text-6xl text-primary/20">
                    {deal.category === 'Electronics' && '📱'}
                    {deal.category === 'Groceries' && '🛒'}
                    {deal.category === 'Fitness' && '💪'}
                  </div>
                  
                  {/* Trending Badge */}
                  {deal.trending && (
                    <div className="absolute top-3 left-3 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Trending
                    </div>
                  )}

                  {/* Savings Badge */}
                  <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-bold">
                    Save {deal.savings}
                  </div>
                </div>

                {/* Deal Content */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {deal.title}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-2xl font-bold text-primary">{deal.splitPrice}</span>
                      <span className="text-sm text-muted-foreground ml-2 line-through">{deal.originalPrice}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-accent fill-current" />
                      <span className="text-sm font-medium text-foreground">{deal.rating}</span>
                    </div>
                  </div>

                  {/* Deal Info */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-6">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {deal.distance}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {deal.timeLeft}
                    </div>
                  </div>

                  <Button variant="hero" className="w-full">
                    Join this request
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            View all featured deals
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedMatches;