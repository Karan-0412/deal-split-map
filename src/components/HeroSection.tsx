import React, { useState } from "react";
import Spline from "@splinetool/react-spline";
import { ArrowRight, Play } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

// Minimal Button
const Button = ({
  children,
  variant = "default",
  size = "md",
  className = "",
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center rounded-full font-semibold focus:outline-none";
  const sizes = { xl: "px-6 py-3 text-lg", md: "px-4 py-2 text-sm" };
  const variants = {
    hero: "bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 text-white shadow-2xl",
    outline: "border border-white/20 bg-black/30 text-white",
    default: "bg-white/5 text-white",
  };

  return (
    <button
      className={`${base} ${sizes[size] || sizes.md} ${
        variants[variant] || variants.default
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default function HeroSection() {
  const [thought, setThought] = useState<string | null>(null);

  const handleMeetBOGO = () => {
    // Toggle bubble on click
    setThought((prev) => (prev ? null : "Hello!!, I am BOGO"));
  };

  return (
    <section className="relative w-full h-screen overflow-hidden bg-black text-white">
      {/* ==== FULLSCREEN SPLINE BACKGROUND ==== */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Spline
          scene="https://prod.spline.design/gAmyNu9DoS3WPoCT/scene.splinecode"
          className="w-full h-full"
        />
      </div>

      {/* ==== Thought Bubble ==== */}
      <AnimatePresence>
        {thought && (
          <motion.div
            key={thought}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: -120, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="relative bg-white/30 text-white text-sm px-4 py-2 rounded-2xl shadow-xl max-w-xs text-center">
              {thought}
              {/* Thought bubble tail */}
              <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/30 rounded-full"></span>
              <span className="absolute -bottom-7 left-1/2 -translate-x-[40%] w-3 h-3 bg-white/30 rounded-full"></span>
              <span className="absolute -bottom-11 left-1/2 -translate-x-[60%] w-2 h-2 bg-white/30 rounded-full"></span>
              <span className="absolute -bottom-14 left-1/2 -translate-x-[80%] w-[6px] h-[6px] bg-black/30 rounded-full"></span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Content */}
      <div className="relative z-30 flex flex-col items-center justify-end text-center h-full px-6 pb-20">
        <div className="flex flex-col sm:flex-row gap-4 justify-baseline">
          <Button
            variant="hero"
            size="xl"
            className="group"
            onClick={handleMeetBOGO}
          >
            Meet BOGO
            <ArrowRight className="ml-3 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="outline" size="xl">
            <Play className="mr-2 h-4 w-4" />
            Live Demo
          </Button>
        </div>
      </div>

      <div className="absolute bottom-6 left-6 z-30 text-xs text-white/50">
        © Nexora
      </div>
    </section>
  );
}
