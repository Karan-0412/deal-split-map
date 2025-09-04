import { Card, CardContent } from "@/components/ui/card";
import { Shield, Star, Receipt, Users } from "lucide-react";

const TrustSection = () => {
  const trustFeatures = [
    {
      icon: Shield,
      title: "Secure Escrow",
      description: "Your money is protected until both parties confirm the successful transaction.",
      color: "text-primary"
    },
    {
      icon: Star,
      title: "Verified Ratings",
      description: "All users are rated and reviewed. Build trust through transparent feedback.",
      color: "text-accent"
    },
    {
      icon: Receipt,
      title: "Digital Receipts",
      description: "Every transaction is documented with digital receipts for complete transparency.",
      color: "text-primary"
    },
    {
      icon: Users,
      title: "Community Safety",
      description: "Meet in public spaces with our suggested safe meeting locations nearby.",
      color: "text-accent"
    }
  ];

  return (
    <section id="security" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
            How we protect you
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your safety and security are our top priority. We've built multiple layers of protection.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustFeatures.map((feature, index) => (
            <Card key={index} className="shadow-card hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 border-border text-center">
              <CardContent className="p-6">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-background shadow-soft mb-4 ${feature.color}`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  {feature.title}  
                </h3>
                
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Statistics */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">99.8%</div>
            <div className="text-muted-foreground">Successful matches</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-accent mb-2">$2.1M+</div>
            <div className="text-muted-foreground">Protected in escrow</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">50K+</div>
            <div className="text-muted-foreground">Happy users</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;