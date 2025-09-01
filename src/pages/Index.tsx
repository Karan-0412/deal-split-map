import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import LiveMapSection from "@/components/LiveMapSection";
import FeaturedMatches from "@/components/FeaturedMatches";
import TrustSection from "@/components/TrustSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <LiveMapSection />
        <FeaturedMatches />
        <TrustSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
