import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import MapPage from "./pages/MapPage";
import ChatPage from "./pages/ChatPage";
import CategoriesPage from "./pages/CategoriesPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import PostPage from "./pages/PostPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationPopup } from "@/components/NotificationPopup";

const queryClient = new QueryClient();

const AppContent = () => {
  const { activeNotification, dismissNotification, handleReply } = useNotifications();

  return (
    <>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/post" element={<PostPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      
      {/* Global Notification Popup */}
      {activeNotification && (
        <NotificationPopup
          isVisible={!!activeNotification}
          onClose={dismissNotification}
          sender={{
            id: activeNotification.senderId,
            name: activeNotification.senderName,
            avatar: activeNotification.senderAvatar
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
        <AppContent />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
