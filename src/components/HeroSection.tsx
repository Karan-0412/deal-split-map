import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import Scene3D from "./Scene3D";
import { Suspense } from "react";

const HeroSection = () => {
  return (
    <section className="py-20 lg:py-32 relative overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 opacity-20">
        <Suspense fallback={null}>
          <Scene3D />
        </Suspense>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
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

          {/* Right Content - 3D Interactive Model */}
          <div className="relative">
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden glass-card">
              {/* 3D Model */}
              <div className="absolute inset-0">
                <Suspense fallback={
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
                  </div>
                }>
                  <Scene3D />
                </Suspense>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute top-4 right-4 w-12 h-12 glass rounded-full flex items-center justify-center animate-bounce delay-100">
                <span className="text-accent font-bold text-sm">50%</span>
              </div>
              
              <div className="absolute bottom-4 left-4 w-10 h-10 glass rounded-full flex items-center justify-center animate-bounce delay-300">
                <span className="text-primary font-bold text-xs">+1</span>
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