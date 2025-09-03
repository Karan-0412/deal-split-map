import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
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
}: any) => {
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
  const navigate = useNavigate();

  const [thought, setThought] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isDinging, setIsDinging] = useState(false);
  const isDingingRef = useRef(false);

  useEffect(() => {
    const handler = () => {
      if (isDingingRef.current) return;
      isDingingRef.current = true;
      setIsDinging(true);

      // Ding sound via Web Audio API
      try {
        const ctx = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.value = 880; // A5
        osc.connect(gain);
        gain.connect(ctx.destination);
        const now = ctx.currentTime;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
        setTimeout(() => ctx.close(), 800);
      } catch (e) {
        console.log("Audio init error", e);
      }

      setTimeout(() => {
        isDingingRef.current = false;
        setIsDinging(false);
      }, 1800);
    };

    window.addEventListener("bogo:new-message", handler as EventListener);
    return () =>
      window.removeEventListener("bogo:new-message", handler as EventListener);
  }, []);

  const cuteMessages = [
    "Hehe 😋, nice to see you!",
    "Wanna share a deal today?",
    "Let's split some savings! 💰",
    "Ready for some BOGO magic? ✨",
    "I love finding great deals! 🛍️",
    "Split & save together! 🤝",
    "Your deal buddy is here! 👋",
  ];

  const handleMeetBOGO = () => {
    const randomMessage =
      cuteMessages[Math.floor(Math.random() * cuteMessages.length)];
    setThought(randomMessage);
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
    const randomMessage =
      cuteMessages[Math.floor(Math.random() * cuteMessages.length)];
    setThought(randomMessage);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setThought(null);
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
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{
              opacity: 1,
              y: -120,
              scale: 1,
              transition: {
                type: "spring",
                damping: 15,
                stiffness: 100,
                y: { type: "spring", damping: 20, stiffness: 200 },
              },
            }}
            exit={{
              opacity: 0,
              y: 10,
              scale: 0.8,
              transition: { duration: 0.3, ease: "easeInOut" },
            }}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 z-50"
          >
            <motion.div
              className="relative bg-gradient-to-r from-white/40 to-white/20 backdrop-blur-lg text-white text-sm px-6 py-3 rounded-2xl shadow-2xl max-w-xs text-center border border-white/30"
              animate={
                isHovering
                  ? {
                      y: [0, -5, 0],
                      transition: {
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      },
                    }
                  : {}
              }
            >
              {thought}
              <motion.span
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-gradient-to-r from-white/40 to-white/20 rounded-full border border-white/20"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
              />
              <motion.span
                className="absolute -bottom-7 left-1/2 -translate-x-[40%] w-3 h-3 bg-gradient-to-r from-white/30 to-white/15 rounded-full"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
              />
              <motion.span
                className="absolute -bottom-11 left-1/2 -translate-x-[60%] w-2 h-2 bg-gradient-to-r from-white/20 to-white/10 rounded-full"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Content */}
      <div className="relative z-30 flex flex-col items-center justify-end text-center h-full px-6 pb-20">
        {isDinging && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.08, 1], opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 rounded-full bg-primary/20 ring-2 ring-primary/30 px-4 py-1 text-xs"
          >
            Ding!
          </motion.div>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-baseline">
          <Button
            variant="hero"
            size="xl"
            className="group"
            onClick={handleMeetBOGO}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            Meet BOGO
            <ArrowRight className="ml-3 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
          </Button>

          {/* ===== Live Demo Button ===== */}
          <Button
            variant="outline"
            size="xl"
            onClick={() => navigate("/live-demo")}
          >
            <Play className="mr-2 h-4 w-4" />
            Live Demo
          </Button>
        </div>
      </div>

      <div className="absolute bottom-6 left-6 z-30 text-xs text-white/50">
        © CoOrder
      </div>
    </section>
  );
}
