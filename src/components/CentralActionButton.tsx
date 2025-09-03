import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const CentralActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleOptionClick = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className="fixed right-8 top-1/2 transform -translate-y-1/2 z-50">
      <div className="relative">
        {/* Main Get Started Button */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="glassmorphism-button relative overflow-hidden"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0,y: 250, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.5, 
            delay: 1.5,
            type: "spring",
            stiffness: 260,
            damping: 20 
          }}
        >
          {/* Glassmorphism background */}
          <div className="absolute inset-0 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl" />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-2xl" />
          
          {/* Content */}
          <div className="relative z-10 px-6 py-4 flex items-center space-x-3">
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <Sparkles className="w-6 h-6 text-white" />
            </motion.div>
            <span className="text-white font-semibold text-lg">Get Started</span>
          </div>
          
          {/* Animated border glow */}
          <motion.div
            className="absolute inset-0 rounded-2xl"
            style={{
              background: "linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent)",
            }}
            animate={{
              background: [
                "linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent)",
                "linear-gradient(135deg, transparent, rgba(255,255,255,0.3), transparent)",
                "linear-gradient(225deg, transparent, rgba(255,255,255,0.3), transparent)",
                "linear-gradient(315deg, transparent, rgba(255,255,255,0.3), transparent)",
                "linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        </motion.button>

        {/* Options Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 250, scale: 0.8 }}
              animate={{ opacity: 1, y: 250, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{ duration: 0.3, type: "spring" }}
              className="absolute bottom-full right-0 mb-4 w-64"
            >
              <div className="space-y-3">
                {/* Search Option */}
                <motion.button
                  onClick={() => handleOptionClick('/categories')}
                  className="w-full glassmorphism-card group"
                  whileHover={{ x: -8, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="absolute inset-0 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl" />
                  
                  <div className="relative z-10 p-4 flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <Search className="w-6 h-6 text-blue-300" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-white font-semibold">Search</h3>
                      <p className="text-white/70 text-sm">Browse deals & categories</p>
                    </div>
                  </div>
                  
                  {/* Hover glow effect */}
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-blue-400/0 group-hover:bg-blue-400/10 transition-colors duration-300"
                    initial={false}
                  />
                </motion.button>

                {/* Post Option */}
                <motion.button
                  onClick={() => handleOptionClick('/post')}
                  className="w-full glassmorphism-card group"
                  whileHover={{ x: -8, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="absolute inset-0 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg" />
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl" />
                  
                  <div className="relative z-10 p-4 flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                      <Plus className="w-6 h-6 text-green-300" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-white font-semibold">Post</h3>
                      <p className="text-white/70 text-sm">Share your deal finds</p>
                    </div>
                  </div>
                  
                  {/* Hover glow effect */}
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-green-400/0 group-hover:bg-green-400/10 transition-colors duration-300"
                    initial={false}
                  />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CentralActionButton;