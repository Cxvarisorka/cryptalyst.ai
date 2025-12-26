import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Pages
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
// import Community from "@/pages/Community"; // MVP: disabled
import UserProfile from "@/pages/UserProfile";
import SocialFeed from "@/pages/SocialFeed";
import PostDetail from "@/pages/PostDetail";
import PortfolioView from "@/pages/PortfolioView";
import PriceAlerts from "@/pages/PriceAlerts";
import AdminPanel from "@/pages/AdminPanel";
import SubscriptionSuccess from "@/pages/SubscriptionSuccess";
import News from "@/pages/News";
// import Learn from "@/pages/Learn"; // MVP: disabled
// import CourseViewer from "@/pages/CourseViewer"; // MVP: disabled
import ScalpingAI from "@/pages/ScalpingAI";

function AppRouter() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/signin" element={<Signin />} />
      <Route path="/about" element={<About />} />
      <Route path="/pricing" element={<Pricing />} />
      {/* <Route path="/learn" element={<Learn />} /> */}{/* MVP: disabled */}
      <Route path="*" element={<NotFound />} />

      {/* Protected routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/crypto/:id" element={<ProtectedRoute><CryptoDetail /></ProtectedRoute>} />
      <Route path="/stock/:symbol" element={<ProtectedRoute><StockDetail /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      {/* <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} /> */}{/* MVP: disabled */}
      <Route path="/profile/:userId" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
      <Route path="/feed" element={<ProtectedRoute><SocialFeed /></ProtectedRoute>} />
      <Route path="/post/:postId" element={<ProtectedRoute><PostDetail /></ProtectedRoute>} />
      <Route path="/portfolio/:collectionId" element={<ProtectedRoute><PortfolioView /></ProtectedRoute>} />
      <Route path="/price-alerts" element={<ProtectedRoute><PriceAlerts /></ProtectedRoute>} />
      <Route path="/news" element={<ProtectedRoute><News /></ProtectedRoute>} />
      {/* <Route path="/learn/course/:courseId" element={<ProtectedRoute><CourseViewer /></ProtectedRoute>} /> */}{/* MVP: disabled */}
      <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
      <Route path="/scalping-ai" element={<ProtectedRoute><ScalpingAI /></ProtectedRoute>} />
      <Route path="/subscription/success" element={<ProtectedRoute><SubscriptionSuccess /></ProtectedRoute>} />
    </Routes>
  );
}

export default AppRouter;
