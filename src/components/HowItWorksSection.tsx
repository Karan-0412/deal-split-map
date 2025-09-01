import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Users, CheckCircle } from "lucide-react";

const HowItWorksSection = () => {
  const steps = [
    {
      icon: MessageSquare,
      title: "Post",
      description: "Share the deal you want to split - BOGO, bulk discounts, or multi-item offers",
      color: "text-primary"
    },
    {
      icon: Users,
      title: "Match",
      description: "Our algorithm finds nearby buyers interested in the same deal within minutes",
      color: "text-accent"
    },
    {
      icon: CheckCircle,
      title: "Share & Confirm",
      description: "Meet up, make the purchase together, and split the savings with escrow protection",
      color: "text-primary"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
            How it works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Split deals in three simple steps. Save money, meet neighbors, reduce waste.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="relative overflow-hidden shadow-card hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 bg-card border-border">
              <CardContent className="p-8 text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-background shadow-soft mb-6 ${step.color}`}>
                  <step.icon className="w-8 h-8" />
                </div>
                
                <h3 className="text-2xl font-semibold text-foreground mb-4">
                  {step.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>

                {/* Step Number */}
                <div className="absolute top-4 right-4 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">{index + 1}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Arrow Decorations for Desktop */}
        <div className="hidden md:flex justify-center items-center mt-8 gap-4">
          <div className="w-8 h-0.5 bg-gradient-to-r from-primary to-accent"></div>
          <div className="w-2 h-2 bg-accent rounded-full"></div>
          <div className="w-8 h-0.5 bg-gradient-to-r from-accent to-primary"></div>
          <div className="w-2 h-2 bg-primary rounded-full"></div>
          <div className="w-8 h-0.5 bg-gradient-to-r from-primary to-accent"></div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;