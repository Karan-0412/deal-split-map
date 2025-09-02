import { motion, useInView } from "framer-motion";
import { useState, useRef } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Search, Plus, Users, CreditCard, Package, ChevronRight, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const steps = [
  {
    id: 1,
    title: "Search Product",
    description: "Browse categories or search for the item you want to buy",
    icon: Search,
    color: "from-blue-500 to-blue-600",
    delay: 0.1
  },
  {
    id: 2,
    title: "Create/Post Request",
    description: "If product has 'Buy 1 Get 1' or bulk discount, post a request to share it",
    icon: Plus,
    color: "from-green-500 to-green-600",
    delay: 0.2
  },
  {
    id: 3,
    title: "Get Matched",
    description: "System matches you with another user who wants the same deal",
    icon: Users,
    color: "from-purple-500 to-purple-600",
    delay: 0.3
  },
  {
    id: 4,
    title: "Split Payment",
    description: "Both users pay their share (typically 50% each)",
    icon: CreditCard,
    color: "from-orange-500 to-orange-600",
    delay: 0.4
  },
  {
    id: 5,
    title: "Collect Product",
    description: "Both users benefit from the offer and save money together",
    icon: Package,
    color: "from-pink-500 to-pink-600",
    delay: 0.5
  }
];

const HowItWorksPage = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.2 });

  const handleStepClick = (stepId: number) => {
    setActiveStep(stepId);
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
  };

  const handleNextStep = () => {
    if (activeStep < steps.length) {
      const nextStep = activeStep + 1;
      setActiveStep(nextStep);
      if (!completedSteps.includes(activeStep)) {
        setCompletedSteps([...completedSteps, activeStep]);
      }
    }
  };

  const handlePrevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/50 to-primary/5">
      <Navigation />
      
      <main className="py-20">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl font-bold text-foreground mb-6">
              How It Works
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Follow our interactive roadmap to start saving money on deals today!
            </p>
            <div className="mt-8 flex justify-center space-x-4">
              <Button
                onClick={handlePrevStep}
                disabled={activeStep === 1}
                variant="outline"
                size="sm"
              >
                Previous Step
              </Button>
              <Button
                onClick={handleNextStep}
                disabled={activeStep === steps.length}
                size="sm"
              >
                Next Step
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>

          {/* Interactive Roadmap */}
          <div ref={containerRef} className="max-w-6xl mx-auto">
            {/* Progress Line */}
            <div className="relative mb-16">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-muted rounded-full transform -translate-y-1/2" />
              <motion.div
                initial={{ width: 0 }}
                animate={{ 
                  width: isInView ? `${((activeStep - 1) / (steps.length - 1)) * 100}%` : 0 
                }}
                transition={{ duration: 1, ease: "easeInOut" }}
                className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-primary to-primary/80 rounded-full transform -translate-y-1/2"
              />
              
              {/* Step Markers */}
              <div className="relative flex justify-between">
                {steps.map((step, index) => {
                  const isActive = step.id === activeStep;
                  const isCompleted = completedSteps.includes(step.id) || step.id < activeStep;
                  
                  return (
                    <motion.button
                      key={step.id}
                      onClick={() => handleStepClick(step.id)}
                      className={`w-12 h-12 rounded-full border-4 flex items-center justify-center font-bold transition-all duration-300 ${
                        isActive
                          ? 'bg-primary text-primary-foreground border-primary scale-125 shadow-lg'
                          : isCompleted
                          ? 'bg-green-500 text-white border-green-500'
                          : 'bg-background text-muted-foreground border-muted hover:border-primary/50'
                      }`}
                      whileHover={{ scale: isActive ? 1.25 : 1.1 }}
                      whileTap={{ scale: isActive ? 1.15 : 1.05 }}
                    >
                      {isCompleted && step.id < activeStep ? '✓' : step.id}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Active Step Details */}
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              {steps.map((step) => {
                if (step.id !== activeStep) return null;
                
                return (
                  <motion.div
                    key={step.id}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, type: "spring" }}
                  >
                    <Card className="glass-card max-w-2xl mx-auto">
                      <CardContent className="p-12">
                        <motion.div
                          className={`w-20 h-20 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center mx-auto mb-6`}
                          whileHover={{ scale: 1.1, rotate: 360 }}
                          transition={{ duration: 0.6 }}
                        >
                          <step.icon className="w-10 h-10 text-white" />
                        </motion.div>
                        <h2 className="text-4xl font-bold text-foreground mb-4">
                          {step.title}
                        </h2>
                        <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                          {step.description}
                        </p>
                        
                        {/* Navigation Arrows */}
                        <div className="flex justify-between items-center">
                          <Button
                            onClick={handlePrevStep}
                            disabled={activeStep === 1}
                            variant="ghost"
                            size="lg"
                          >
                            ← Previous
                          </Button>
                          
                          <div className="text-sm text-muted-foreground">
                            Step {activeStep} of {steps.length}
                          </div>
                          
                          <Button
                            onClick={handleNextStep}
                            disabled={activeStep === steps.length}
                            size="lg"
                          >
                            Next →
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Connecting Arrows Animation */}
            <div className="flex justify-center space-x-8 mb-12">
              {steps.slice(0, -1).map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ 
                    opacity: index < activeStep - 1 ? 1 : 0.3,
                    x: 0 
                  }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center"
                >
                  <ArrowRight className={`w-6 h-6 ${index < activeStep - 1 ? 'text-primary' : 'text-muted-foreground'}`} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mt-16"
          >
            <div className="glass-card max-w-2xl mx-auto p-8">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Ready to Start Your Journey?
              </h2>
              <p className="text-muted-foreground mb-6">
                You've seen how easy it is! Start browsing deals or post your own request.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.a
                  href="/categories"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Browse Categories
                </motion.a>
                <motion.a
                  href="/post"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center px-6 py-3 glass border border-primary/20 text-foreground rounded-lg font-semibold hover:bg-primary/5 transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Post a Deal
                </motion.a>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default HowItWorksPage;