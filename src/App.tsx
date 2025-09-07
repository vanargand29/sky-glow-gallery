import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { SpeedInsights } from "@vercel/speed-insights/react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Sky from "./pages/Sky";
import SkyCategories from "./pages/SkyCategories";
import CategoryItems from "./pages/CategoryItems";
import SunlightItems from "./pages/SunlightItems";
import Games from "./pages/Roblox";
import GameItems from "./pages/GameItems";
import Review from "./pages/Review";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ScrollToTopWrapper = () => {
  useScrollToTop();
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <ScrollToTopWrapper />
          <div className="dark min-h-screen bg-background text-foreground">
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/sky" element={<Sky />} />
              <Route path="/sky/categories" element={<SkyCategories />} />
              <Route path="/sky/category/:categoryId" element={<CategoryItems />} />
              <Route path="/sky/sunlight" element={<SunlightItems />} />
              <Route path="/roblox" element={<Games />} />
              <Route path="/games" element={<Games />} />
              <Route path="/games/:gameId" element={<GameItems />} />
              <Route path="/review" element={<Review />} />
              
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
          </div>
          <SpeedInsights />
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
