import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Explore from "./pages/Explore";
import MyAchievements from "./pages/MyAchievements";
import SubmitAchievement from "./pages/SubmitAchievement";
import FacultyDashboard from "./pages/FacultyDashboard";
import Opportunities from "./pages/Opportunities";
import CreateOpportunity from "./pages/CreateOpportunity";
import Profile from "./pages/Profile";
import AchievementDetail from "./pages/AchievementDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/my-achievements" element={<MyAchievements />} />
            <Route path="/submit" element={<SubmitAchievement />} />
            <Route path="/faculty-dashboard" element={<FacultyDashboard />} />
            <Route path="/opportunities" element={<Opportunities />} />
            <Route path="/create-opportunity" element={<CreateOpportunity />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/achievements/:id" element={<AchievementDetail />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
