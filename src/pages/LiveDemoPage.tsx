import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const LiveDemoPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navigation />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold mb-6">Product Live Demo</h1>
          <p className="text-muted-foreground mb-8">
            Our live demo page is set up. Video will be added here soon.
          </p>
          <div className="w-full rounded-xl border border-dashed border-border p-8 text-center">
            Coming soon
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LiveDemoPage;


