import React from "react";
import Spline from "@splinetool/react-spline";
import { ArrowRight, Play } from "lucide-react";

// Minimal Button
const Button = ({ children, variant = "default", size = "md", className = "", ...props }) => {
  const base = "inline-flex items-center justify-center rounded-full font-semibold focus:outline-none";
  const sizes = { xl: "px-6 py-3 text-lg", md: "px-4 py-2 text-sm" };
  const variants = {
    hero: "bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 text-white shadow-2xl",
    outline: "border border-white/20 bg-black/30 text-white",
    default: "bg-white/5 text-white",
  };
  return (
    <button className={`${base} ${sizes[size] || sizes.md} ${variants[variant] || variants.default} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default function HeroSection() {
  return (
    <section className="relative w-full h-screen overflow-hidden bg-black text-white">
      {/* ==== FULLSCREEN SPLINE BACKGROUND ==== */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Spline
          scene="https://prod.spline.design/gAmyNu9DoS3WPoCT/scene.splinecode"
          className="w-full h-full"
        />
      </div>

      {/* Navbar above the model */}
      {/* <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-8 py-4 bg-transparent">
        <div className="text-lg font-bold tracking-wider">NEXORA</div>
        <nav className="hidden md:flex gap-8 text-sm text-white/80">
          <a className="hover:text-white">About</a>
          <a className="hover:text-white">Products</a>
          <a className="hover:text-white">Pricing</a>
          <a className="hover:text-white">Contact</a>
        </nav>
      </header> */}

      {/* Hero Content */}
      <div className="relative z-30 flex flex-col items-center justify-end text-center h-full px-6 pb-20">

        <div className="flex flex-col sm:flex-row gap-4 justify-baseline">
          <Button variant="hero" size="xl" className="group">
            Get Started
            <ArrowRight className="ml-3 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="outline" size="xl">
            <Play className="mr-2 h-4 w-4" />
            Live Demo
          </Button>
        </div>
      </div>

      <div className="absolute bottom-6 left-6 z-30 text-xs text-white/50">© Nexora</div>
    </section>
  );
}