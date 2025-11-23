import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
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

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
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
                <Route path="/about" element={<About />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
            <Toaster />
          </div>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
