import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WelcomeModal from "@/components/marketing/WelcomeModal";
import OnboardingWidget from "@/components/onboarding/OnboardingWidget";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import About from "@/pages/About";
import NotFound from "@/pages/NotFound";
import Pricing from "@/pages/Pricing";
import Signup from "@/pages/Signup";
import Signin from "@/pages/Signin";
import CryptoDetail from "@/pages/CryptoDetail";
import StockDetail from "@/pages/StockDetail";
import Settings from "@/pages/Settings";
import Community from "@/pages/Community";
import UserProfile from "@/pages/UserProfile";
import SocialFeed from "@/pages/SocialFeed";
import PostDetail from "@/pages/PostDetail";
import PortfolioView from "@/pages/PortfolioView";
import PriceAlerts from "@/pages/PriceAlerts";
import AdminPanel from "@/pages/AdminPanel";
import SubscriptionSuccess from "@/pages/SubscriptionSuccess";
import News from "@/pages/News";
import Learn from "@/pages/Learn";
import CourseViewer from "@/pages/CourseViewer";
import ScalpingAI from "@/pages/ScalpingAI";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <NotificationProvider>
            <div className="min-h-screen bg-background flex flex-col ">
              <Navbar />
              <main className="flex-1 bg-gradient-to-br from-background via-muted to-background">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/signin" element={<Signin />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/crypto/:id"
                  element={
                    <ProtectedRoute>
                      <CryptoDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/stock/:symbol"
                  element={
                    <ProtectedRoute>
                      <StockDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/community"
                  element={
                    <ProtectedRoute>
                      <Community />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile/:userId"
                  element={
                    <ProtectedRoute>
                      <UserProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/feed"
                  element={
                    <ProtectedRoute>
                      <SocialFeed />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/post/:postId"
                  element={
                    <ProtectedRoute>
                      <PostDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/portfolio/:collectionId"
                  element={
                    <ProtectedRoute>
                      <PortfolioView />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/price-alerts"
                  element={
                    <ProtectedRoute>
                      <PriceAlerts />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/news"
                  element={
                    <ProtectedRoute>
                      <News />
                    </ProtectedRoute>
                  }
                />
                <Route path="/learn" element={<Learn />} />
                <Route
                  path="/learn/course/:courseId"
                  element={
                    <ProtectedRoute>
                      <CourseViewer />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminPanel />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/scalping-ai"
                  element={
                    <ProtectedRoute>
                      <ScalpingAI />
                    </ProtectedRoute>
                  }
                />
                <Route path="/about" element={<About />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route
                  path="/subscription/success"
                  element={
                    <ProtectedRoute>
                      <SubscriptionSuccess />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
              <Footer />
              <OnboardingWidget />
              <WelcomeModal />
              <Toaster />
            </div>
          </NotificationProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
