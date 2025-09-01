import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import heroImage from "@/assets/hero-3d-placeholder.jpg";

const HeroSection = () => {
  return (
    <section className="py-20 lg:py-32 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Split the deal. <br />
              <span className="text-primary">Pay half, get one.</span>
            </h1>
            
            <p className="text-lg lg:text-xl text-muted-foreground mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0">
              Share BOGO and multi-buy offers with nearby buyers — post a request and we'll match you instantly.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button variant="hero" size="xl" className="group">
                Post a Share Request
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button variant="outline" size="xl">
                <Play className="mr-2 h-5 w-5" />
                Browse Nearby Requests
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 mt-12 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-accent rounded-full"></span>
                Secure escrow protection
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-accent rounded-full"></span>
                Verified users only
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-accent rounded-full"></span>
                Instant matching
              </div>
            </div>
          </div>

          {/* Right Content - 3D Model Placeholder */}
          <div className="relative">
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden shadow-card bg-gradient-to-br from-primary-light to-accent-light">
              {/* 3D_MODEL_HERO placeholder */}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-sm">
                <div className="text-center p-8">
                  <div className="text-2xl font-semibold text-foreground mb-2">
                    {/* 3D_MODEL_HERO: insert glTF viewer here */}
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Interactive 3D model (glTF) — click to rotate / expand
                  </p>
                  <div className="w-full h-48 bg-primary/5 rounded-lg border-2 border-dashed border-primary/20 flex items-center justify-center">
                    <img 
                      src={heroImage} 
                      alt="3D model placeholder showing deal sharing concept" 
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute top-4 right-4 w-12 h-12 bg-accent rounded-full flex items-center justify-center animate-bounce delay-100">
                <span className="text-accent-foreground font-bold text-sm">50%</span>
              </div>
              
              <div className="absolute bottom-4 left-4 w-10 h-10 bg-primary rounded-full flex items-center justify-center animate-bounce delay-300">
                <span className="text-primary-foreground font-bold text-xs">+1</span>
              </div>
            </div>

            {/* Background Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-accent/20 rounded-full blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-primary/20 rounded-full blur-xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;