import { Toaster } from "@/components/ui/toaster";
import React from 'react';
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { NotificationsProvider, useNotificationsContext } from "@/hooks/useNotifications";
import { NotificationPopup } from "@/components/NotificationPopup";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import MapPage from "./pages/MapPage";
import ChatPage from "./pages/ChatPage";
import CategoriesPage from "./pages/CategoriesPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import PostPage from "./pages/PostPage";
import ProfilePage from "./pages/ProfilePage";
import LiveDemoPage from "./pages/LiveDemoPage";
import AboutPage from "./pages/AboutPage";
import HelpPage from "./pages/HelpPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Contact from "./pages/ContactPage";
import NotFound from "./pages/NotFound";

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  React.useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      // Delay to ensure target element exists after route change
      requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  }, [pathname, hash]);
  return null;
};

const queryClient = new QueryClient();

const AppContent = () => {
  const { activeNotification, dismissNotification, handleReply } = useNotificationsContext();

  return (
    <>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/post" element={<PostPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/live-demo" element={<LiveDemoPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/policy" element={<PrivacyPolicy />} />
          {/* Catch-all route MUST be last */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>

      {activeNotification && (
        <NotificationPopup
          isVisible={!!activeNotification}
          onClose={dismissNotification}
          sender={{
            id: activeNotification.senderId,
            name: activeNotification.senderName,
            avatar: activeNotification.senderAvatar,
          }}
          message={activeNotification.message}
          onReply={handleReply}
        />
      )}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <NotificationsProvider>
          <AppContent />
        </NotificationsProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
